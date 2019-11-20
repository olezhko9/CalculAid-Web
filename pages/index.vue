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
          <b-button type="is-primary" @click="speechToProducts">Расчитать</b-button>
      </b-field>

    </b-field>

    <div>
      <h1 class="title is-1 has-text-centered">{{ breadUnits.toFixed(2) }} XE</h1>
    </div>

    <div class="columns is-multiline products">
      <div v-for="(product, index) in products" :key="index" class="column">
        <div class="box">
          <b>{{ product.amount + ' ' + product.measure }}</b>
        </div>
        <div class="box">
          <span>{{ product.product }}</span>
        </div>
        <div v-for="(item, idx) in product.products" :key="idx" class="box">
          <b>{{ item.name }}</b>
          <div class="">
            <p class="">Б: {{ item.pfc.p }}</p>
            <p class="">Ж: {{ item.pfc.f }}</p>
            <p class="">У: {{ item.pfc.c }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      speech: "Короче Я съела 2 куска хлеба " +
          "еще я съел десять столовых ложек варенного риса " +
          "а еще выпил двести миллилитров апельсинного сока " +
          "и еще выпил стакан молока " +
          "а еще я съел одно яблоко",
      products: [],
    }
  },

  computed: {
    breadUnits() {
      let bu = 0
      for (let product of this.products) {
        bu += product.products[0].pfc.c * product.amount / 100;
      }
      return bu;
    }
  },

  async mounted() {
    await this.speechToProducts()
  },

  methods: {
    listen() {
      window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      let recognition = new window.SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognition.start();

      recognition.onresult = async (event) => {
        console.log(event)
        this.speech = event.results[0][0].transcript;
        await this.speechToProducts()
      };
    },

    async speechToProducts() {
      let response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          speech: this.speech
        })
      })

      this.products = await response.json()
      console.log(this.products);
    }
  }
}
</script>

<style>
  .products {
    margin-top: 2rem;
  }
</style>

