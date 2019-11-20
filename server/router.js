const Router = require('koa-router')
const router = new Router({ prefix: '/api' })
import speechToProducts from './speech-to-products'

router.post('/products', async (ctx) => {
  const speech = JSON.parse(ctx.request.body).speech;
  ctx.body = await speechToProducts(speech)
})

export default router
