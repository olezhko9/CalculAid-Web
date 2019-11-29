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

    <div class="bread-units">
      <b-field label="Инсулина на 1 ХE" expanded>
        <b-input v-model="insulinPerBreadUnit" expanded></b-input>
      </b-field>

      <h1 class="title is-1 has-text-centered is-marginless">{{ breadUnits}} XE</h1>

      <div class="insulin">
        <span>Необходимая доза инсулина: {{ insulinAmount }}</span>
      </div>
    </div>

    <div class="products">
      <div v-for="(product, index) in products" :key="index" class="box product">
        <div>
          <b-field grouped>
            <b-field label="Продукт" expanded>
              <b-select v-model="selectedProducts[index]" expanded>
                <option
                  v-for="productItem in product.products"
                  :key="productItem.id"
                  :value="productItem">
                  {{ productItem.name }}
                </option>
              </b-select>
            </b-field>

            <b-field label="Количество" expanded>
              <b-input v-model="product.amount" expanded></b-input>
            </b-field>

            <b-field label="Мера" expanded>
              <b-select v-model="selectedProducts[index].measure" expanded>
                <option
                  v-for="measure in selectedProducts[index].measures"
                  :key="measure.id"
                  :value="measure">
                  {{ measure.name }} ({{ measure.grams }}г)
                </option>
              </b-select>
            </b-field>
          </b-field>
        </div>
        <div class="product__pfc">
          <span><b>Б</b>: {{ selectedProducts[index].pfc.f }}</span>
          <span><b>Ж</b>: {{ selectedProducts[index].pfc.p }}</span>
          <span><b>У</b>: {{ selectedProducts[index].pfc.c }}</span>
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
      speech: "Я съел 2 куска ржаного хлеба " +
        "еще я съел десять чайных ложек варенного риса " +
        "а еще выпил двести миллилитров апельсинного сока " +
        "и еще выпил стакан козьего молока " +
        "а еще я съел одно яблоко",
      products: [],
      selectedProducts: [],
      breadUnits: 0,
      cPerBreadUnit: 12,
      insulinPerBreadUnit: 1
    }
  },

  computed: {
    insulinAmount() {
      return (this.breadUnits * this.insulinPerBreadUnit).toFixed(2)
    }
  },

  watch: {
    selectedProducts: {
      handler: function () {
        this.calcBreadUnits()
      },
      deep: true
    },
    products: {
      handler: function () {
        this.calcBreadUnits()
      },
      deep: true
    },
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
      let response = await fetch('http://192.168.56.1:3000/api/products', {
      // let response = await fetch('http://194.87.101.20:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          speech: this.speech
        })
      })

      this.products = (await response.json()).data
      this.processResult()
    },

    processResult() {
      for (let i = 0; i < this.products.length; i++) {
        if (this.products.length) {
          this.selectedProducts[i] = this.products[i].products[0]
        } else {
          this.selectedProducts[i] = null
        }
      }
      this.calcBreadUnits()
    },

    calcBreadUnits() {
      let bu = 0
      for (let i = 0; i < this.selectedProducts.length; i++) {
        if (this.selectedProducts[i] && this.selectedProducts[i].measure) {
          bu += (this.products[i].amount * this.selectedProducts[i].measure.grams) / 100 * this.selectedProducts[i].pfc.c
        }
      }
      this.breadUnits = (bu / this.cPerBreadUnit).toFixed(2)
    }
  }
}
</script>

<style>
  .bread-units {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-evenly;
  }

  .insulin {
    display: flex;
    align-items: center;
  }

  .product {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .product__pfc > span {
    margin-right: 1rem;
  }
</style>

