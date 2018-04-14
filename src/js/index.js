import '../css/normalize.css'
import './lib/layui/css/layui.css'
import '../css/main.less'
import $ from 'jquery'
import axios from 'axios'
import './lib/layui/layui.all'
import analyzeJS from './lib/analyze'
import CoreJS from './lib/core'
window.analyzeJS = analyzeJS

// 验证登录
let iExTime = 2 * 24 * 60 * 60 * 1000
if (!localStorage.token || !localStorage.tokenCreateDate ||
  (+localStorage.tokenCreateDate + iExTime) < +new Date()) {
  location.href = './login.html'
}

const fn = {
  // 存储解析后数据
  rowData: [],
  rowRepetitionData: [],

  // 获取数据规则
  formatTarget: [
    {
      id: 'licenseNum',
      text: '车牌号',
      flag: '车牌号',
      minX: 50,
      minY: 1000
    },
    {
      id: 'createDate',
      text: '开票日期',
      flag: '开票日期',
      minX: 100,
      minY: 12,
      format: (text) => {
        return text.replace(/[年月]/g, '.').replace('日', '')
      }
    },
    {
      id: 'throughDateBegin',
      text: '通行日期起',
      flag: '通行日期起',
      minX: 10,
      minY: 0,
      format: (text) => {
        return text.substring(0, 4) + '.' + text.substring(4, 6) + '.' + text.substring(6, 8)
      }
    },
    {
      id: 'throughDateEnd',
      text: '通行日期止',
      flag: '通行日期止',
      minX: 10,
      minY: 0,
      format: (text) => {
        return text.substring(0, 4) + '.' + text.substring(4, 6) + '.' + text.substring(6, 8)
      }
    },
    {
      id: 'invoiceCode',
      text: '发票代码',
      flag: '发票代码',
      minX: 100,
      minY: 12
    },
    {
      id: 'invoiceId',
      text: '发票号码',
      flag: '发票号码',
      minX: 50,
      minY: 12
    },
    {
      id: 'buyName',
      text: '购方名称', //
      flag: '名称:',
      minX: 50,
      minY: 12
    },
    {
      id: 'sellerName',
      text: '销方名称', //
      flag: '名称:',
      minX: 50,
      minY: 12
    },
    {
      id: 'unTaxMoney',
      text: '未税金额',
      flag: '金额',
      minX: 50,
      minY: 0
    },
    {
      id: 'taxMoney',
      text: '进项税额',
      flag: '税额',
      minX: 50,
      minY: 0,
      validate: (val) => {
        return /^[\d|\.{0,1}]*$/i.test(val)
      },
      default: '0'
    },
    {
      id: 'taxCount',
      text: '价税合计',
      flag: '小写',
      minX: 50,
      minY: 12,
      validate: (val) => {
        return /^[\d|\.{0,1}]*$/i.test(val)
      }
    },
    {
      id: 'taxPercent',
      text: '税率',
      flag: '税率',
      minX: 20,
      minY: 0,
      format: (val) => {
        return val.replace(/不征税/g, '0%')
      },
      default: '0%'
    }
  ],

  // 渲染表格
  renderTable () {
    setTimeout(() => {
      this.endLoading()
    }, 200)
    layui.table.render({
      elem: '#dataTable',
      id: 'dataTable',
      limit: '100',
      height: $('.data-wrapper').height(),
      cols: [[ //表头
        {type: 'checkbox', width:60, fixed: 'left', templet: function(item) {
            return `<input type="checkbox" ${item.isRepetition ? "disabled" : ''} />123123`
          }
        },
        {type: 'numbers', title: '序号', width:60, fixed: 'left'},
        {field: 'licenseNum', title: '车牌号', width:120, fixed: 'left'},
        {field: 'createDate', title: '开票日期', width:150},
        {field: 'throughDateBegin', title: '通行日期起', width:130},
        {field: 'throughDateEnd', title: '通行日期止', width:130},
        {field: 'invoiceCode', title: '发票代码', width:200},
        {field: 'invoiceId', title: '发票号码', width:120},
        {field: 'buyName', title: '购方名称', width:300},
        {field: 'sellerName', title: '销方名称', width:300},
        {field: 'unTaxMoney', title: '未税金额', width:100},
        {field: 'taxMoney', title: '进项税额', width:100},
        {field: 'taxCount', title: '税价合计', width:100},
        {field: 'taxPercent', title: '税率'},
        {fixed: 'right', event: 'delete', width:60, align:'center', toolbar: '#tableTool'} //这里的toolbar值是模板元素的选择器
      ]],
      limits: [100, 200, 500, 1000],
      data: fn.rowData,
      page: true
    })
    // 全选设置
    layui.table.on('checkbox(pdfData)', function(obj){
      if (obj.type === 'all') {
        fn.rowData.map(item => {if(item.isRepetition) item.LAY_CHECKED = obj.checked})
      }
    })
    layui.table.on('tool(pdfData)', function(obj){
      if (obj.event === 'delete') {
        obj.del()
        fn.rowData.map((item, i) => {
          if (item.id === obj.data.id) fn.rowData.splice(i, 1)
        })
        fn.afreshStatisticsData()
        // layui.table.reload('dataTable')
       /* layer.confirm('确认删除该行数据吗', function(index){
          obj.del() //删除对应行（tr）的DOM结构，并更新缓存
          layer.close(index)
        }) */
      }
    })

  },

  // 导出数据
  exportData () {
    let aData = []
    fn.rowData.map(item => {
      if (item.LAY_CHECKED && !item.isRepetition) {
        aData.push([
          item['licenseNum'],
          item['createDate'],
          item['throughDateBegin'],
          item['throughDateEnd'],
          item['invoiceCode'],
          item['invoiceId'],
          item['buyName'],
          item['sellerName'],
          item['unTaxMoney'],
          item['taxMoney'],
          item['taxCount'],
          item['taxPercent']
        ])
      }
    })
    if (aData.length < 1) {
      layer.msg('请选择最少一条数据')
      return
    }
    let loadIndex = layer.load(1)
    axios.post('/api/excel', {
      data: aData
    }).then((data) => {
      layer.close(loadIndex)
      layer.open({
        title: '导出数据',
        area: '500px',
        content: `<div class="export-then"><i class="export-icon"></i><div class="export-txt">导出成功</div></div>`
      })
      if (data.data) {
        window.location = window.location.origin + '/' + data.data.url
      }
    }).catch((err) => {
      layer.close(loadIndex)
    })
  },

  // 设置进度条
  setProgressBar (num = 1) {
    if (fn.progressBarTimer && num != 1) return
    // if (performance.now() - fn.progressBarTimer < 100 && num != 1) return
    // fn.progressBarTimer = performance.now()
    fn.progressBarTimer = true
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      fn.progressBarTimer = false
    }, 50)
    $('#uploadBar').css({
      transform: `translateX(${(-1 + num) * 100}%)`,
      // width: `${num * 100}%`
      // left: `${num * 100}%`
    }).children('#uploadBarTxt').text((num * 100).toFixed(2) + '%')
  },

  //终止加载
  endLoading () {
    // 关闭加载
    layer.close(fn.loadingIndex)
    // 解析成功后
    $('.upload-file').addClass('uploaded')
    // 显示数据
    $('#dataInfo').show()
  },

  // 重新统计总数
  afreshStatisticsData (){
    let statisticsData = {
      untaxedCount: 0, // 未税金额汇总
      taxedCount: 0, // 进项税金额汇总
      taxPriceCount: 0, // 税价汇总
    }
    fn.rowData.map(item => {
      statisticsData.untaxedCount += +(item['unTaxMoney'])
      statisticsData.taxedCount += +(item['taxMoney'])
      statisticsData.taxPriceCount += +(item['taxCount'] || 0)
    })
    this.setStatisticsData(statisticsData)
  },

  // 设置统计数据
  setStatisticsData (statisticsData) {
    for (let key in statisticsData) {
      let statisticsDataItem = statisticsData[key]
      switch (key) {
        case 'accuracy':
        case 'iFileLength':
        case 'iRepetitionCount':
          break
        case 'loadTime':
        case 'analyzeTime':
          statisticsDataItem = (statisticsDataItem/1000).toFixed(2)
          break
        default:
          statisticsDataItem = statisticsDataItem.toFixed(2)
          break
      }
      $('#' + key).text(statisticsDataItem)
    }
  },

  // 停顿时间
  sleep (time) {
    return new Promise(function (resolve) {
      setTimeout(()=> {
        resolve()
      }, time)
    })
  }
}

