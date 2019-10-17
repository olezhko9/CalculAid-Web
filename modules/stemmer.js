// stemmer testing without react-native in node.js
const natural = require('natural');
const sw = require('stopword')
const productsList = require('../static/data/products.json')

export default function(speech) {
  console.time('Program')

// remove stop words
  const ruStopWords = ['также']
  let clearedSpeech = sw.removeStopwords(speech.split(' '), [...sw.ru, ...ruStopWords])
// console.log(clearedSpeech)


// stemming procedure
  let stemmedSpeech = clearedSpeech.map(natural.PorterStemmerRu.stem)
// console.log(stemmedSpeech);


// convert cardinal number words to numbers
  const cardinalNumbers = [
    ["один", 1], ["одно", 1], ["два", 2], ["три", 3], ["четыре", 4], ["пять", 5],
    ["шесть", 6], ["семь", 7], ["восемь", 8], ["девять", 9], ["десять", 10],
    ["одиннадцать", 11], ["двенадцать", 12], ["тринадцать", 13], ["четырнадцать", 14], ["пятнадцать", 15],
    ["шестнадцать", 16], ["семнадцать", 17], ["восемнадцать", 18], ["девятнадцать", 19], ["двадцать", 20],
    ["тридцать", 30], ["сорок", 40], ["пятьдесят", 50], ["шестьдесят", 60], ["семьдесят", 70], ["восемьдесят", 80],
    ["девяносто", 90], ["сто", 100], ["двести", 200], ["триста", 300], ["четыреста", 400], ["пятьсот", 500],
    ["шестьсот", 600], ["семьсот", 700], ["восемьсот", 800], ["девятьсот", 900], ["тысяча", 1000]
  ].map(x => [natural.PorterStemmerRu.stem(x[0]), x[1]])

  for (let i = 0; i < stemmedSpeech.length; i++) {
    const word = stemmedSpeech[i];
    let number = parseInt(word)
    if (!isNaN(number))
      stemmedSpeech.splice(i, 1, number);
    for (let j = 0; j < cardinalNumbers.length; j++) {
      if (word === cardinalNumbers[j][0]) {
        stemmedSpeech.splice(i, 1, cardinalNumbers[j][1]);
        break;
      }
    }
  }
// console.log(stemmedSpeech);


// split by verb
  const actionVerbs = ['выпил', 'съел', 'скушал', 'покушал', 'перекусил'].map(natural.PorterStemmerRu.stem)

  let speechActionIndexes = stemmedSpeech.reduce((arr, word, i) => {
    if (actionVerbs.indexOf(word) !== -1) {
      arr.push(i);
    }
    return arr;
  }, [])

  let products = []
  for (let i = 0; i < speechActionIndexes.length; i++) {
    products.push(stemmedSpeech.slice(speechActionIndexes[i] + 1, speechActionIndexes[i + 1]))
  }
// console.log(products)


// search products in data
//   let productsList = []
//   try {
//     productsList = JSON.parse(fs.readFileSync('./data/products.json'))
//   } catch (err) {
//     console.log(err)
//   }

  for (let i = 0; i < productsList.length; i++) {
    let product = productsList[i]
    let stemmedProduct = product.name.toLowerCase().split(' ').map(natural.PorterStemmerRu.stem).join(' ')
    productsList[i].name = stemmedProduct
  }

  let matchesForProductsInSpeech = []
  for (let i = 0; i < products.length; i++) {
    let productInSpeech = products[i].slice(-1)[0]

    let matches = productsList.reduce((arr, productInData) => {
      const dist = natural.JaroWinklerDistance(productInSpeech, productInData.name)
      if (dist >= 0.80) {
        arr.push(productInData.name)
      }
      return arr
    }, [])

    matchesForProductsInSpeech.push(matches)
  }
  // console.log(matchesForProductsInSpeech);


// get quantity of product
  let productsQuantity = []
  products.forEach(product => {
    const quantity = product[0]
    productsQuantity.push([quantity])
  })
  // console.log(productsQuantity)

  console.timeEnd('Program')

// TODO: calculate distance for each word in product name
// console.log(natural.JaroWinklerDistance("рис отварн", "варен"));

  return {
    products: matchesForProductsInSpeech,
    quantity: productsQuantity
  }
}
