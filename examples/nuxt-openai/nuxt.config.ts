import path from 'node:path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    preset: 'cloudflare-pages'
  },
  alias: {
    'node:util': path.resolve(
      __dirname,
      'node_modules/unenv/runtime/node/util/index.cjs'
    ),
    'node:net': path.resolve(
      __dirname,
      'node_modules/unenv/runtime/node/net/index.cjs'
    )
  },
  runtimeConfig: {
    openaiApiKey: ''
  }
})
