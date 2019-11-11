const sw = require('stopword')
const productsList = require('../static/data/data.json')
const MyStem = require('mystem3')

const speechText = "Короче Я съела 2 куска хлеба еще я съел десять столовых ложек варенного риса а еще выпил двести миллилитров апельсинного сока и еще выпил стакан молока а еще я съел одно яблоко"
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
      // console.log("\n", word);
      try {
        let grammeme = await stemmer.extractAllGrammemes(word)
        possibleProductsPart[i] = getWordInfoByGrammeme(word, grammeme)
        console.log(grammeme);
        console.log(possibleProductsPart[i]);
        console.log()
      } catch (e) {
        console.log(e);
        stemmer.stop()
      }
    }
    console.log('--------------------------------------------------------')
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
