const naughtyWords = require('./naughty-words.json');

module.exports = text =>
  text
    .split(/(\W)/)
    .map(word => {
      if (word.toLowerCase() in naughtyWords) {
        let replacement = naughtyWords[word.toLowerCase()];

        /* Match case to original word. Good for sentence-starting capitals. */

        // If the whole word was capitalised, just capitalise the whole replacement.

        if (word === word.toUpperCase()) {
          return replacement.toUpperCase();
        }

        // Otherwise, match case character-by-character.

        for (let i = 0; i < word.length; ++i) {
          const originalCharacter = word.charAt(i);
          const upperCase = (originalCharacter === originalCharacter.toUpperCase());

          if (upperCase) {
            replacement = replacement.substr(0, i) + replacement.charAt(i).toUpperCase() + replacement.substr(i+1);
          }
        }

        return replacement;
      }

      return word;
    })
    .join('');
