const Koa = require('koa')
const koaBody = require('koa-body')
const cors = require('@koa/cors')
const ip = require('ip')
const https = require('https');

const router = require('./router')

async function start() {

  const greenlock = require('greenlock-koa').create({
    version: 'draft-11',
    server: 'https://acme-v02.api.letsencrypt.org/directory',
    email: 'oleg.naumov.98@mail.ru',
    agreeTos: true,
    approveDomains: [ 'calculaid.tk' ],
    communityMember: false,
    configDir: require('os').homedir() + '/acme/etc'
  });

  const app = new Koa()

  const host = ip.address()
  const port = 3000

  app.use(cors());
  app.use(koaBody({multipart: true}));
  app.use(router.routes())
  app.use(router.allowedMethods())

  const server = https.createServer(greenlock.tlsOptions, greenlock.middleware(app.callback()));
  server.listen(3000, () => {console.log('Server listening on ' + host + ':' + port)})
}

start()
