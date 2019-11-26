const Router = require('koa-router')
const router = new Router({ prefix: '/api' })
const speechToProducts = require('./speech-to-products')

router.post('/products', async (ctx) => {
  const speech = JSON.parse(ctx.request.body).speech;
  ctx.body = await speechToProducts(speech)
})

module.exports = router
