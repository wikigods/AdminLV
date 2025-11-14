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

  CodeMirror.defineMode("octave", function() {
    function wordRegexp(words) {
      return new RegExp(`^((${  words.join(")|(")  }))\\b`)
    }

    var singleOperators = new RegExp(String.raw`^[\+\-\*/&|\^~<>!@'\\]`)
    var singleDelimiters = new RegExp(String.raw`^[\(\[\{\},:=;\.]`)
    var doubleOperators = new RegExp(String.raw`^((==)|(~=)|(<=)|(>=)|(<<)|(>>)|(\.[\+\-\*/\^\\]))`)
    var doubleDelimiters = new RegExp(String.raw`^((!=)|(\+=)|(\-=)|(\*=)|(/=)|(&=)|(\|=)|(\^=))`)
    var tripleDelimiters = new RegExp("^((>>=)|(<<=))")
    var expressionEnd = new RegExp(String.raw`^[\]\)]`)
    var identifiers = new RegExp("^[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*")

    var builtins = wordRegexp([
      'error', 'eval', 'function', 'abs', 'acos', 'atan', 'asin', 'cos',
      'cosh', 'exp', 'log', 'prod', 'sum', 'log10', 'max', 'min', 'sign', 'sin', 'sinh',
      'sqrt', 'tan', 'reshape', 'break', 'zeros', 'default', 'margin', 'round', 'ones',
      'rand', 'syn', 'ceil', 'floor', 'size', 'clear', 'zeros', 'eye', 'mean', 'std', 'cov',
      'det', 'eig', 'inv', 'norm', 'rank', 'trace', 'expm', 'logm', 'sqrtm', 'linspace', 'plot',
      'title', 'xlabel', 'ylabel', 'legend', 'text', 'grid', 'meshgrid', 'mesh', 'num2str',
      'fft', 'ifft', 'arrayfun', 'cellfun', 'input', 'fliplr', 'flipud', 'ismember'
    ])

    var keywords = wordRegexp([
      'return', 'case', 'switch', 'else', 'elseif', 'end', 'endif', 'endfunction',
      'if', 'otherwise', 'do', 'for', 'while', 'try', 'catch', 'classdef', 'properties', 'events',
      'methods', 'global', 'persistent', 'endfor', 'endwhile', 'printf', 'sprintf', 'disp', 'until',
      'continue', 'pkg'
    ])


    // tokenizers
    function tokenTranspose(stream, state) {
      if (!stream.sol() && stream.peek() === '\'') {
        stream.next()
        state.tokenize = tokenBase
        return 'operator'
      }
      state.tokenize = tokenBase
      return tokenBase(stream, state)
    }


    function tokenComment(stream, state) {
      if (/^.*%}/.test(stream)) {
        state.tokenize = tokenBase
        return 'comment'
      };
      stream.skipToEnd()
      return 'comment'
    }

    function tokenBase(stream, state) {
    // whitespaces
      if (stream.eatSpace()) return null

      // Handle one line Comments
      if (stream.match('%{')){
        state.tokenize = tokenComment
        stream.skipToEnd()
        return 'comment'
      }

      if (/^[%#]/.test(stream)){
        stream.skipToEnd()
        return 'comment'
      }

      // Handle Number Literals
      if (stream.match(/^[0-9\.+-]/, false)) {
        if (/^[+-]?0x[0-9a-fA-F]+[ij]?/.test(stream)) {
          stream.tokenize = tokenBase
          return 'number' };
        if (/^[+-]?\d*\.\d+([EeDd][+-]?\d+)?[ij]?/.test(stream)) { return 'number' };
        if (/^[+-]?\d+([EeDd][+-]?\d+)?[ij]?/.test(stream)) { return 'number' };
      }
      if (stream.match(wordRegexp(['nan','NaN','inf','Inf']))) { return 'number' };

      // Handle Strings
      var m = stream.match(/^"(?:[^"]|"")*("|$)/) || stream.match(/^'(?:[^']|'')*('|$)/)
      if (m) { return m[1] ? 'string' : "string error" }

      // Handle words
      if (stream.match(keywords)) { return 'keyword' } ;
      if (stream.match(builtins)) { return 'builtin' } ;
      if (identifiers.test(stream)) { return 'variable' } ;

      if (singleOperators.test(stream) || doubleOperators.test(stream)) { return 'operator' };
      if (singleDelimiters.test(stream) || doubleDelimiters.test(stream) || tripleDelimiters.test(stream)) { return null };

      if (expressionEnd.test(stream)) {
        state.tokenize = tokenTranspose
        return null
      };


      // Handle non-detected items
      stream.next()
      return 'error'
    };


    return {
      startState: function() {
        return {
          tokenize: tokenBase
        }
      },

      token: function(stream, state) {
        var style = state.tokenize(stream, state)
        if (style === 'number' || style === 'variable'){
          state.tokenize = tokenTranspose
        }
        return style
      },

      lineComment: '%',

      fold: 'indent'
    }
  })

  CodeMirror.defineMIME("text/x-octave", "octave")

})
