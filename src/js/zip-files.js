(function (obj) {

  let requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem

  function onerror (message) {
    alert(message)
  }

  function createTempFile (callback) {
    let tmpFilename = "tmp.dat"
    requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function (filesystem) {
      function create () {
        filesystem.root.getFile(tmpFilename, {
          create: true
        }, function (zipFile) {
          callback(zipFile)
        })
      }

      filesystem.root.getFile(tmpFilename, null, function (entry) {
        entry.remove(create, create)
      }, create)
    })
  }

  let model = (function () {
    let URL = obj.webkitURL || obj.mozURL || obj.URL

    return {
      getEntries: function (file, onend) {
        zip.createReader(new zip.BlobReader(file), function (zipReader) {
          zipReader.getEntries(onend)
        }, onerror)
      },
      getEntryFile: function (entry, creationMethod, onend, onprogress) {
        let writer, zipFileEntry

        function getData () {
          entry.getData(writer, function (blob) {
            let blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL()
            onend(blobURL)
          }, onprogress)
        }

        if (creationMethod == "Blob") {
          writer = new zip.BlobWriter()
          getData()
        } else {
          createTempFile(function (fileEntry) {
            zipFileEntry = fileEntry
            writer = new zip.FileWriter(zipFileEntry)
            getData()
          })
        }
      }
    }
  })();

  (function () {
    let $fileInput = document.getElementById("zipFile")
    let unzipProgress = document.createElement("progress")
    let fileList = document.getElementById("fileList")
    let creationMethodInput = document.getElementById("creation-method-input")

    function download (entry, li, a) {
      model.getEntryFile(entry, creationMethodInput.value, function (blobURL) {
        let clickEvent = document.createEvent("MouseEvent")
        if (unzipProgress.parentNode)
          unzipProgress.parentNode.removeChild(unzipProgress)
        unzipProgress.value = 0
        unzipProgress.max = 0
        clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.href = blobURL
        a.download = entry.filename
        a.dispatchEvent(clickEvent)
      }, function (current, total) {
        unzipProgress.value = current
        unzipProgress.max = total
        li.appendChild(unzipProgress)
      })
    }

    if (typeof requestFileSystem == "undefined")
      creationMethodInput.options.length = 1
    $fileInput.addEventListener('change', function () {
      $fileInput.disabled = true
      model.getEntries($fileInput.files[0], function (entries) {
        fileList.innerHTML = ""
        entries.forEach(function (entry) {
          let li = document.createElement("li")
          let a = document.createElement("a")
          a.textContent = entry.filename
          a.href = "#"
          a.addEventListener("click", function (event) {
            if (!a.download) {
              download(entry, li, a)
              event.preventDefault()
              return false
            }
          }, false)
          li.appendChild(a)
          fileList.appendChild(li)
        })
      })
    }, false)
  })()

})(this)
