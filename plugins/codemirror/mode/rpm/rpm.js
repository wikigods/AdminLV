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

  CodeMirror.defineMode("rpm-changes", function() {
    var headerSeparator = /^-+$/
    var headerLine = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)  ?\d{1,2} \d{2}:\d{2}(:\d{2})? [A-Z]{3,4} \d{4} - /
    var simpleEmail = /^[\w+.-]+@[\w.-]+/

    return {
      token: function(stream) {
        if (stream.sol()) {
          if (headerSeparator.test(stream)) { return 'tag' }
          if (headerLine.test(stream)) { return 'tag' }
        }
        if (simpleEmail.test(stream)) { return 'string' }
        stream.next()
        return null
      }
    }
  })

  CodeMirror.defineMIME("text/x-rpm-changes", "rpm-changes")

  // Quick and dirty spec file highlighting

  CodeMirror.defineMode("rpm-spec", function() {
    var arch = /^(i386|i586|i686|x86_64|ppc64le|ppc64|ppc|ia64|s390x|s390|sparc64|sparcv9|sparc|noarch|alphaev6|alpha|hppa|mipsel)/

    var preamble = /^[a-zA-Z0-9()]+:/
    var section = /^%(debug_package|package|description|prep|build|install|files|clean|changelog|preinstall|preun|postinstall|postun|pretrans|posttrans|pre|post|triggerin|triggerun|verifyscript|check|triggerpostun|triggerprein|trigger)/
    var control_flow_complex = /^%(ifnarch|ifarch|if)/ // rpm control flow macros
    var control_flow_simple = /^%(else|endif)/ // rpm control flow macros
    var operators = /^(\!|\?|\<\=|\<|\>\=|\>|\=\=|\&\&|\|\|)/ // operators in control flow macros

    return {
      startState: function () {
        return {
          controlFlow: false,
          macroParameters: false,
          section: false
        }
      },
      token: function (stream, state) {
        var ch = stream.peek()
        if (ch == "#") { stream.skipToEnd(); return "comment" }

        if (stream.sol()) {
          if (preamble.test(stream)) { return "header" }
          if (section.test(stream)) { return "atom" }
        }

        if (/^\$\w+/.test(stream)) { return "def" } // Variables like '$RPM_BUILD_ROOT'
        if (/^\$\{\w+\}/.test(stream)) { return "def" } // Variables like '${RPM_BUILD_ROOT}'

        if (control_flow_simple.test(stream)) { return "keyword" }
        if (control_flow_complex.test(stream)) {
          state.controlFlow = true
          return "keyword"
        }
        if (state.controlFlow) {
          if (operators.test(stream)) { return "operator" }
          if (/^(\d+)/.test(stream)) { return "number" }
          if (stream.eol()) { state.controlFlow = false }
        }

        if (arch.test(stream)) {
          if (stream.eol()) { state.controlFlow = false }
          return "number"
        }

        // Macros like '%make_install' or '%attr(0775,root,root)'
        if (/^%[\w]+/.test(stream)) {
          if (stream.match('(')) { state.macroParameters = true }
          return "keyword"
        }
        if (state.macroParameters) {
          if (/^\d+/.test(stream)) { return "number"}
          if (stream.match(')')) {
            state.macroParameters = false
            return "keyword"
          }
        }

        // Macros like '%{defined fedora}'
        if (/^%\{\??[\w \-\:\!]+\}/.test(stream)) {
          if (stream.eol()) { state.controlFlow = false }
          return "def"
        }

        //TODO: Include bash script sub-parser (CodeMirror supports that)
        stream.next()
        return null
      }
    }
  })

  CodeMirror.defineMIME("text/x-rpm-spec", "rpm-spec")

})
