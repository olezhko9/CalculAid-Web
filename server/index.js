const Koa = require('koa')
const koaBody = require('koa-body')
const cors = require('@koa/cors')
const ip = require('ip')
const https = require('https');
const fs = require('fs')

const router = require('./router')

async function start() {
  const app = new Koa()

  const host = ip.address()
  const port = 3000

  app.use(cors());
  app.use(koaBody({multipart: true}));
  app.use(router.routes())
  app.use(router.allowedMethods())

  const server = https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app);
  server.listen(3000, () => {console.log('Server listening on ' + host + ':' + port)})
}

start()
