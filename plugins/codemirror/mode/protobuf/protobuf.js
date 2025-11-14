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

  function wordRegexp(words) {
    return new RegExp(`^((${  words.join(")|(")  }))\\b`, "i")
  };

  var keywordArray = [
    "package", "message", "import", "syntax",
    "required", "optional", "repeated", "reserved", "default", "extensions", "packed",
    "bool", "bytes", "double", "enum", "float", "string",
    "int32", "int64", "uint32", "uint64", "sint32", "sint64", "fixed32", "fixed64", "sfixed32", "sfixed64",
    "option", "service", "rpc", "returns"
  ]
  var keywords = wordRegexp(keywordArray)

  CodeMirror.registerHelper("hintWords", "protobuf", keywordArray)

  var identifiers = new RegExp("^[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*")

  function tokenBase(stream) {
    // whitespaces
    if (stream.eatSpace()) return null

    // Handle one line Comments
    if (stream.match("//")) {
      stream.skipToEnd()
      return "comment"
    }

    // Handle Number Literals
    if (stream.match(/^[0-9\.+-]/, false)) {
      if (/^[+-]?0x[0-9a-fA-F]+/.test(stream))
        return "number"
      if (/^[+-]?\d*\.\d+([EeDd][+-]?\d+)?/.test(stream))
        return "number"
      if (/^[+-]?\d+([EeDd][+-]?\d+)?/.test(stream))
        return "number"
    }

    // Handle Strings
    if (/^"([^"]|(""))*"/.test(stream)) { return "string" }
    if (/^'([^']|(''))*'/.test(stream)) { return "string" }

    // Handle words
    if (stream.match(keywords)) { return "keyword" }
    if (identifiers.test(stream)) { return "variable" } ;

    // Handle non-detected items
    stream.next()
    return null
  };

  CodeMirror.defineMode("protobuf", function() {
    return {
      token: tokenBase,
      fold: "brace"
    }
  })

  CodeMirror.defineMIME("text/x-protobuf", "protobuf")
})
