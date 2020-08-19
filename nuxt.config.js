module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'calculaid',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'bread units calculator' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/calculaid.png' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },

  css: [
    '~assets/css/main.css'
  ],

  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/axios',
    'nuxt-buefy',
  ],

  pwa: {
    manifest: {
      name: 'CalculAid: bread units calculator',
      short_name: 'CalculAid',
      start_url: '/',
      theme_color: '#7957d5',
      display: 'standalone',
    },
    icon: {
      iconSrc: './static/calculaid.png',
    },
  },

  axios: {
    baseURL: '/api',
    retry: { retries: 3 }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      config.node = {
        fs: 'empty'
      }
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}

