<template>
  <div>
    <b-field grouped position="is-centered">

      <b-field expanded>
        <b-field>
          <b-input v-model="speech" expanded></b-input>
          <b-button icon-left="microphone" type="is-primary" @click="listen"></b-button>
        </b-field>
      </b-field>

      <b-field>
          <b-button type="is-primary" @click="processSpeech">Расчитать</b-button>
      </b-field>

    </b-field>

    <div>
      <h1 class="title is-1 has-text-centered">{{ breadUnits }} XE</h1>
    </div>

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
      productsData: { products: [], quantity: [] },
      breadUnits: 0
    }
  },

  mounted() {
    this.processSpeech()
  },

  methods: {
    processSpeech() {
      this.breadUnits = 0
      this.productsData = speechToText(this.speech)
      this.productsData.products.forEach(products => {
        this.breadUnits += this.getProductById(products[0]).pfc.c
      })
    },

    getProductById(id) {
      return productsList.find(product => product.id === id)
    },

    listen() {
      window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      let recognition = new window.SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognition.start();

      recognition.onresult = (event) => {
        console.log(event)
        this.speech = event.results[0][0].transcript;
        this.processSpeech()
      };
    }
  }
}
</script>

<style>
  .products {
    margin-top: 2rem;
  }
</style>

