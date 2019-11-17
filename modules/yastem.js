const sw = require('stopword')
const productsList = require('../static/data/data.json')
const MyStem = require('mystem3')
const natural = require('natural');

const speechText =
  "Короче Я съела 2 куска хлеба " +
  "еще я съел десять столовых ложек варенного риса " +
  "а еще выпил двести миллилитров апельсинного сока " +
  "и еще выпил стакан молока " +
  "а еще я съел одно яблоко"

const myStem = new MyStem();


async function speechToProducts(speechText, stemmer) {
  console.time('speechToProducts')

  // remove stop words except 'еще'
  speechText = removeStopWords(speechText)
  console.log(speechText);

  // split by 'еще'
  let splittedSpeech = speechText.split('еще').map(part => part.trim())
  console.log(splittedSpeech);

  // extract all grammemes for each word in each part
  let possibleProductsAndMeasures = []

  stemmer.start();
  for (let subSpeech of splittedSpeech) {
    subSpeech = subSpeech.split(' ')

    for (let i = 0; i < subSpeech.length; i++) {
      const word = subSpeech[i]
      try {
        let grammeme = await stemmer.extractAllGrammemes(word)
        subSpeech[i] = getWordInfoByGrammeme(word, grammeme)
      } catch (e) {
        console.log(e);
        stemmer.stop()
      }
    }
    possibleProductsAndMeasures.push(subSpeech)
  }
  stemmer.stop()

  let productsAndMeasures = []
  // remove unnecessary parts of speech
  for (let possibleProductAndMeasure of possibleProductsAndMeasures) {
    for (let i = 0; i < possibleProductAndMeasure.length; i++) {
      const word = possibleProductAndMeasure[i];
      if (
        word.partOfSpeech !== 'сущ' &&
        word.partOfSpeech !== 'прил' &&
        word.partOfSpeech !== 'прич' &&
        word.partOfSpeech !== 'числ'
      ) {
        possibleProductAndMeasure.splice(i, 1)
        i--;
      }
    }

    // convers 'числ' to numbers
    const numeralIndex = possibleProductAndMeasure.findIndex(x => x.partOfSpeech === 'числ')
    if (numeralIndex !== -1) {
      possibleProductAndMeasure = possibleProductAndMeasure.slice(numeralIndex)
    }
    possibleProductAndMeasure = convertWordsToNum(possibleProductAndMeasure)

    const nounIndexes = possibleProductAndMeasure.reduce((arr, x, i) => {
      if (x.partOfSpeech === 'сущ' && (
        x.case === 'род' || x.case === 'вин' || x.case === 'им')) {
        arr.push(i);
      }
      return arr;
    }, [])

    if (nounIndexes.length === 0) continue;
    else if (nounIndexes.length === 1) {
      productsAndMeasures.push({
        measure: possibleProductAndMeasure.slice(0, nounIndexes[0]).map(x => x.word),
        product: possibleProductAndMeasure.slice(nounIndexes[0]).map(x => x.word)
      })
    }
    else {
      productsAndMeasures.push({
        measure: possibleProductAndMeasure.slice(0, nounIndexes[0] + 1).map(x => x.word),
        product: possibleProductAndMeasure.slice(nounIndexes[0] + 1).map(x => x.word)
      })
    }

    console.log()
  }

  console.timeEnd('speechToProducts')
  return productsAndMeasures
}

// main
(async () => {
  const products = await speechToProducts(speechText, myStem);
  console.log(products);
})()


function removeStopWords(speech) {
  const ruStopWords = ['также']
  return sw.removeStopwords(
    speech.split(' '),
    [...sw.ru, ...ruStopWords].filter(word => word !== 'еще')
  ).join(' ')
}

function getWordInfoByGrammeme(word, grammeme) {
  return {
    word,
    lemma: grammeme[0],
    partOfSpeech: getPartOfSpeech(grammeme),
    case: getNounCase(grammeme)
  }
}

function getPartOfSpeech(grammeme) {
  // определяем часть речи
  if (!isNaN(grammeme)) return "числ"
  if (!Array.isArray(grammeme)) return null;
  let partOfSpeech = null

  switch (grammeme[1].split('=')[0]) {
    case 'S':
      partOfSpeech = "сущ";
      break;
    case 'V': {
      if (~grammeme.indexOf('partcp')) {
        partOfSpeech = "прич";
      } else if (~grammeme.indexOf('get')) {
        partOfSpeech = "дееприч"
      } else {
        partOfSpeech = "глаг";
      }
      break;
    }
    case 'A':
      partOfSpeech = "прил";
      break;
    case 'NUM':
      partOfSpeech = "числ";
      break;
    case 'ADV':
      partOfSpeech = "нар";
      break;
    default:
      break;
  }

  return partOfSpeech
}


function getNounCase(grammeme) {
  // падеж для существительного
  let wordCase = null
  if (getPartOfSpeech(grammeme) === "сущ") {
    for (let value of grammeme) {
      let [_, nounCase] = value.split('=')
      switch (nounCase) {
        case 'nom':
          wordCase = 'им';
          break;
        case 'gen':
          wordCase = 'род';
          break;
        case 'dat':
          wordCase = 'дат';
          break;
        case 'acc':
          wordCase = 'вин';
          break;
        case 'ins':
          wordCase = 'твор';
          break;
        case 'abl':
          wordCase = 'пр';
          break;
        default:
          break
      }
    }
  }
  return wordCase
}

function convertWordsToNum(words) {
  const cardinalNumbers = [
    ["один", 1], ["одно", 1], ["два", 2], ["три", 3], ["четыре", 4], ["пять", 5],
    ["шесть", 6], ["семь", 7], ["восемь", 8], ["девять", 9], ["десять", 10],
    ["одиннадцать", 11], ["двенадцать", 12], ["тринадцать", 13], ["четырнадцать", 14], ["пятнадцать", 15],
    ["шестнадцать", 16], ["семнадцать", 17], ["восемнадцать", 18], ["девятнадцать", 19], ["двадцать", 20],
    ["тридцать", 30], ["сорок", 40], ["пятьдесят", 50], ["шестьдесят", 60], ["семьдесят", 70], ["восемьдесят", 80],
    ["девяносто", 90], ["сто", 100], ["двести", 200], ["триста", 300], ["четыреста", 400], ["пятьсот", 500],
    ["шестьсот", 600], ["семьсот", 700], ["восемьсот", 800], ["девятьсот", 900], ["тысяча", 1000]
  ]

  for (let i = 0; i < words.length; i++) {
    const word = words[i].lemma;
    let number = parseInt(word)
    if (!isNaN(number)) {
      words[i].word = number
      words[i].lemma = number
      return words;
    }
    for (let j = 0; j < cardinalNumbers.length; j++) {
      if (word === cardinalNumbers[j][0]) {
        words[i].word = cardinalNumbers[j][1]
        words[i].lemma = cardinalNumbers[j][1]
        return words;
      }
    }
  }

  words.unshift({
    word: 1,
    lemma: 1,
    partOfSpeech: 'числ'
  })
  return words;
}
