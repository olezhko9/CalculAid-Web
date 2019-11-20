const Router = require('koa-router')
const router = new Router({ prefix: '/api' })

router.post('/products', async (ctx) => {
  const speech = JSON.parse(ctx.request.body).speech;
  ctx.body = {
    products: speech
  }
})

export default router
