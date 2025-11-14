// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"))
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod)
  else // Plain browser env
    mod(CodeMirror)
})(function(CodeMirror) {
  "use strict"

  CodeMirror.defineMode("julia", function(config, parserConf) {
    function wordRegexp(words, end, pre) {
      if (pre === undefined) { pre = "" }
      if (end === undefined) { end = String.raw`\b` }
      return new RegExp(`^${  pre  }((${  words.join(")|(")  }))${  end}`)
    }

    var octChar = String.raw`\\[0-7]{1,3}`
    var hexChar = String.raw`\\x[A-Fa-f0-9]{1,2}`
    var sChar = String.raw`\\[abefnrtv0%?'"\\]`
    var uChar = String.raw`([^\u0027\u005C\uD800-\uDFFF]|[\uD800-\uDFFF][\uDC00-\uDFFF])`

    var asciiOperatorsList = [
      "[<>]:", "[<>=]=", "<<=?", ">>>?=?", "=>", "--?>", "<--[->]?", String.raw`\/\/`,
      String.raw`\.{2,3}`, String.raw`[\.\\%*+\-<>!\/^|&]=?`, String.raw`\?`, String.raw`\$`, "~", ":"
    ]
    var operators = parserConf.operators || wordRegexp([
      "[<>]:", "[<>=]=", "[!=]==", "<<=?", ">>>?=?", "=>?", "--?>", "<--[->]?", String.raw`\/\/`,
      String.raw`[\\%*+\-<>!\/^|&\u00F7\u22BB]=?`, String.raw`\?`, String.raw`\$`, "~", ":",
      String.raw`\u00D7`, String.raw`\u2208`, String.raw`\u2209`, String.raw`\u220B`, String.raw`\u220C`, String.raw`\u2218`,
      String.raw`\u221A`, String.raw`\u221B`, String.raw`\u2229`, String.raw`\u222A`, String.raw`\u2260`, String.raw`\u2264`,
      String.raw`\u2265`, String.raw`\u2286`, String.raw`\u2288`, String.raw`\u228A`, String.raw`\u22C5`,
      "\\b(in|isa)\\b(?!\.?\\()"
    ], "")
    var delimiters = parserConf.delimiters || /^[;,()[\]{}]/
    var identifiers = parserConf.identifiers ||
        /^[_A-Za-z\u00A1-\u2217\u2219-\uFFFF][\w\u00A1-\u2217\u2219-\uFFFF]*!*/

    var chars = wordRegexp([octChar, hexChar, sChar, uChar], "'")

    var openersList = ["begin", "function", "type", "struct", "immutable", "let",
      "macro", "for", "while", "quote", "if", "else", "elseif", "try",
      "finally", "catch", "do"]

    var closersList = ["end", "else", "elseif", "catch", "finally"]

    var keywordsList = ["if", "else", "elseif", "while", "for", "begin", "let",
      "end", "do", "try", "catch", "finally", "return", "break", "continue",
      "global", "local", "const", "export", "import", "importall", "using",
      "function", "where", "macro", "module", "baremodule", "struct", "type",
      "mutable", "immutable", "quote", "typealias", "abstract", "primitive",
      "bitstype"]

    var builtinsList = ["true", "false", "nothing", "NaN", "Inf"]

    CodeMirror.registerHelper("hintWords", "julia", [...keywordsList, ...builtinsList])

    var openers = wordRegexp(openersList)
    var closers = wordRegexp(closersList)
    var keywords = wordRegexp(keywordsList)
    var builtins = wordRegexp(builtinsList)

    var macro = /^@[_A-Za-z\u00A1-\uFFFF][\w\u00A1-\uFFFF]*!*/
    var symbol = /^:[_A-Za-z\u00A1-\uFFFF][\w\u00A1-\uFFFF]*!*/
    var stringPrefixes = /^(`|([_A-Za-z\u00A1-\uFFFF]*"("")?))/

    var macroOperators = wordRegexp(asciiOperatorsList, "", "@")
    var symbolOperators = wordRegexp(asciiOperatorsList, "", ":")

    function inArray(state) {
      return (state.nestedArrays > 0)
    }

    function inGenerator(state) {
      return (state.nestedGenerators > 0)
    }

    function currentScope(state, n) {
      if ((n) === undefined) { n = 0 }
      if (state.scopes.length <= n) {
        return null
      }
      return state.scopes[state.scopes.length - (n + 1)]
    }

    // tokenizers
    function tokenBase(stream, state) {
    // Handle multiline comments
      if (stream.match('#=', false)) {
        state.tokenize = tokenComment
        return state.tokenize(stream, state)
      }

      // Handle scope changes
      var leavingExpr = state.leavingExpr
      if (stream.sol()) {
        leavingExpr = false
      }
      state.leavingExpr = false

      if (leavingExpr && /^'+/.test(stream)) {
        return "operator"
      }

      if (/\.{4,}/.test(stream)) {
        return "error"
      } else if (/\.{1,3}/.test(stream)) {
        return "operator"
      }

      if (stream.eatSpace()) {
        return null
      }

      var ch = stream.peek()

      // Handle single line comments
      if (ch === '#') {
        stream.skipToEnd()
        return "comment"
      }

      if (ch === '[') {
        state.scopes.push('[')
        state.nestedArrays++
      }

      if (ch === '(') {
        state.scopes.push('(')
        state.nestedGenerators++
      }

      if (inArray(state) && ch === ']') {
        while (state.scopes.length > 0 && currentScope(state) !== "[") { state.scopes.pop() }
        state.scopes.pop()
        state.nestedArrays--
        state.leavingExpr = true
      }

      if (inGenerator(state) && ch === ')') {
        while (state.scopes.length > 0 && currentScope(state) !== "(") { state.scopes.pop() }
        state.scopes.pop()
        state.nestedGenerators--
        state.leavingExpr = true
      }

      if (inArray(state)) {
        if (state.lastToken == "end" && stream.match(':')) {
          return "operator"
        }
        if (stream.match('end')) {
          return "number"
        }
      }

      var match
      if (match = stream.match(openers, false)) {
        state.scopes.push(match[0])
      }

      if (stream.match(closers, false)) {
        state.scopes.pop()
      }

      // Handle type annotations
      if (/^::(?![:\$])/.test(stream)) {
        state.tokenize = tokenAnnotation
        return state.tokenize(stream, state)
      }

      // Handle symbols
      if (!leavingExpr && (symbol.test(stream) || stream.match(symbolOperators))) {
        return "builtin"
      }

      // Handle parametric types
      //if (stream.match(/^{[^}]*}(?=\()/)) {
      //  return "builtin";
      //}

      // Handle operators and Delimiters
      if (stream.match(operators)) {
        return "operator"
      }

      // Handle Number Literals
      if (stream.match(/^\.?\d/, false)) {
        var imMatcher = new RegExp(/^im\b/)
        var numberLiteral = false
        if (/^0x\.[0-9a-f_]+p[\+\-]?[_\d]+/i.test(stream)) { numberLiteral = true }
        // Integers
        if (/^0x[0-9a-f_]+/i.test(stream)) { numberLiteral = true } // Hex
        if (/^0b[01_]+/i.test(stream)) { numberLiteral = true } // Binary
        if (/^0o[0-7_]+/i.test(stream)) { numberLiteral = true } // Octal
        // Floats
        if (/^(?:(?:\d[_\d]*)?\.(?!\.)(?:\d[_\d]*)?|\d[_\d]*\.(?!\.)(?:\d[_\d]*))?([Eef][\+\-]?[_\d]+)?/i.test(stream)) { numberLiteral = true }
        if (/^\d[_\d]*(e[\+\-]?\d+)?/i.test(stream)) { numberLiteral = true } // Decimal
        if (numberLiteral) {
          // Integer literals may be "long"
          stream.match(imMatcher)
          state.leavingExpr = true
          return "number"
        }
      }

      // Handle Chars
      if (stream.match('\'')) {
        state.tokenize = tokenChar
        return state.tokenize(stream, state)
      }

      // Handle Strings
      if (stringPrefixes.test(stream)) {
        state.tokenize = tokenStringFactory(stream.current())
        return state.tokenize(stream, state)
      }

      if (macro.test(stream) || stream.match(macroOperators)) {
        return "meta"
      }

      if (stream.match(delimiters)) {
        return null
      }

      if (stream.match(keywords)) {
        return "keyword"
      }

      if (stream.match(builtins)) {
        return "builtin"
      }

      var isDefinition = state.isDefinition || state.lastToken == "function" ||
                       state.lastToken == "macro" || state.lastToken == "type" ||
                       state.lastToken == "struct" || state.lastToken == "immutable"

      if (stream.match(identifiers)) {
        if (isDefinition) {
          if (stream.peek() === '.') {
            state.isDefinition = true
            return "variable"
          }
          state.isDefinition = false
          return "def"
        }
        state.leavingExpr = true
        return "variable"
      }

      // Handle non-detected items
      stream.next()
      return "error"
    }

    function tokenAnnotation(stream, state) {
      stream.match(/.*?(?=[,;{}()=\s]|$)/)
      if (stream.match('{')) {
        state.nestedParameters++
      } else if (stream.match('}') && state.nestedParameters > 0) {
        state.nestedParameters--
      }
      if (state.nestedParameters > 0) {
        stream.match(/.*?(?={|})/) || stream.next()
      } else if (state.nestedParameters == 0) {
        state.tokenize = tokenBase
      }
      return "builtin"
    }

    function tokenComment(stream, state) {
      if (stream.match('#=')) {
        state.nestedComments++
      }
      if (!/.*?(?=(#=|=#))/.test(stream)) {
        stream.skipToEnd()
      }
      if (stream.match('=#')) {
        state.nestedComments--
        if (state.nestedComments == 0)
          state.tokenize = tokenBase
      }
      return "comment"
    }

    function tokenChar(stream, state) {
      var isChar = false, match
      if (stream.match(chars)) {
        isChar = true
      } else if (match = stream.match(/\\u([a-f0-9]{1,4})(?=')/i)) {
        var value = parseInt(match[1], 16)
        if (value <= 55_295 || value >= 57_344) { // (U+0,U+D7FF), (U+E000,U+FFFF)
          isChar = true
          stream.next()
        }
      } else if (match = stream.match(/\\U([A-Fa-f0-9]{5,8})(?=')/)) {
        var value = parseInt(match[1], 16)
        if (value <= 1_114_111) { // U+10FFFF
          isChar = true
          stream.next()
        }
      }
      if (isChar) {
        state.leavingExpr = true
        state.tokenize = tokenBase
        return "string"
      }
      if (!/^[^']+(?=')/.test(stream)) { stream.skipToEnd() }
      if (stream.match('\'')) { state.tokenize = tokenBase }
      return "error"
    }

    function tokenStringFactory(delimiter) {
      if (delimiter.slice(-3) === '"""') {
        delimiter = '"""'
      } else if (delimiter.slice(-1) === '"') {
        delimiter = '"'
      }
      function tokenString(stream, state) {
        if (stream.eat('\\')) {
          stream.next()
        } else if (stream.match(delimiter)) {
          state.tokenize = tokenBase
          state.leavingExpr = true
          return "string"
        } else {
          stream.eat(/[`"]/)
        }
        stream.eatWhile(/[^\\`"]/)
        return "string"
      }
      return tokenString
    }

    var external = {
      startState: function() {
        return {
          tokenize: tokenBase,
          scopes: [],
          lastToken: null,
          leavingExpr: false,
          isDefinition: false,
          nestedArrays: 0,
          nestedComments: 0,
          nestedGenerators: 0,
          nestedParameters: 0,
          firstParenPos: -1
        }
      },

      token: function(stream, state) {
        var style = state.tokenize(stream, state)
        var current = stream.current()

        if (current && style) {
          state.lastToken = current
        }

        return style
      },

      indent: function(state, textAfter) {
        var delta = 0
        if ( textAfter === ']' || textAfter === ')' || /^end\b/.test(textAfter) ||
           textAfter.startsWith('else') || /^catch\b/.test(textAfter) || /^elseif\b/.test(textAfter) ||
           textAfter.startsWith('finally') ) {
          delta = -1
        }
        return (state.scopes.length + delta) * config.indentUnit
      },

      electricInput: /\b(end|else|catch|finally)\b/,
      blockCommentStart: "#=",
      blockCommentEnd: "=#",
      lineComment: "#",
      closeBrackets: "()[]{}\"\"",
      fold: "indent"
    }
    return external
  })


  CodeMirror.defineMIME("text/x-julia", "julia")

})
