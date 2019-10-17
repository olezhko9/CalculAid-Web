<template>
  <div>
    <b-field grouped position="is-centered">

      <b-field expanded>
        <b-field>
          <b-input v-model="speech" expanded></b-input>
          <b-button icon-left="microphone" type="is-primary"></b-button>
        </b-field>
      </b-field>

      <b-field>
          <button class="button is-primary" @click="processSpeech">Расчитать</button>
      </b-field>

    </b-field>

    <div class="columns is-multiline products">
      <div v-for="(products, index) in productsData.products" :key="index" class="column is-3">
        <div class="box">
          <b>{{ productsData.quantity[index][0] }}</b>
        </div>
        <div v-for="(product, idx) in products" :key="idx" class="box">
          <b>{{ getProductById(product).name }}</b>
          <div class="columns is-mobile">
            <div class="column">Б: {{ getProductById(product).pfc.p }}</div>
            <div class="column">Ж: {{ getProductById(product).pfc.f }}</div>
            <div class="column">У: {{ getProductById(product).pfc.c }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import speechToText from '../modules/stemmer'
import productsList from '../static/data/products'

export default {
  components: {},
  data() {
    return {
      speech: "Я съела 2 куска хлеба еще я съел десять ложек риса а также выпил двести миллилитров сока и еще я съел одно яблоко",
      productsData: { products: [], quantity: [] }
    }
  },

  mounted() {
    this.processSpeech()
  },

  methods: {
    processSpeech() {
      this.productsData = speechToText(this.speech)
    },

    getProductById(id) {
      return productsList.find(product => product.id === id)
    }
  }
}
</script>

<style>
  .products {
    margin-top: 2rem;
  }
</style>

