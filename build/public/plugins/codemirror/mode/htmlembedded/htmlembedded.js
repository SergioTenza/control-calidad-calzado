"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
(function (mod) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../htmlmixed/htmlmixed"), require("../../addon/mode/multiplex"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../htmlmixed/htmlmixed", "../../addon/mode/multiplex"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  CodeMirror.defineMode("htmlembedded", function (config, parserConfig) {
    var closeComment = parserConfig.closeComment || "--%>";
    return CodeMirror.multiplexingMode(CodeMirror.getMode(config, "htmlmixed"), {
      open: parserConfig.openComment || "<%--",
      close: closeComment,
      delimStyle: "comment",
      mode: {
        token: function token(stream) {
          stream.skipTo(closeComment) || stream.skipToEnd();
          return "comment";
        }
      }
    }, {
      open: parserConfig.open || parserConfig.scriptStartRegex || "<%",
      close: parserConfig.close || parserConfig.scriptEndRegex || "%>",
      mode: CodeMirror.getMode(config, parserConfig.scriptingModeSpec)
    });
  }, "htmlmixed");
  CodeMirror.defineMIME("application/x-ejs", {
    name: "htmlembedded",
    scriptingModeSpec: "javascript"
  });
  CodeMirror.defineMIME("application/x-aspx", {
    name: "htmlembedded",
    scriptingModeSpec: "text/x-csharp"
  });
  CodeMirror.defineMIME("application/x-jsp", {
    name: "htmlembedded",
    scriptingModeSpec: "text/x-java"
  });
  CodeMirror.defineMIME("application/x-erb", {
    name: "htmlembedded",
    scriptingModeSpec: "ruby"
  });
});