// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../css/css"))
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../css/css"], mod)
  else // Plain browser env
    mod(CodeMirror)
})(function(CodeMirror) {
  "use strict"

  CodeMirror.defineMode("sass", function(config) {
    var cssMode = CodeMirror.mimeModes["text/css"]
    var propertyKeywords = cssMode.propertyKeywords || {},
      colorKeywords = cssMode.colorKeywords || {},
      valueKeywords = cssMode.valueKeywords || {},
      fontProperties = cssMode.fontProperties || {}

    function tokenRegexp(words) {
      return new RegExp(`^${  words.join("|")}`)
    }

    var keywords = ["true", "false", "null", "auto"]
    var keywordsRegexp = new RegExp(`^${  keywords.join("|")}`)

    var operators = [String.raw`\(`, String.raw`\)`, "=", ">", "<", "==", ">=", "<=", String.raw`\+`, "-",
      String.raw`\!=`, "/", String.raw`\*`, "%", "and", "or", "not", ";",String.raw`\{`,String.raw`\}`,":"]
    var opRegexp = tokenRegexp(operators)

    var pseudoElementsRegexp = /^::?[a-zA-Z_][\w\-]*/

    var word

    function isEndLine(stream) {
      return !stream.peek() || stream.match(/\s+$/, false)
    }

    function urlTokens(stream, state) {
      var ch = stream.peek()

      switch (ch) {
        case ")": {
          stream.next()
          state.tokenizer = tokenBase
          return "operator"
        }
        case "(": {
          stream.next()
          stream.eatSpace()

          return "operator"
        }
        case "'": 
        case '"': {
          state.tokenizer = buildStringTokenizer(stream.next())
          return "string"
        }
        default: {
          state.tokenizer = buildStringTokenizer(")", false)
          return "string"
        }
      }
    }
    function comment(indentation, multiLine) {
      return function(stream, state) {
        if (stream.sol() && stream.indentation() <= indentation) {
          state.tokenizer = tokenBase
          return tokenBase(stream, state)
        }

        if (multiLine && stream.skipTo("*/")) {
          stream.next()
          stream.next()
          state.tokenizer = tokenBase
        } else {
          stream.skipToEnd()
        }

        return "comment"
      }
    }

    function buildStringTokenizer(quote, greedy) {
      if (greedy == null) { greedy = true }

      function stringTokenizer(stream, state) {
        var nextChar = stream.next()
        var peekChar = stream.peek()
        var previousChar = stream.string.charAt(stream.pos-2)

        var endingString = ((nextChar !== "\\" && peekChar === quote) || (nextChar === quote && previousChar !== "\\"))

        if (endingString) {
          if (nextChar !== quote && greedy) { stream.next() }
          if (isEndLine(stream)) {
            state.cursorHalf = 0
          }
          state.tokenizer = tokenBase
          return "string"
        } else if (nextChar === "#" && peekChar === "{") {
          state.tokenizer = buildInterpolationTokenizer(stringTokenizer)
          stream.next()
          return "operator"
        } else {
          return "string"
        }
      }

      return stringTokenizer
    }

    function buildInterpolationTokenizer(currentTokenizer) {
      return function(stream, state) {
        if (stream.peek() === "}") {
          stream.next()
          state.tokenizer = currentTokenizer
          return "operator"
        } else {
          return tokenBase(stream, state)
        }
      }
    }

    function indent(state) {
      if (state.indentCount == 0) {
        state.indentCount++
        var lastScopeOffset = state.scopes[0].offset
        var currentOffset = lastScopeOffset + config.indentUnit
        state.scopes.unshift({ offset:currentOffset })
      }
    }

    function dedent(state) {
      if (state.scopes.length == 1) return

      state.scopes.shift()
    }

    function tokenBase(stream, state) {
      var ch = stream.peek()

      // Comment
      if (stream.match("/*")) {
        state.tokenizer = comment(stream.indentation(), true)
        return state.tokenizer(stream, state)
      }
      if (stream.match("//")) {
        state.tokenizer = comment(stream.indentation(), false)
        return state.tokenizer(stream, state)
      }

      // Interpolation
      if (stream.match("#{")) {
        state.tokenizer = buildInterpolationTokenizer(tokenBase)
        return "operator"
      }

      // Strings
      if (ch === '"' || ch === "'") {
        stream.next()
        state.tokenizer = buildStringTokenizer(ch)
        return "string"
      }

      if(state.cursorHalf){

        if (ch === "#") {
          stream.next()
          // Hex numbers
          if (/[0-9a-fA-F]{6}|[0-9a-fA-F]{3}/.test(stream)){
            if (isEndLine(stream)) {
              state.cursorHalf = 0
            }
            return "number"
          }
        }

        // Numbers
        if (/^-?[0-9\.]+/.test(stream)){
          if (isEndLine(stream)) {
            state.cursorHalf = 0
          }
          return "number"
        }

        // Units
        if (/^(px|em|in)\b/.test(stream)){
          if (isEndLine(stream)) {
            state.cursorHalf = 0
          }
          return "unit"
        }

        if (keywordsRegexp.test(stream)){
          if (isEndLine(stream)) {
            state.cursorHalf = 0
          }
          return "keyword"
        }

        if (stream.startsWith('url') && stream.peek() === "(") {
          state.tokenizer = urlTokens
          if (isEndLine(stream)) {
            state.cursorHalf = 0
          }
          return "atom"
        }

        // Variables
        if (ch === "$") {
          stream.next()
          stream.eatWhile(/[\w-]/)
          if (isEndLine(stream)) {
            state.cursorHalf = 0
          }
          return "variable-2"
        }

        // bang character for !important, !default, etc.
        if (ch === "!") {
          stream.next()
          state.cursorHalf = 0
          return /^[\w]+/.test(stream) ? "keyword": "operator"
        }

        if (stream.match(opRegexp)){
          if (isEndLine(stream)) {
            state.cursorHalf = 0
          }
          return "operator"
        }

        // attributes
        if (stream.eatWhile(/[\w-]/)) {
          if (isEndLine(stream)) {
            state.cursorHalf = 0
          }
          word = stream.current().toLowerCase()
          if (valueKeywords.hasOwnProperty(word)) {
            return "atom"
          } else if (colorKeywords.hasOwnProperty(word)) {
            return "keyword"
          } else if (propertyKeywords.hasOwnProperty(word)) {
            state.prevProp = stream.current().toLowerCase()
            return "property"
          } else {
            return "tag"
          }
        }

        //stream.eatSpace();
        if (isEndLine(stream)) {
          state.cursorHalf = 0
          return null
        }

      } // cursorHalf===0 ends here
      else{// state.cursorHalf === 0
        // first half i.e. before : for key-value pairs
        // including selectors

        if (ch === "-" && /^-\w+-/.test(stream)) {
          return "meta"
        }

        if (ch === ".") {
          stream.next()
          if (/^[\w-]+/.test(stream)) {
            indent(state)
            return "qualifier"
          } else if (stream.peek() === "#") {
            indent(state)
            return "tag"
          }
        }

        if (ch === "#") {
          stream.next()
          // ID selectors
          if (/^[\w-]+/.test(stream)) {
            indent(state)
            return "builtin"
          }
          if (stream.peek() === "#") {
            indent(state)
            return "tag"
          }
        }

        // Variables
        if (ch === "$") {
          stream.next()
          stream.eatWhile(/[\w-]/)
          return "variable-2"
        }

        // Numbers
        if (/^-?[0-9\.]+/.test(stream))
          return "number"

        // Units
        if (/^(px|em|in)\b/.test(stream))
          return "unit"

        if (keywordsRegexp.test(stream))
          return "keyword"

        if (stream.startsWith('url') && stream.peek() === "(") {
          state.tokenizer = urlTokens
          return "atom"
        }

        if (ch === "=" && // Match shortcut mixin definition
        /^=[\w-]+/.test(stream)) {
          indent(state)
          return "meta"
        }

        if (ch === "+" && // Match shortcut mixin definition
        /^\+[\w-]+/.test(stream)) {
          return "variable-3"
        }

        if(ch === "@" && stream.match('@extend') && !/\s*[\w]/.test(stream)) dedent(state)


        // Indent Directives
        if (/^@(else if|if|media|else|for|each|while|mixin|function)/.test(stream)) {
          indent(state)
          return "def"
        }

        // Other Directives
        if (ch === "@") {
          stream.next()
          stream.eatWhile(/[\w-]/)
          return "def"
        }

        if (stream.eatWhile(/[\w-]/)){
          if(stream.match(/ *: *[\w-\+\$#!\("']/,false)){
            word = stream.current().toLowerCase()
            var prop = `${state.prevProp  }-${  word}`
            if (propertyKeywords.hasOwnProperty(prop)) {
              return "property"
            } else if (propertyKeywords.hasOwnProperty(word)) {
              state.prevProp = word
              return "property"
            } else if (fontProperties.hasOwnProperty(word)) {
              return "property"
            }
            return "tag"
          }
          else if(stream.match(/ *:/,false)){
            indent(state)
            state.cursorHalf = 1
            state.prevProp = stream.current().toLowerCase()
            return "property"
          }
          else if(stream.match(/ *,/,false)){
            return "tag"
          }
          else{
            indent(state)
            return "tag"
          }
        }

        if(ch === ":"){
          if (pseudoElementsRegexp.test(stream)){ // could be a pseudo-element
            return "variable-3"
          }
          stream.next()
          state.cursorHalf=1
          return "operator"
        }

      } // else ends here

      if (stream.match(opRegexp))
        return "operator"

      // If we haven't returned by now, we move 1 character
      // and return an error
      stream.next()
      return null
    }

    function tokenLexer(stream, state) {
      if (stream.sol()) state.indentCount = 0
      var style = state.tokenizer(stream, state)
      var current = stream.current()

      if (current === "@return" || current === "}"){
        dedent(state)
      }

      if (style !== null) {
        var startOfToken = stream.pos - current.length

        var withCurrentIndent = startOfToken + (config.indentUnit * state.indentCount)

        var newScopes = []

        for (var i = 0; i < state.scopes.length; i++) {
          var scope = state.scopes[i]

          if (scope.offset <= withCurrentIndent)
            newScopes.push(scope)
        }

        state.scopes = newScopes
      }


      return style
    }

    return {
      startState: function() {
        return {
          tokenizer: tokenBase,
          scopes: [{ offset: 0, type: "sass" }],
          indentCount: 0,
          cursorHalf: 0,  // cursor half tells us if cursor lies after (1)
          // or before (0) colon (well... more or less)
          definedVars: [],
          definedMixins: []
        }
      },
      token: function(stream, state) {
        var style = tokenLexer(stream, state)

        state.lastToken = { style: style, content: stream.current() }

        return style
      },

      indent: function(state) {
        return state.scopes[0].offset
      },

      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      lineComment: "//",
      fold: "indent"
    }
  }, "css")

  CodeMirror.defineMIME("text/x-sass", "sass")

})
