const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const axios = require('axios')
const Qs = require('qs')
const session = require('koa-session-minimal')
const MysqlSession = require('koa-mysql-session')

const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')
const koaBody = require('koa-body')
const request = require('request')
const fs = require('fs')
// const session = require('koa-session')
const app = new Koa()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 4000
// local url
const bkProxyUrl = 'http://localhost:8666'
// dev url
// const bkProxyUrl = 'http://94.191.88.227:8080/saleapp-server'
const APILIST = require('../utils/apiList').api()

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

// session database
// local model
var sqlBody = {
  user: 'koas',
  password: 'koas',
  database: 'koa_session',
  // host: '94.191.88.227'
  host: '127.0.0.1'
}
let store = new MysqlSession(sqlBody)

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }
  app.keys = ['bk-server']
  app.use(bodyParser())
  app.use(
    session({
      key: 'sale-server',
      store: store,
      cookie: config.sessionConfig
    })
  )
  let router = new Router()

  router.post('/logout', async ctx => {
    if (ctx.session.currentUser) delete ctx.session.currentUser
    ctx.body = { return_code: 0 }
  })

  router.post(
    '/fileupload',
    koaBody({
      multipart: true,
      formidable: {
        maxFileSize: 2 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
      }
    }),
    async ctx => {
      console.log('reqbody', ctx.request.body)
      console.log('filepath:>>', ctx.request.files.img.path)
      // ctx.body = {
      //   code: 0,
      //   data: { url: 'xxx' }
      // }
      // return
      let reqBody = ctx.request.body
      let body = {
        file: fs.createReadStream(ctx.request.files.img.path),
        prefix: reqBody.action || ''
      }
      delete reqBody.action
      Object.keys(reqBody).map(itm => {
        body[itm] = reqBody[itm]
      })
      let data = await fileRequst({
        formData: body,
        headers: {
          Authorization: ctx.session.usertk
        }
      })
      console.log('resp data', data)
      // 'http://pic1.win4000.com/wallpaper/3/53e1baf5d6ce4.jpg'
      if (data.status == 403 && data.error == 'Forbidden')
        delete ctx.session.currentUser
      ctx.body = {
        code: 0,
        data: { url: data.filePath, id: data.id }
      }
    }
  )

  router.post('/proxy', bodyParser(), async ctx => {
    console.log('body:>.', ctx.request.body)
    console.log('ctx session:>>', ctx.session)
    const body = ctx.request.body

    try {
      let header = {}
      if (ctx.session.usertk) header.Authorization = ctx.session.usertk
      console.log('proxy header', header)
      let { data } = await axiosRequest({
        method: body.method,
        url: bkProxyUrl + body.url,
        params: body.params,
        headers: header
      })
      console.log('result>>', data)
      let usr = null
      if (body.url == APILIST.login && data.return_code == 0) {
        console.log('level:>>', data.user.acctLevel)
        usr = {
          id: data.user.id,
          username: data.user.username,
          acctLevel: data.user.acctLevel,
          buckets: data.user.buckets,
          currentBucket: {
            id: data.user.currentBucket.id,
            name: data.user.currentBucket.name
          }
        }
        if (usr.acctLevel != 3) {
          usr.currentRole = {
            id: data.role.id,
            name: data.role.name
          }
          usr.auths = data.permissions
        }
        ctx.session = {
          usertk: data.token,
          currentUser: usr
        }
        console.log('session', ctx.session)
        data.user = usr
        delete data.role
        delete data.token
      }
      if (data.status == 403 && data.error == 'Forbidden')
        delete ctx.session.currentUser
      ctx.body = data
    } catch (e) {
      console.error(e)
      ctx.body = {
        code: -1,
        message: e.message
      }
    }
  })

  app.use(router.routes()).use(router.allowedMethods())

  app.use(ctx => {
    ctx.status = 200 // koa defaults to 404 when it sees that status is unset
    ctx.req.session = ctx.session
    return new Promise((resolve, reject) => {
      ctx.res.on('close', resolve)
      ctx.res.on('finish', resolve)
      nuxt.render(ctx.req, ctx.res, promise => {
        // nuxt.render passes a rejected promise into callback on error.
        promise.then(resolve).catch(reject)
      })
    })
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()

function axiosRequest(config) {
  return axios({
    method: config.method,
    url: config.url,
    params: config.params,
    paramsSerializer: function(params) {
      return Qs.stringify(params, { arrayFormat: 'brackets' })
    },
    headers: config.headers || {}
  })
}

function fileRequst(config) {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: bkProxyUrl + '/backend/file/upload',
        formData: config.formData,
        headers: config.headers
      },
      function(err, resp, body) {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(body))
        }
      }
    )
  })
}
