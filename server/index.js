const Koa = require('koa')
const koaBody = require('koa-body')
const cors = require('@koa/cors')

const { Nuxt, Builder } = require('nuxt');
const config = require('../nuxt.config.js');
config.dev = process.env.NODE_ENV !== 'production';

const router = require('./router')

async function start() {
  const app = new Koa()

  const nuxt = new Nuxt(config);
  const { host, port } = nuxt.options.server;

  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  } else {
    await nuxt.ready();
  }

  app.use(cors());
  app.use(koaBody({multipart: true}));
  app.use(router.routes())
  app.use(router.allowedMethods())
  app.use(ctx => {
    ctx.status = 200
    ctx.respond = false
    ctx.req.ctx = ctx
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`)
  })
}

start()
