const Router = require('koa-router')
const router = new Router({ prefix: '/api' })
const speechToProducts = require('./speech-to-products')

router.post('/products', async (ctx) => {
  const speech = ctx.request.body.speech;
  console.log(speech);
  const data = await speechToProducts(speech)
  ctx.body = {
    data
  }
  ctx.status = 200
})

module.exports = router
