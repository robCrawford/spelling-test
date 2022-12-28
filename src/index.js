(function() {
  const $ = selector => document.querySelector(selector);

  const config = {
    stateName: 'spelling-state',
    completedCount: 3
  };

  const year2 = [
    'about', 'above', 'after', 'again', 'although', 'always', 'another', 'ask', 'asked', 'baby', 'because', 'before', 'behind', 'between', 'both', 'call', 'called', 'children', 'climb', 'could', 'different', "don't", 'even', 'ever', 'every', 'everyone', 'everything', 'father', 'finally', 'friends', 'great', 'help', 'hide', 'house', "i'm", 'know', 'large', 'last', 'little', 'looked', 'love', 'many', 'most', 'mother', 'Mr', 'Mrs', 'need', 'next', 'oh', 'once', 'only', 'other', 'our', 'over', 'people', 'please', 'really', 'school', 'should', 'small', 'suddenly', 'these', 'things', 'think', 'those', 'thought', 'thorough', 'time', 'together', 'under', 'until', 'very', 'where', 'which', 'work', 'would', 'year', 'young', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year3 = [
    "across", "almost", "along", "animal", "around", "balloon", "beautiful", "began", "being", "below", "better", "birthday", "break", "brother", "brought", "can't", "change", "child", "Christmas", "clothes", "cold", "coming", "didn't", "does", "door", "during", "eyes", "father", "follow", "found", "garden", "goes", "gold", "gone", "grass", "half", "happy", "head", "high", "hour", "important", "improve", "inside", "jumped", "knew", "lady", "leave", "light", "might", "mind", "money", "morning", "move", "much", "near", "never", "number", "opened", "outside", "own", "paper", "parents", "place", "pretty", "prove", "right", "round", "second", "show", "sister", "something", "sometimes", "sound", "started", "still", "stopped", "such", "sugar", "sure", "swimming", "today", "told", "tries", "turn", "upon", "used", "walk", "watch", "water", "while", "white", "whole", "why", "window", "without", "woke", "woken", "word", "world", "write", "year", "yellow"
  ];

  const year4 = [
    "accidentally", "actually", "occasionally", "probably", "knowledge", "knowledgeable", "words", "mention", "occasion", "position", "possession", "question", "possess", "caught", "naughty", "eighth", "reign", "weight", "height", "therefore", "famous", "various", "possible", "enough", "bicycle", "business", "disappear", "disbelieve", "rebuild", "reposition", "favourite", "interest", "library", "ordinary", "separate", "address", "appear", "arrive", "difficult", "opposite", "pressure", "suppose", "decide", "describe", "extreme", "guide", "surprise", "earth", "fruit", "heart", "history", "increase", "minute", "natural", "quarter", "regular", "material", "experiment", "length", "center", "century", "certain", "circle", "exercise", "experience", "medicine", "notice", "recent", "answer", "breath", "breathe", "build", "calendar", "complete", "consider", "continue", "early", "group", "guard", "forwards", "heard", "imagine", "island", "learn", "often", "particular", "peculiar", "perhaps", "popular", "potatoes", "promise", "purpose", "remember", "centered", "straight", "strange", "strength", "woman", "women"
  ];

  const allWords = [...year2, ...year3, ...year4];
  const spellingState = JSON.parse(localStorage.getItem(config.stateName) || '{}');
  const incompleteWords = allWords.filter(word => !((spellingState[word] || 0) > config.completedCount));

  const getRandomWord = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const words = ['','','','','','','','','',''].map(() => getRandomWord(incompleteWords));

  const wordToId = word => word.replace(/[^\w]/g, '');

  window.speak = text => {
    if ('speechSynthesis' in window) {
      var msg = new SpeechSynthesisUtterance();
      msg.text = text;
      window.speechSynthesis.speak(msg);
    } else {
      alert("Sorry, your browser doesn't support speech synthesis!");
    }
  }

  window.clearCelebration = () => {
    $('#complete').style.marginRight = '-600px';
  }

  window.updateResults = () => {
    const complete = words.reduce((allCorrect, word) => {
      const input = $(`#${wordToId(word)}`);
      const isCorrect = input?.value.trim() === word;
      if (input.value) {
        input.className = isCorrect ? 'correct' : 'incorrect';
      }
      return allCorrect && isCorrect;
    }, true);

    if (complete) {
      words.forEach(word => {
        spellingState[word] = (spellingState[word] || 0) + 1;
      })
      localStorage.setItem(config.stateName, JSON.stringify(spellingState));

      $('#complete').style.marginRight = 0;
      $('#complete').innerHTML = '<img src="https://i.giphy.com/media/7frSUXgbGqQPKNnJRS/giphy.webp" onclick="clearCelebration()" />'
      window.speak("You are so awesome, great job. Now let's dance. wop wop wop wop wop wop wop wop wop, oh yeah. Woo woooooo wooo woooooo. Get down get down");
    }
  }

  const fieldsHtml = words.map((word, i) =>
    `<div class="field"><input id="${
      wordToId(word)
    }" type="text" onfocus="speak('${
      word
    }')" onblur="updateResults()" /></div>`
  ).join('');

  const resultsHtml = Object.entries(spellingState).map(([word, count]) => `<div class="results-word"><h3>${word}</h3><span>${count}</span></div>`).join('');

  $('#form-fields').innerHTML = (fieldsHtml);
  $('#results').innerHTML = (resultsHtml);

  window.clearCelebration();

}());