$(function () {
  // 上传
  $('#uploadPDF').on('change', function (e) {
    let aRowId = [] // 用于存储行标识判断是否已存在
    let aFiles = e.target.files // 文档
    let loadedIndex = 0 //已加载文件数
    let analyzeIndex = 0 //已解析文件数
    let loadStartTime = performance.now()// 开始执行时间
    let startAnalyzeTime = 0// 开始识别时间
    let errFileCount = 0 //错误文件数量
    let errRowData = [] //错误文件列表
    let statisticsData = {
      untaxedCount: 0, // 未税金额汇总
      taxedCount: 0, // 进项税金额汇总
      taxPriceCount: 0, // 税价汇总
      loadTime: 0, // 加载总时间
      analyzeTime: 0, // 识别总时间
      iFileLength: aFiles.length,  //文件长度
      iRepetitionCount: 0, // 记录重复数量
      accuracy: 100, //文件准确率
    }
    // 如果没有选择，直接推出
    if (!aFiles || statisticsData.iFileLength < 1) return
    fn.rowData = [] // 初始化数据
    fn.loadingIndex = layer.open({
      title: 'PDF解析中...',
      btn: [],
      area: '500px',
      maxWidth: 600,
      content: '<div class="layui-progress layui-progress-big" lay-showPercent="true">' +
      '<div class="layui-progress-bar" id="uploadBar"><span id="uploadBarTxt" class="layui-progress-text">0%</span></div>' +
      '</div>',
      cancel: function(index, layero){
        fn.cancelUpload = true
      }
    })

    for (let file of aFiles) {

      let fileReader = new FileReader()

      fileReader.onload = (function(fileItem) {
        return function(e) {
          if (++loadedIndex === statisticsData.iFileLength) {
            statisticsData.loadTime = performance.now() - loadStartTime
          }
          let typedArray = new Uint8Array(this.result)
          startAnalyzeTime = performance.now()
          CoreJS.getDocument(typedArray).then((doc) => {
            let pdfVersion = ''
            let lastPromise = doc.getMetadata().then((data) => {
              pdfVersion = data.info.PDFFormatVersion
            })
            let loadPage = function (pageNum) {
              if (fn.cancelUpload) {
                // 根据当前数据渲染
                fn.renderTable()
                // 设置总数
                fn.setStatisticsData(statisticsData)
                return false
              }
              doc.getPage(pageNum).then(function (page) {
                page.getTextContent().then(function (content) {
                  let _row = {}
                  for (let i = 0, l = fn.formatTarget.length; i < l; i++) {
                    let tar = fn.formatTarget[i]
                    for (let j = 0; j < content.items.length; j++) {
                      let item = content.items[j]
                      if (item.str.replace(/\s/g, '').indexOf(tar.flag) > -1) {
                        tar.w = item.width
                        tar.h = item.height
                        tar.x = item.transform[4]
                        tar.y = item.transform[5]
                        content.items.splice(j, 1) // 移除key值 无计算价值
                        // 开始查找该项的值
                        let value = [], minX = 1000, minY = 1000
                        for (let k = 0; k < content.items.length; k++) {
                          let _temp = content.items[k]
                          if (/[（）:()]/g.test(item.str)) {
                            let spaceY = Math.abs(tar.y - _temp.transform[5])
                            let spaceX = _temp.transform[4] - tar.x - tar.w
                            if (spaceY < tar.minY && spaceX > 0 && spaceX < tar.minX) {
                              value.push(_temp.str)
                              // content.items.splice(k, 1) // 移除已取值
                            }
                          } else {
                            let spaceY = tar.y - _temp.transform[5]
                            let spaceX = Math.abs(tar.x - _temp.transform[4])
                            // console.log(space, _temp.str)
                            if (spaceY > 0 && spaceY < minY) {
                              if (spaceX < tar.minX) {
                                minY = spaceY
                                value = [_temp.str]
                              }
                            } else if (spaceY === minY) {
                              if (spaceX < tar.minX) {
                                value.push(_temp.str)
                                // content.items.splice(k, 1) // 移除已取值
                              }
                            }
                          }
                        }
                        tar.value = ''
                        value.forEach((item) => {
                          if (tar.validate) {
                            if (tar.validate(item)) {
                              if (tar.format) {
                                tar.value += tar.format(item)
                              } else {
                                tar.value += item
                              }
                            }
                          } else {
                            if (tar.format) {
                              tar.value += tar.format(item)
                            } else {
                              tar.value += item
                            }
                          }
                        })
                        // console.log(tar.text, ':', tar.value)
                        _row[tar.id] = tar.value || tar.default
                        break
                      }
                    }
                  }
                  if (_row.invoiceCode && _row.invoiceId) {
                    // 判断是否已经存在（发票号码与发票代码）
                    let rowId = `${_row.invoiceCode}_${_row.invoiceId}`
                    if (!aRowId.includes(rowId)) {
                      _row.id = rowId
                      fn.rowData.push(_row)
                      aRowId.push(rowId)
                      statisticsData.untaxedCount += +(_row['unTaxMoney'])
                      statisticsData.taxedCount += +(_row['taxMoney'])
                      statisticsData.taxPriceCount += +(_row['taxCount'] || 0)
                    } else { // 记录重复数量
                      statisticsData.iRepetitionCount++
                      _row.isRepetition = true
                      fn.rowRepetitionData.push(_row)
                    }
                  } else {
                    ++errFileCount
                    statisticsData.accuracy = (100 - ((errFileCount / statisticsData.iFileLength) * 100)).toFixed(2)
                    errRowData.push({
                      err: '文件解析失败',
                      fileName: file.name,
                      pdfVersion: pdfVersion
                    })
                  }
                  if (++analyzeIndex === statisticsData.iFileLength) {
                    statisticsData.analyzeTime = performance.now() - startAnalyzeTime
                    // 把重复的数据放在后面
                    fn.rowData = fn.rowData.concat(fn.rowRepetitionData)
                    // 解析完成后渲染表格
                    fn.renderTable()
                    // 设置总数
                    fn.setStatisticsData(statisticsData)
                  }
                  fn.setProgressBar(analyzeIndex / statisticsData.iFileLength)
                })
              })
            }
            statisticsData.iFileLength += doc.numPages - 1
            for (let i = 1, len = doc.numPages; i <= len; i++) {
              lastPromise.then(loadPage.bind(this, i))
            }
          }).then(function () {
            // 文档读取完毕
          }, function (err) {
            console.error('Error: ' + err)
          })
        }
      })(file)
      fileReader.readAsArrayBuffer(file)

    }
  })

  $('#exportDataBtn').on('click', fn.exportData)

})
