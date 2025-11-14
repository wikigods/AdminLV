// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../javascript/javascript"), require("../css/css"), require("../htmlmixed/htmlmixed"))
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../javascript/javascript", "../css/css", "../htmlmixed/htmlmixed"], mod)
  else // Plain browser env
    mod(CodeMirror)
})(function(CodeMirror) {
  "use strict"

  CodeMirror.defineMode("pug", function (config) {
  // token types
    var KEYWORD = 'keyword'
    var DOCTYPE = 'meta'
    var ID = 'builtin'
    var CLASS = 'qualifier'

    var ATTRS_NEST = {
      '{': '}',
      '(': ')',
      '[': ']'
    }

    var jsMode = CodeMirror.getMode(config, 'javascript')

    function State() {
      this.javaScriptLine = false
      this.javaScriptLineExcludesColon = false

      this.javaScriptArguments = false
      this.javaScriptArgumentsDepth = 0

      this.isInterpolating = false
      this.interpolationNesting = 0

      this.jsState = CodeMirror.startState(jsMode)

      this.restOfLine = ''

      this.isIncludeFiltered = false
      this.isEach = false

      this.lastTag = ''
      this.scriptType = ''

      // Attributes Mode
      this.isAttrs = false
      this.attrsNest = []
      this.inAttributeName = true
      this.attributeIsType = false
      this.attrValue = ''

      // Indented Mode
      this.indentOf = Infinity
      this.indentToken = ''

      this.innerMode = null
      this.innerState = null

      this.innerModeForLine = false
    }
    /**
   * Safely copy a state
   *
   * @return {State}
   */
    State.prototype.copy = function () {
      var res = new State()
      res.javaScriptLine = this.javaScriptLine
      res.javaScriptLineExcludesColon = this.javaScriptLineExcludesColon
      res.javaScriptArguments = this.javaScriptArguments
      res.javaScriptArgumentsDepth = this.javaScriptArgumentsDepth
      res.isInterpolating = this.isInterpolating
      res.interpolationNesting = this.interpolationNesting

      res.jsState = CodeMirror.copyState(jsMode, this.jsState)

      res.innerMode = this.innerMode
      if (this.innerMode && this.innerState) {
        res.innerState = CodeMirror.copyState(this.innerMode, this.innerState)
      }

      res.restOfLine = this.restOfLine

      res.isIncludeFiltered = this.isIncludeFiltered
      res.isEach = this.isEach
      res.lastTag = this.lastTag
      res.scriptType = this.scriptType
      res.isAttrs = this.isAttrs
      res.attrsNest = [...this.attrsNest]
      res.inAttributeName = this.inAttributeName
      res.attributeIsType = this.attributeIsType
      res.attrValue = this.attrValue
      res.indentOf = this.indentOf
      res.indentToken = this.indentToken

      res.innerModeForLine = this.innerModeForLine

      return res
    }

    function javaScript(stream, state) {
      if (stream.sol()) {
      // if javaScriptLine was set at end of line, ignore it
        state.javaScriptLine = false
        state.javaScriptLineExcludesColon = false
      }
      if (state.javaScriptLine) {
        if (state.javaScriptLineExcludesColon && stream.peek() === ':') {
          state.javaScriptLine = false
          state.javaScriptLineExcludesColon = false
          return
        }
        var tok = jsMode.token(stream, state.jsState)
        if (stream.eol()) state.javaScriptLine = false
        return tok || true
      }
    }
    function javaScriptArguments(stream, state) {
      if (state.javaScriptArguments) {
        if (state.javaScriptArgumentsDepth === 0 && stream.peek() !== '(') {
          state.javaScriptArguments = false
          return
        }
        if (stream.peek() === '(') {
          state.javaScriptArgumentsDepth++
        } else if (stream.peek() === ')') {
          state.javaScriptArgumentsDepth--
        }
        if (state.javaScriptArgumentsDepth === 0) {
          state.javaScriptArguments = false
          return
        }

        var tok = jsMode.token(stream, state.jsState)
        return tok || true
      }
    }

    function yieldStatement(stream) {
      if (/^yield\b/.test(stream)) {
        return 'keyword'
      }
    }

    function doctype(stream) {
      if (/^(?:doctype) *([^\n]+)?/.test(stream)) {
        return DOCTYPE
      }
    }

    function interpolation(stream, state) {
      if (stream.match('#{')) {
        state.isInterpolating = true
        state.interpolationNesting = 0
        return 'punctuation'
      }
    }

    function interpolationContinued(stream, state) {
      if (state.isInterpolating) {
        if (stream.peek() === '}') {
          state.interpolationNesting--
          if (state.interpolationNesting < 0) {
            stream.next()
            state.isInterpolating = false
            return 'punctuation'
          }
        } else if (stream.peek() === '{') {
          state.interpolationNesting++
        }
        return jsMode.token(stream, state.jsState) || true
      }
    }

    function caseStatement(stream, state) {
      if (/^case\b/.test(stream)) {
        state.javaScriptLine = true
        return KEYWORD
      }
    }

    function when(stream, state) {
      if (/^when\b/.test(stream)) {
        state.javaScriptLine = true
        state.javaScriptLineExcludesColon = true
        return KEYWORD
      }
    }

    function defaultStatement(stream) {
      if (/^default\b/.test(stream)) {
        return KEYWORD
      }
    }

    function extendsStatement(stream, state) {
      if (/^extends?\b/.test(stream)) {
        state.restOfLine = 'string'
        return KEYWORD
      }
    }

    function append(stream, state) {
      if (/^append\b/.test(stream)) {
        state.restOfLine = 'variable'
        return KEYWORD
      }
    }
    function prepend(stream, state) {
      if (/^prepend\b/.test(stream)) {
        state.restOfLine = 'variable'
        return KEYWORD
      }
    }
    function block(stream, state) {
      if (/^block\b *(?:(prepend|append)\b)?/.test(stream)) {
        state.restOfLine = 'variable'
        return KEYWORD
      }
    }

    function include(stream, state) {
      if (/^include\b/.test(stream)) {
        state.restOfLine = 'string'
        return KEYWORD
      }
    }

    function includeFiltered(stream, state) {
      if (stream.match(/^include:([a-zA-Z0-9\-]+)/, false) && stream.match('include')) {
        state.isIncludeFiltered = true
        return KEYWORD
      }
    }

    function includeFilteredContinued(stream, state) {
      if (state.isIncludeFiltered) {
        var tok = filter(stream, state)
        state.isIncludeFiltered = false
        state.restOfLine = 'string'
        return tok
      }
    }

    function mixin(stream, state) {
      if (/^mixin\b/.test(stream)) {
        state.javaScriptLine = true
        return KEYWORD
      }
    }

    function call(stream, state) {
      if (/^\+([-\w]+)/.test(stream)) {
        if (!stream.match(/^\( *[-\w]+ *=/, false)) {
          state.javaScriptArguments = true
          state.javaScriptArgumentsDepth = 0
        }
        return 'variable'
      }
      if (stream.match('+#{', false)) {
        stream.next()
        state.mixinCallAfter = true
        return interpolation(stream, state)
      }
    }
    function callArguments(stream, state) {
      if (state.mixinCallAfter) {
        state.mixinCallAfter = false
        if (!stream.match(/^\( *[-\w]+ *=/, false)) {
          state.javaScriptArguments = true
          state.javaScriptArgumentsDepth = 0
        }
        return true
      }
    }

    function conditional(stream, state) {
      if (/^(if|unless|else if|else)\b/.test(stream)) {
        state.javaScriptLine = true
        return KEYWORD
      }
    }

    function each(stream, state) {
      if (/^(- *)?(each|for)\b/.test(stream)) {
        state.isEach = true
        return KEYWORD
      }
    }
    function eachContinued(stream, state) {
      if (state.isEach) {
        if (/^ in\b/.test(stream)) {
          state.javaScriptLine = true
          state.isEach = false
          return KEYWORD
        } else if (stream.sol() || stream.eol()) {
          state.isEach = false
        } else if (stream.next()) {
          while (!stream.match(/^ in\b/, false) && stream.next());
          return 'variable'
        }
      }
    }

    function whileStatement(stream, state) {
      if (/^while\b/.test(stream)) {
        state.javaScriptLine = true
        return KEYWORD
      }
    }

    function tag(stream, state) {
      var captures
      if (captures = stream.match(/^(\w(?:[-:\w]*\w)?)\/?/)) {
        state.lastTag = captures[1].toLowerCase()
        if (state.lastTag === 'script') {
          state.scriptType = 'application/javascript'
        }
        return 'tag'
      }
    }

    function filter(stream, state) {
      if (/^:([\w\-]+)/.test(stream)) {
        var innerMode
        if (config && config.innerModes) {
          innerMode = config.innerModes(stream.current().slice(1))
        }
        if (!innerMode) {
          innerMode = stream.current().slice(1)
        }
        if (typeof innerMode === 'string') {
          innerMode = CodeMirror.getMode(config, innerMode)
        }
        setInnerMode(stream, state, innerMode)
        return 'atom'
      }
    }

    function code(stream, state) {
      if (/^(!?=|-)/.test(stream)) {
        state.javaScriptLine = true
        return 'punctuation'
      }
    }

    function id(stream) {
      if (/^#([\w-]+)/.test(stream)) {
        return ID
      }
    }

    function className(stream) {
      if (/^\.([\w-]+)/.test(stream)) {
        return CLASS
      }
    }

    function attrs(stream, state) {
      if (stream.peek() == '(') {
        stream.next()
        state.isAttrs = true
        state.attrsNest = []
        state.inAttributeName = true
        state.attrValue = ''
        state.attributeIsType = false
        return 'punctuation'
      }
    }

    function attrsContinued(stream, state) {
      if (state.isAttrs) {
        if (ATTRS_NEST[stream.peek()]) {
          state.attrsNest.push(ATTRS_NEST[stream.peek()])
        }
        if (state.attrsNest.at(-1) === stream.peek()) {
          state.attrsNest.pop()
        } else  if (stream.eat(')')) {
          state.isAttrs = false
          return 'punctuation'
        }
        if (state.inAttributeName && /^[^=,\)!]+/.test(stream)) {
          if (stream.peek() === '=' || stream.peek() === '!') {
            state.inAttributeName = false
            state.jsState = CodeMirror.startState(jsMode)
            state.attributeIsType = state.lastTag === 'script' && stream.current().trim().toLowerCase() === 'type' ? true : false
          }
          return 'attribute'
        }

        var tok = jsMode.token(stream, state.jsState)
        if (state.attributeIsType && tok === 'string') {
          state.scriptType = stream.current().toString()
        }
        if (state.attrsNest.length === 0 && (tok === 'string' || tok === 'variable' || tok === 'keyword')) {
          try {
            new Function('', `var x ${  state.attrValue.replace(/,\s*$/, '').replace(/^!/, '')}`)
            state.inAttributeName = true
            state.attrValue = ''
            stream.backUp(stream.current().length)
            return attrsContinued(stream, state)
          } catch (error) {
          //not the end of an attribute
          }
        }
        state.attrValue += stream.current()
        return tok || true
      }
    }

    function attributesBlock(stream, state) {
      if (/^&attributes\b/.test(stream)) {
        state.javaScriptArguments = true
        state.javaScriptArgumentsDepth = 0
        return 'keyword'
      }
    }

    function indent(stream) {
      if (stream.sol() && stream.eatSpace()) {
        return 'indent'
      }
    }

    function comment(stream, state) {
      if (/^ *\/\/(-)?([^\n]*)/.test(stream)) {
        state.indentOf = stream.indentation()
        state.indentToken = 'comment'
        return 'comment'
      }
    }

    function colon(stream) {
      if (/^: */.test(stream)) {
        return 'colon'
      }
    }

    function text(stream, state) {
      if (/^(?:\| ?| )([^\n]+)/.test(stream)) {
        return 'string'
      }
      if (stream.match(/^(<[^\n]*)/, false)) {
      // html string
        setInnerMode(stream, state, 'htmlmixed')
        state.innerModeForLine = true
        return innerMode(stream, state, true)
      }
    }

    function dot(stream, state) {
      if (stream.eat('.')) {
        var innerMode = null
        if (state.lastTag === 'script' && state.scriptType.toLowerCase().indexOf('javascript') != -1) {
          innerMode = state.scriptType.toLowerCase().replaceAll(/"|'/g, '')
        } else if (state.lastTag === 'style') {
          innerMode = 'css'
        }
        setInnerMode(stream, state, innerMode)
        return 'dot'
      }
    }

    function fail(stream) {
      stream.next()
      return null
    }


    function setInnerMode(stream, state, mode) {
      mode = CodeMirror.mimeModes[mode] || mode
      mode = config.innerModes ? config.innerModes(mode) || mode : mode
      mode = CodeMirror.mimeModes[mode] || mode
      mode = CodeMirror.getMode(config, mode)
      state.indentOf = stream.indentation()

      if (mode && mode.name !== 'null') {
        state.innerMode = mode
      } else {
        state.indentToken = 'string'
      }
    }
    function innerMode(stream, state, force) {
      if (stream.indentation() > state.indentOf || (state.innerModeForLine && !stream.sol()) || force) {
        if (state.innerMode) {
          if (!state.innerState) {
            state.innerState = state.innerMode.startState ? CodeMirror.startState(state.innerMode, stream.indentation()) : {}
          }
          return stream.hideFirstChars(state.indentOf + 2, function () {
            return state.innerMode.token(stream, state.innerState) || true
          })
        } else {
          stream.skipToEnd()
          return state.indentToken
        }
      } else if (stream.sol()) {
        state.indentOf = Infinity
        state.indentToken = null
        state.innerMode = null
        state.innerState = null
      }
    }
    function restOfLine(stream, state) {
      if (stream.sol()) {
      // if restOfLine was set at end of line, ignore it
        state.restOfLine = ''
      }
      if (state.restOfLine) {
        stream.skipToEnd()
        var tok = state.restOfLine
        state.restOfLine = ''
        return tok
      }
    }


    function startState() {
      return new State()
    }
    function copyState(state) {
      return state.copy()
    }
    /**
   * Get the next token in the stream
   *
   * @param {Stream} stream
   * @param {State} state
   */
    function nextToken(stream, state) {
      var tok = innerMode(stream, state) ||
      restOfLine(stream, state) ||
      interpolationContinued(stream, state) ||
      includeFilteredContinued(stream, state) ||
      eachContinued(stream, state) ||
      attrsContinued(stream, state) ||
      javaScript(stream, state) ||
      javaScriptArguments(stream, state) ||
      callArguments(stream, state) ||

      yieldStatement(stream) ||
      doctype(stream) ||
      interpolation(stream, state) ||
      caseStatement(stream, state) ||
      when(stream, state) ||
      defaultStatement(stream) ||
      extendsStatement(stream, state) ||
      append(stream, state) ||
      prepend(stream, state) ||
      block(stream, state) ||
      include(stream, state) ||
      includeFiltered(stream, state) ||
      mixin(stream, state) ||
      call(stream, state) ||
      conditional(stream, state) ||
      each(stream, state) ||
      whileStatement(stream, state) ||
      tag(stream, state) ||
      filter(stream, state) ||
      code(stream, state) ||
      id(stream) ||
      className(stream) ||
      attrs(stream, state) ||
      attributesBlock(stream, state) ||
      indent(stream) ||
      text(stream, state) ||
      comment(stream, state) ||
      colon(stream) ||
      dot(stream, state) ||
      fail(stream)

      return tok === true ? null : tok
    }
    return {
      startState: startState,
      copyState: copyState,
      token: nextToken
    }
  }, 'javascript', 'css', 'htmlmixed')

  CodeMirror.defineMIME('text/x-pug', 'pug')
  CodeMirror.defineMIME('text/x-jade', 'pug')

})
