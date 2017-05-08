#!/usr/bin/env node

var chalk = require('chalk');
var VocabFetcher = require("vocab-fetcher")
var vocabFetcher = new VocabFetcher()
var ManipulateSubstring = require("manipulate-substring")
var SpellChecker = require("spellchecker")
var parseArgv = require("parse-argv")

var args = process.argv.slice(2);
var argv = parseArgv(args)

// Defaults
var showSentences = false;
var showFamily = false;
var showDefinitions = true;
var showLongDescription = false;
var showShortDescription = true;

if (args.indexOf("-h") > -1) {
  console.log("Usage:\n  definition <word> [options]")
  console.log("Options:")
  console.log("  -h   # Show all options")
  console.log("  -s   # Show sentences")
  console.log("  -f   # Show related words")
  console.log("  -sd  # Show short description")
  console.log("  -ld  # Show long description")
  console.log("  -ld  # Show long description")
  console.log("Example:\n  definition abate -a")

  process.exit()
}

if (!args[0]) {
  throw new Error("Must provide a word as the first agument")
}

if (SpellChecker.isMisspelled(args[0])) {
  var spellingSuggestions = SpellChecker.getCorrectionsForMisspelling(args[0]);

  console.log("It looks like the word might be misspelled. Here are some suggestions:")
  for(var i = 0; i < spellingSuggestions.length; i++){
    console.log(i + 1 + ") " + chalk.underline.blue(spellingSuggestions[i]))
  }

  return
}

var sentencesOpts = argv["s"];
var sentenceCount;

if (sentencesOpts) {
  showSentences = true;
  if (Number.isInteger(sentencesOpts)) {
    sentenceCount = sentencesOpts;
  }
}

var familyOpts = argv["f"]
var familyCount;

if (argv["f"]) {
  showFamily = true;

  if (Number.isInteger(familyOpts)) {
    familyCount = familyOpts;
  }
}

if (argv["d"]) {
  switch(argv["d"]) {
    case "short":
      showShortDescription = true;
      showLongDescription = false;
      break
    case "long":
      showLongDescription = true;
      showShortDescription = false;
      break
    case true:
      showShortDescription = true;
      showLongDescription = true;
    default:
      break;
  }
}

if (argv["a"]) {
  showFamily= true;
  showSentences = true;
  showDefinitions = true;
  showLongDescription = true;
  showShortDescription = true;
}

vocabFetcher.getWord(args[0]).then(function(word) {
  console.log("");
  console.log("WORD: " + chalk.green(args[0].toUpperCase()));
  console.log("");

  if (showShortDescription == true) {
    printShortDescription(word);
  }

  if (showLongDescription == true) {
    printLongDescription(word);
  }

  if (showDefinitions == true) {
    printDefinitions(word);
  }

  if (showSentences == true) {
    printSentences(word);
  }

  if (showFamily == true) {
    printFamily(word);
  }
})

function printShortDescription(wordObj) {
  if (wordObj.shortDescription != "") {
    console.log(chalk.underline.blue("Short Description"));
    console.log(chalk.green(wordObj.name.capitalizeFirstLetter()) + ": " +wordObj.shortDescription);
    console.log("");
  }
}

function printLongDescription(wordObj) {
  if (wordObj.longDescription != "") {
    console.log(chalk.underline.blue("Long Description"));
    console.log(chalk.green(wordObj.name.capitalizeFirstLetter()) + ": " + wordObj.longDescription);
    console.log("");
  }
}

function printDefinitions(wordObj) {
  console.log(chalk.underline.blue("Definitions"));
  for(var i = 0; i < wordObj.definitions.length; i++) {
    var defObj = wordObj.definitions[i];
    console.log(chalk.yellow(defObj.partOfSpeech) + ") " + defObj.definition);
  }
  console.log("");
}

function printSentences(wordObj) {
  console.log(chalk.underline.blue("Sentences"));
  if (sentencesOpts === true) {
    sentenceCount = wordObj.sentences.length;
  }

  sentenceCount = Math.min(wordObj.sentences.length, sentenceCount);

  for(var i = 0; i < sentenceCount; i++) {
    var sentenceObj = wordObj.sentences[i]
    console.log(chalk.yellow(i+1) +") " + ManipulateSubstring.colorizeBetweenCharacterIndexes("green", sentenceObj.offsets[0], sentenceObj.offsets[1], sentenceObj.sentence));
  }
  console.log("");
}

function printFamily(wordObj) {
  console.log(chalk.underline.blue("Family"));

  if (familyOpts === true) {
    familyCount = wordObj.family.length;
  }

  familyCount = Math.min(wordObj.family.length, familyCount);

  for(var i = 0; i < familyCount; i++) {
    familyObj = wordObj.family[i];
    console.log(chalk.yellow(i+1) +") " + familyObj.word);
  }
  console.log("");
}

String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
