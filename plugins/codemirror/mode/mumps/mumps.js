// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

/*
  This MUMPS Language script was constructed using vbscript.js as a template.
*/

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"))
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod)
  else // Plain browser env
    mod(CodeMirror)
})(function(CodeMirror) {
  "use strict"

  CodeMirror.defineMode("mumps", function() {
    function wordRegexp(words) {
      return new RegExp(`^((${  words.join(")|(")  }))\\b`, "i")
    }

    var singleOperators = new RegExp(String.raw`^[\+\-\*/&#!_?\\<>=\'\[\]]`)
    var doubleOperators = new RegExp("^(('=)|(<=)|(>=)|('>)|('<)|([[)|(]])|(^$))")
    var singleDelimiters = new RegExp(String.raw`^[\.,:]`)
    var brackets = new RegExp("[()]")
    var identifiers = new RegExp("^[%A-Za-z][A-Za-z0-9]*")
    var commandKeywords = ["break","close","do","else","for","goto", "halt", "hang", "if", "job","kill","lock","merge","new","open", "quit", "read", "set", "tcommit", "trollback", "tstart", "use", "view", "write", "xecute", "b","c","d","e","f","g", "h", "i", "j","k","l","m","n","o", "q", "r", "s", "tc", "tro", "ts", "u", "v", "w", "x"]
    // The following list includes intrinsic functions _and_ special variables
    var intrinsicFuncsWords = [String.raw`\$ascii`, String.raw`\$char`, String.raw`\$data`, String.raw`\$ecode`, String.raw`\$estack`, String.raw`\$etrap`, String.raw`\$extract`, String.raw`\$find`, String.raw`\$fnumber`, String.raw`\$get`, String.raw`\$horolog`, String.raw`\$io`, String.raw`\$increment`, String.raw`\$job`, String.raw`\$justify`, String.raw`\$length`, String.raw`\$name`, String.raw`\$next`, String.raw`\$order`, String.raw`\$piece`, String.raw`\$qlength`, String.raw`\$qsubscript`, String.raw`\$query`, String.raw`\$quit`, String.raw`\$random`, String.raw`\$reverse`, String.raw`\$select`, String.raw`\$stack`, String.raw`\$test`, String.raw`\$text`, String.raw`\$translate`, String.raw`\$view`, String.raw`\$x`, String.raw`\$y`, String.raw`\$a`, String.raw`\$c`, String.raw`\$d`, String.raw`\$e`, String.raw`\$ec`, String.raw`\$es`, String.raw`\$et`, String.raw`\$f`, String.raw`\$fn`, String.raw`\$g`, String.raw`\$h`, String.raw`\$i`, String.raw`\$j`, String.raw`\$l`, String.raw`\$n`, String.raw`\$na`, String.raw`\$o`, String.raw`\$p`, String.raw`\$q`, String.raw`\$ql`, String.raw`\$qs`, String.raw`\$r`, String.raw`\$re`, String.raw`\$s`, String.raw`\$st`, String.raw`\$t`, String.raw`\$tr`, String.raw`\$v`, String.raw`\$z`]
    var intrinsicFuncs = wordRegexp(intrinsicFuncsWords)
    var command = wordRegexp(commandKeywords)

    function tokenBase(stream, state) {
      if (stream.sol()) {
        state.label = true
        state.commandMode = 0
      }

      // The <space> character has meaning in MUMPS. Ignoring consecutive
      // spaces would interfere with interpreting whether the next non-space
      // character belongs to the command or argument context.

      // Examine each character and update a mode variable whose interpretation is:
      //   >0 => command    0 => argument    <0 => command post-conditional
      var ch = stream.peek()

      if (ch == " " || ch == "\t") { // Pre-process <space>
        state.label = false
        if (state.commandMode == 0)
          state.commandMode = 1
        else if ((state.commandMode < 0) || (state.commandMode == 2))
          state.commandMode = 0
      } else if ((ch != ".") && (state.commandMode > 0)) {
        if (ch == ":")
          state.commandMode = -1   // SIS - Command post-conditional
        else
          state.commandMode = 2
      }

      // Do not color parameter list as line tag
      if ((ch === "(") || (ch === "\u0009"))
        state.label = false

      // MUMPS comment starts with ";"
      if (ch === ";") {
        stream.skipToEnd()
        return "comment"
      }

      // Number Literals // SIS/RLM - MUMPS permits canonic number followed by concatenate operator
      if (/^[-+]?\d+(\.\d+)?([eE][-+]?\d+)?/.test(stream))
        return "number"

      // Handle Strings
      if (ch == '"') {
        if (stream.skipTo('"')) {
          stream.next()
          return "string"
        } else {
          stream.skipToEnd()
          return "error"
        }
      }

      // Handle operators and Delimiters
      if (doubleOperators.test(stream) || singleOperators.test(stream))
        return "operator"

      // Prevents leading "." in DO block from falling through to error
      if (singleDelimiters.test(stream))
        return null

      if (brackets.test(ch)) {
        stream.next()
        return "bracket"
      }

      if (state.commandMode > 0 && stream.match(command))
        return "variable-2"

      if (stream.match(intrinsicFuncs))
        return "builtin"

      if (identifiers.test(stream))
        return "variable"

      // Detect dollar-sign when not a documented intrinsic function
      // "^" may introduce a GVN or SSVN - Color same as function
      if (ch === "$" || ch === "^") {
        stream.next()
        return "builtin"
      }

      // MUMPS Indirection
      if (ch === "@") {
        stream.next()
        return "string-2"
      }

      if (/[\w%]/.test(ch)) {
        stream.eatWhile(/[\w%]/)
        return "variable"
      }

      // Handle non-detected items
      stream.next()
      return "error"
    }

    return {
      startState: function() {
        return {
          label: false,
          commandMode: 0
        }
      },

      token: function(stream, state) {
        var style = tokenBase(stream, state)
        if (state.label) return "tag"
        return style
      }
    }
  })

  CodeMirror.defineMIME("text/x-mumps", "mumps")
})
