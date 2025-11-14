// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

// Brainfuck mode created by Michael Kaminsky https://github.com/mkaminsky11

(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"))
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror"], mod)
  else
    mod(CodeMirror)
})(function(CodeMirror) {
  "use strict"
  var reserve = [..."><+-.,[]"]
  /*
  comments can be either:
  placed behind lines

        +++    this is a comment

  where reserved characters cannot be used
  or in a loop
  [
    this is ok to use [ ] and stuff
  ]
  or preceded by #
  */
  CodeMirror.defineMode("brainfuck", function() {
    return {
      startState: function() {
        return {
          commentLine: false,
          left: 0,
          right: 0,
          commentLoop: false
        }
      },
      token: function(stream, state) {
        if (stream.eatSpace()) return null
        if(stream.sol()){
          state.commentLine = false
        }
        var ch = stream.next().toString()
        if(reserve.indexOf(ch) === -1){
          state.commentLine = true
          if(stream.eol()){
            state.commentLine = false
          }
          return "comment"
        }
        else{
          if(state.commentLine === true){
            if(stream.eol()){
              state.commentLine = false
            }
            return "comment"
          }
          switch (ch) {
            case "]": 
            case "[": {
              if(ch === "["){
                state.left++
              }
              else{
                state.right++
              }
              return "bracket"
            }
            case "+": 
            case "-": {
              return "keyword"
            }
            case "<": 
            case ">": {
              return "atom"
            }
            case ".": 
            case ",": {
              return "def"
            }
          // No default
          }
        }
        if(stream.eol()){
          state.commentLine = false
        }
      }
    }
  })
  CodeMirror.defineMIME("text/x-brainfuck","brainfuck")
})
