<template>
  <div>
    <b-loading :is-full-page="true" :active.sync="isLoading" :can-cancel="false"></b-loading>
    <form @submit.prevent="speechToProducts">
      <b-field grouped>
        <b-input
          v-model="speech"
          placeholder="Напишите, что вы съели"
          expanded>
        </b-input>
        <p class="control">
          <b-button icon-right="microphone" type="is-primary" @click="listen">Рассказать</b-button>
        </p>
        <p class="control">
          <b-button type="is-primary" native-type="submit">Расчитать</b-button>
        </p>
      </b-field>
    </form>

    <div class="calculator columns is-multiline">
      <div class="column is-3-tablet is-paddingless">
        <b-field label="Инсулина на 1 ХE" expanded>
          <b-numberinput
            v-model="insulinPerBreadUnit"
            step="0.1"
            min="0.1">
          </b-numberinput>
        </b-field>
      </div>

      <div class="bread-units column is-6-tablet is-paddingless">
        <h1 class="title is-1 has-text-centered is-marginless">{{ breadUnits}} XE</h1>
      </div>

      <div class="insulin column is-3-tablet is-paddingless">
        <p>Необходимая доза инсулина: <b>{{ insulinAmount }}</b> ед.</p>
      </div>
    </div>

    <div v-if="noProducts || !selectedProducts.length" class="content has-text-grey has-text-centered">
      <p>
        <b-icon
          icon="emoticon-sad"
          size="is-large">
        </b-icon>
      </p>
      <p>Не найдено ни одного продукта</p>
    </div>

    <div v-else class="products">
      <div v-for="(product, index) in products" :key="index" class="box product">
        <button class="delete" @click="removeProduct(index)"></button>
        <template v-if="selectedProducts[index]">
          <div class="columns">
            <div class="column is-8">
              <b-field label="Продукт" class="product_field" horizontal expanded>
                <b-select v-model="selectedProducts[index]" expanded>
                  <option
                    v-for="productItem in product.products"
                    :key="productItem.id"
                    :value="productItem">
                    {{ productItem.name }}
                  </option>
                </b-select>
              </b-field>

              <b-field label="Количество" class="product_field" horizontal expanded>
                <b-numberinput
                  v-model="product.amount"
                  min="0">
                </b-numberinput>
              </b-field>

              <b-field
                label="Мера"
                :type="selectedProducts[index].measure ? '' : 'is-danger'"
                :message="selectedProducts[index].measure ? '' : 'Данный продукт не учитывается, так как нет подходящей меры'"
                class="product_field"
                horizontal
                expanded>
                <b-select v-model="selectedProducts[index].measure" expanded>
                  <option
                    v-for="measure in selectedProducts[index].measures"
                    :key="measure.id"
                    :value="measure">
                    {{ measure.name }} ({{ measure.grams }}г)
                  </option>
                </b-select>
              </b-field>
            </div>
            <div class="column is-offset-1-widescreen">
              <div class="product__pfc">
                <b-field grouped group-multiline>
                  <div class="control">
                    <b-taglist attached>
                      <b-tag type="is-dark">Б</b-tag>
                      <b-tag type="is-primary">{{ selectedProducts[index].pfc.p }}</b-tag>
                    </b-taglist>
                  </div>

                  <div class="control">
                    <b-taglist attached>
                      <b-tag type="is-dark">Ж</b-tag>
                      <b-tag type="is-primary">{{ selectedProducts[index].pfc.f }}</b-tag>
                    </b-taglist>
                  </div>

                  <div class="control">
                    <b-taglist attached>
                      <b-tag type="is-dark">У</b-tag>
                      <b-tag type="is-primary">{{ selectedProducts[index].pfc.c }}</b-tag>
                    </b-taglist>
                  </div>
                </b-field>
              </div>
              <div class="level"></div>
              <div>
                <b>Вес:</b> {{ product.amount * selectedProducts[index].measure.grams }} грамм
              </div>
              <div class="level"></div>
              <div>
                <b>Доля углеводов:</b>
                {{ (product.amount * selectedProducts[index].measure.grams * selectedProducts[index].pfc.c / breadUnits / cPerBreadUnit).toFixed(0) }}%
              </div>
            </div>
          </div>
        </template>

        <template v-else class="box">
          <b-message type="is-danger" has-icon>
            Не удалось найти или распознать один из продуктов
          </b-message>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

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
      insulinPerBreadUnit: 1.5,

      noProducts: false,
      isLoading: false
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
        if (event.results[event.resultIndex].isFinal) {
          this.speech = event.results[0][0].transcript;
          await this.speechToProducts()
        }
      };
    },

    async speechToProducts() {
      this.noProducts = false
      this.products = []
      this.selectedProducts = []
      this.breadUnits = 0
      this.isLoading = true

      this.products = (await axios.post('http://45.141.100.141:3000/api/products', {
        speech: this.speech
      })).data.data

      this.products = (await response.json()).data
      this.isLoading = false
      this.processResult()
    },

    processResult() {
      let errorCount = 0;
      for (let i = 0; i < this.products.length; i++) {
        if (this.products[i].products.length) {
          this.selectedProducts[i] = this.products[i].products[0]
        } else {
          this.selectedProducts[i] = null;
          errorCount += 1;
        }
      }
      if (errorCount === this.products.length) {
        this.noProducts = true;
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
    },

    removeProduct(productIndex) {
      this.products.splice(productIndex, 1);
      this.selectedProducts.splice(productIndex, 1);
    }
  }
}
</script>

<style>

</style>

