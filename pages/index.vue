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

    <div class="products">
      <div v-for="(product, index) in products" :key="index" class="box product">
        <div>
          <b-field grouped>
            <b-field label="Продукт">
              <b-select v-model="selectedProducts[index]">
                <option
                  v-for="productItem in product.products"
                  :key="productItem.id"
                  :value="productItem">
                  {{ productItem.name }}
                </option>
              </b-select>
            </b-field>
            <b-field label="Количество">
              <b-input v-model="product.amount"></b-input>
            </b-field>
            <b-field label="Мера">
              <b-select v-model="product.measure">
                <option :value="product.measure">{{ product.measure }}</option>
              </b-select>
            </b-field>
          </b-field>
        </div>
        <div>
          <p>Б: {{ selectedProducts[index].pfc.f }}</p>
          <p>Ж: {{ selectedProducts[index].pfc.p }}</p>
          <p>У: {{ selectedProducts[index].pfc.c }}</p>
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
          "а еще выпил двести миллилитров апельсинового сока " +
          "и еще выпил стакан молока " +
          "а еще я съел одно яблоко",
      products: [],
      selectedProducts: []
    }
  },

  computed: {
    breadUnits() {
      let bu = 0
      for (let i = 0; i < this.products.length; i++) {
        if (this.products[i].products.length) {
          bu += this.selectedProducts[i].pfc.c * this.products[i].amount / 100;
        }
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
      let response = await fetch('http://194.87.101.20:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          speech: this.speech
        })
      })

      this.products = (await response.json()).data
      for (let i = 0; i < this.products.length; i++) {
        if (this.products.length)
          this.selectedProducts[i] = this.products[i].products[0]
        else
          this.selectedProducts[i] = null
      }
      console.log(this.products);
    }
  }
}
</script>

<style>
  .product {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>

