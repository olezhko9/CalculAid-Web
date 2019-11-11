const sw = require('stopword')
const productsList = require('../static/data/data.json')
const MyStem = require('mystem3')

const speechText = "Короче Я съела 2 куска хлеба еще я съел десять ложек варенного риса а еще выпил двести миллилитров апельсинного сока и еще я съел одно яблоко"
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
  stemmer.start();
  for (let possibleProductsPart of splittedSpeech) {
    possibleProductsPart = possibleProductsPart.split(' ')

    for (let i = 0; i < possibleProductsPart.length; i++) {
      const word = possibleProductsPart[i]
      console.log("\n", word);
      try {
        let grammeme = await stemmer.extractAllGrammemes(word)
        possibleProductsPart[i] = getWordInfoByGrammeme(word, grammeme)
        console.log(grammeme);
      } catch (e) {
        console.log(e);
        stemmer.stop()
      }
    }
  }
  stemmer.stop()

  console.timeEnd('speechToProducts')
}

speechToProducts(speechText, myStem)


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
    partOfSpeech: getPartOfSpeech(grammeme)
  }
}

function getPartOfSpeech(grammeme) {
  if (!Array.isArray(grammeme)) return;
  let partOfSpeech = null

  switch (grammeme[1].split('=')[0]) {
    case 'S':
      partOfSpeech = "Существительное";
      break;
    case 'V': {
      if (~grammeme.indexOf('partcp')) {
        partOfSpeech = "Причастие";
      } else if (~grammeme.indexOf('get')) {
        partOfSpeech = "Деепричастие"
      } else {
        partOfSpeech = "Глагол";
      }
      break;
    }
    case 'A':
      partOfSpeech = "Прилагательное";
      break;
    case 'NUM':
      partOfSpeech = "Числительное";
      break;
    case 'ADV':
      partOfSpeech = "Наречие";
      break;
    default:
      break;
  }

  console.log(partOfSpeech);
  return partOfSpeech
}
