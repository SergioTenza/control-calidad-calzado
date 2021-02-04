"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
(function (mod) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  CodeMirror.defineMode('smalltalk', function (config) {
    var specialChars = /[+\-\/\\*~<>=@%|&?!.,:;^]/;
    var keywords = /true|false|nil|self|super|thisContext/;

    var Context = function Context(tokenizer, parent) {
      this.next = tokenizer;
      this.parent = parent;
    };

    var Token = function Token(name, context, eos) {
      this.name = name;
      this.context = context;
      this.eos = eos;
    };

    var State = function State() {
      this.context = new Context(next, null);
      this.expectVariable = true;
      this.indentation = 0;
      this.userIndentationDelta = 0;
    };

    State.prototype.userIndent = function (indentation) {
      this.userIndentationDelta = indentation > 0 ? indentation / config.indentUnit - this.indentation : 0;
    };

    var next = function next(stream, context, state) {
      var token = new Token(null, context, false);
      var aChar = stream.next();

      if (aChar === '"') {
        token = nextComment(stream, new Context(nextComment, context));
      } else if (aChar === '\'') {
        token = nextString(stream, new Context(nextString, context));
      } else if (aChar === '#') {
        if (stream.peek() === '\'') {
          stream.next();
          token = nextSymbol(stream, new Context(nextSymbol, context));
        } else {
          if (stream.eatWhile(/[^\s.{}\[\]()]/)) token.name = 'string-2';else token.name = 'meta';
        }
      } else if (aChar === '$') {
        if (stream.next() === '<') {
          stream.eatWhile(/[^\s>]/);
          stream.next();
        }

        token.name = 'string-2';
      } else if (aChar === '|' && state.expectVariable) {
        token.context = new Context(nextTemporaries, context);
      } else if (/[\[\]{}()]/.test(aChar)) {
        token.name = 'bracket';
        token.eos = /[\[{(]/.test(aChar);

        if (aChar === '[') {
          state.indentation++;
        } else if (aChar === ']') {
          state.indentation = Math.max(0, state.indentation - 1);
        }
      } else if (specialChars.test(aChar)) {
        stream.eatWhile(specialChars);
        token.name = 'operator';
        token.eos = aChar !== ';'; // ; cascaded message expression
      } else if (/\d/.test(aChar)) {
        stream.eatWhile(/[\w\d]/);
        token.name = 'number';
      } else if (/[\w_]/.test(aChar)) {
        stream.eatWhile(/[\w\d_]/);
        token.name = state.expectVariable ? keywords.test(stream.current()) ? 'keyword' : 'variable' : null;
      } else {
        token.eos = state.expectVariable;
      }

      return token;
    };

    var nextComment = function nextComment(stream, context) {
      stream.eatWhile(/[^"]/);
      return new Token('comment', stream.eat('"') ? context.parent : context, true);
    };

    var nextString = function nextString(stream, context) {
      stream.eatWhile(/[^']/);
      return new Token('string', stream.eat('\'') ? context.parent : context, false);
    };

    var nextSymbol = function nextSymbol(stream, context) {
      stream.eatWhile(/[^']/);
      return new Token('string-2', stream.eat('\'') ? context.parent : context, false);
    };

    var nextTemporaries = function nextTemporaries(stream, context) {
      var token = new Token(null, context, false);
      var aChar = stream.next();

      if (aChar === '|') {
        token.context = context.parent;
        token.eos = true;
      } else {
        stream.eatWhile(/[^|]/);
        token.name = 'variable';
      }

      return token;
    };

    return {
      startState: function startState() {
        return new State();
      },
      token: function token(stream, state) {
        state.userIndent(stream.indentation());

        if (stream.eatSpace()) {
          return null;
        }

        var token = state.context.next(stream, state.context, state);
        state.context = token.context;
        state.expectVariable = token.eos;
        return token.name;
      },
      blankLine: function blankLine(state) {
        state.userIndent(0);
      },
      indent: function indent(state, textAfter) {
        var i = state.context.next === next && textAfter && textAfter.charAt(0) === ']' ? -1 : state.userIndentationDelta;
        return (state.indentation + i) * config.indentUnit;
      },
      electricChars: ']'
    };
  });
  CodeMirror.defineMIME('text/x-stsrc', {
    name: 'smalltalk'
  });
});