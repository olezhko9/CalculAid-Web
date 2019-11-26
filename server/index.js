const configNuxt = require('../nuxt.config')
const Koa = require('koa')
const koaBody = require('koa-body')
const { Nuxt, Builder } = require('nuxt')

// import router from './router'
const router = require('./router')

async function start() {
  const app = new Koa()
  const host = 'localhost'
  const port = 3000

  configNuxt.dev = !(app.env === 'production')

  const nuxt = new Nuxt(configNuxt)

  if (configNuxt.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  app.use(koaBody({multipart: true}));
  app.use(router.routes())
  app.use(router.allowedMethods())


  app.use(ctx => {
    ctx.status = 200
    ctx.respond = false
    ctx.req.ctx = ctx
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, host)
  console.log('Server listening on ' + host + ':' + port)
}

start()
