const Koa = require('koa')
const koaBody = require('koa-body')
const cors = require('@koa/cors')
const ip = require('ip')

const router = require('./router')

async function start() {
  const app = new Koa()

  const host = ip.address()
  const port = 3000

  app.use(cors());
  app.use(koaBody({multipart: true}));
  app.use(router.routes())
  app.use(router.allowedMethods())

  app.listen(port, host)
  console.log('Server listening on ' + host + ':' + port)
}

start()
