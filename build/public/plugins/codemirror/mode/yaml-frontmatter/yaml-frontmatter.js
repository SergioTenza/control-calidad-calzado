"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
(function (mod) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../yaml/yaml"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../yaml/yaml"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  var START = 0,
      FRONTMATTER = 1,
      BODY = 2; // a mixed mode for Markdown text with an optional YAML front matter

  CodeMirror.defineMode("yaml-frontmatter", function (config, parserConfig) {
    var yamlMode = CodeMirror.getMode(config, "yaml");
    var innerMode = CodeMirror.getMode(config, parserConfig && parserConfig.base || "gfm");

    function curMode(state) {
      return state.state == BODY ? innerMode : yamlMode;
    }

    return {
      startState: function startState() {
        return {
          state: START,
          inner: CodeMirror.startState(yamlMode)
        };
      },
      copyState: function copyState(state) {
        return {
          state: state.state,
          inner: CodeMirror.copyState(curMode(state), state.inner)
        };
      },
      token: function token(stream, state) {
        if (state.state == START) {
          if (stream.match(/---/, false)) {
            state.state = FRONTMATTER;
            return yamlMode.token(stream, state.inner);
          } else {
            state.state = BODY;
            state.inner = CodeMirror.startState(innerMode);
            return innerMode.token(stream, state.inner);
          }
        } else if (state.state == FRONTMATTER) {
          var end = stream.sol() && stream.match(/(---|\.\.\.)/, false);
          var style = yamlMode.token(stream, state.inner);

          if (end) {
            state.state = BODY;
            state.inner = CodeMirror.startState(innerMode);
          }

          return style;
        } else {
          return innerMode.token(stream, state.inner);
        }
      },
      innerMode: function innerMode(state) {
        return {
          mode: curMode(state),
          state: state.inner
        };
      },
      blankLine: function blankLine(state) {
        var mode = curMode(state);
        if (mode.blankLine) return mode.blankLine(state.inner);
      }
    };
  });
});