const sw = require('stopword')
const productsList = require('../static/data/data.json')
const MyStem = require('mystem3')

const speechText = "Короче, Я съела 2 куска хлеба еще я съел десять ложек варенного риса а еще выпил двести миллилитров апельсинного сока и еще я съел одно яблоко"
const myStem = new MyStem();


function speechToProducts(speechText, stemmer) {
  console.time('speechToProducts')

  // remove stop words except 'еще'
  speechText = removeStopWords(speechText)
  console.log(speechText);

  // split by 'еще'
  let splittedSpeech = speechText.split('еще').map(part => part.trim())
  console.log(splittedSpeech);

  // for (let possibleProductsPart of splittedSpeech) {
  //   possibleProductsPart = possibleProductsPart.split(' ')
  //   // for (let i = 0; i < possibleProductsPart.length; i++) {
  //   //
  //   // }
  //   for (let word of possibleProductsPart) {
  //     console.log(extractGrammemes(word, stemmer));
  //   }
  // }
  speechText.split(' ').forEach(async word => {
    let lemma = await extractGrammemes(word, stemmer)
    console.log(lemma);
  });

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


function extractGrammemes(word, stemmer) {
  stemmer.start(); // Run mystem in separate process

  return stemmer.extractAllGrammemes(word)
    .then(function (lemma) {
      stemmer.stop();
      return lemma;
    })
    .catch(console.error);
}
