import $ from 'jquery'
import axios from 'axios'
import '../css/normalize.css'
import './lib/layui/css/layui.css'
import '../css/main.less'
import './lib/layui/layui.all'

$(function () {
  // 如果已经登录
  let iExTime = 2 * 24 * 60 * 60 * 1000
  if (localStorage.token && localStorage.tokenCreateDate ||
    (+localStorage.tokenCreateDate + iExTime) > +new Date()) {
    location.href = './index.html'
  }
  // 获取图片验证码
  let $captchaImg = $('#captchaImg')

  function changeCaptchaImg () {
    $captchaImg.prop('src', '/api/user/captcha?' + Math.random())
  }

  $captchaImg.on('click', changeCaptchaImg)
  changeCaptchaImg()

  // 获取手机验证码
  $('#captchaPhone').on('click', function () {
    let username = $('#username').val(),
      captcha = $('#captchaImgTxt').val()
    if (!username) {
      layer.msg('请输入用户名')
      return
    }
    axios.post('api/user/getPhoneCaptcha', {
      username: username,
      captcha: captcha
    }).then(function (response) {
      let data = response.data
      if (data.code === '0000') {
        layer.msg('验证码发送成功')
      } else {
        layer.msg(data.msg)
        changeCaptchaImg()
      }
    }).catch(function (error) {
      alert(error)
    })
  })

  // 登录
  $('#btnLogin').on('click', function () {
    let username = $('#username').val(),
      phoneCaptcha = $('#captchaPhoneTxt').val()
    if (!username) {
      layer.msg('请输入用户名')
      return
    }
    if (!phoneCaptcha) {
      layer.msg('请输入手机验证码')
      return
    }
    axios.post('api/user/login', {
      username: username,
      phoneCode: phoneCaptcha
    }).then(function (response) {
      let data = response.data
      if (data.code === '0000') {
        window.localStorage.token = data.data
        window.localStorage.tokenCreateDate = +new Date()
        layer.msg('登录成功')
        location.href = '/'
      } else {
        layer.msg(data.msg)
      }
    }).catch(function (error) {
      alert(error)
    })
  })
})