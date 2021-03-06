"use babel";

var fs = require("fs");
var spawn = require("child_process").spawn;
var process = require("process");

var defaultBootFileName = "init.xi";
var defaultBootFilePath = __dirname + "/" + defaultBootFileName;

var CONST_LINE = "line";
var CONST_MULTI_LINE = "multi_line";

export default class REPL {
  repl = null;
  consoleView = null;
  stdErr = null;
  stdOut = null;
  stdTimer = 0;

  constructor(consoleView) {
    this.consoleView = consoleView;
    this.stdErr = [];
    this.stdOut = [];

    atom.commands.add("atom-workspace", {
      "xi:start": () => this.start(),
      "xi:stop": () => this.stop(),
      "xi:restart": () => this.restart(),
    });

    atom.commands.add("atom-text-editor", {
      "xi:eval": () => this.eval(CONST_LINE, false),
      "xi:eval-multi-line": () => this.eval(CONST_MULTI_LINE, false),
      "xi:eval-copy": () => this.eval(CONST_LINE, true),
      "xi:eval-multi-line-copy": () => this.eval(CONST_MULTI_LINE, true),
      "xi:hush": () => this.hush()
    });
  }

  editorIsXi() {
    var editor = this.getEditor();
    if (!editor) return false;
    return editor.getGrammar().scopeName === "source.xi";
  }

  hush() {
    this.sendExpression("hush");
  }

  doSpawn() {
    const parts = this.getXiPath().split(" ").map(s => s.trim());
    const cmd = parts[0];
    const args = parts.slice(1);

    this.repl = spawn(cmd, args, {
      shell: true,
      env: { TERM: 'xterm', ...process.env }
    });

    this.repl.stderr.on("data", data => {
      this.processStdErr(data);
    });

    this.repl.stdout.on("data", data => {
      this.processStdOut(data);
    });

    this.repl.on("error", (err) => {
      atom.notifications.addFatalError(`Failed to start Xi: ${err}`)
    })

    this.repl.on("close", (code) => {
      if (code) {
        atom.notifications.addFatalError(`Xi process exited with code ${code}`)
      }
      this.repl = null;
    });
  }

  processStdOut(data) {
    this.stdOut.push(data.toString("utf8"));
    this.processStd();
  }

  processStdErr(data) {
    this.stdErr.push(data.toString("utf8"));
    this.processStd();
  }

  processStd() {
    clearTimeout(this.stdTimer);
    // defers the handler of stdOut/stdErr data
    // by some arbitrary ammount of time (50ms)
    // to get the buffer filled completly
    this.stdTimer = setTimeout(() => this.flushStd(), 50);
  }

  flushStd() {
    if (this.stdErr.length) {
      let t = this.stdErr.join("");
      this.consoleView.logStderr(t);
      this.stdErr.length = 0;
    }

    if (this.stdOut.length) {
      let t = this.stdOut.join("");
      this.consoleView.logStdout(t);
      this.stdOut.length = 0;
    }
  }

  getXiPath() {
    return atom.config.get("xi.xiPath");
  }

  stdinWrite(command) {
    this.repl.stdin.write(command);
  }

  sendLine(command) {
    this.stdinWrite(`${command.trim()}\n`);
  }

  sendExpression(expression) {
    var splits = expression.trim().split("\n");
    for (var i = 0; i < splits.length; i++) {
      this.sendLine(splits[i]);
      console.log(`sendLine: ${JSON.stringify(splits[i])}`)
    }
  }

  start() {
    this.consoleView.initUI();
    this.doSpawn();
    atom.notifications.addInfo(`Xi was started.`);
  }

  getEditor() {
    var editor = atom.workspace.getActiveTextEditor();
    return editor;
  }

  eval(evalType, copy) {
    if (!this.editorIsXi()) return;

    if (!this.repl) this.start();

    var expressionAndRange = this.currentExpression(evalType);
    var expression = expressionAndRange[0];
    var range = expressionAndRange[1];
    this.evalWithRepl(expression, range, copy);
  }

  evalWithRepl(expression, range, copy) {
    var self = this;
    if (!expression) return;

    function doIt() {
      var unflash;
      if (range) {
        unflash = self.evalFlash(range);
        var copyRange;
        if (copy) {
          copyRange = self.copyRange(range);
        }
      }

      function onSuccess() {
        if (unflash) {
          unflash("eval-success");
        }
      }

      self.sendExpression(expression);
      onSuccess();
    }

    doIt();
  }

  stop() {
    if (this.repl) {
      this.repl.kill();
      this.repl = null;
      atom.notifications.addInfo(`Xi was stopped.`);
    }
    if (this.consoleView) this.consoleView.clear();
  }

  restart() {
    this.stop();
    this.start();
  }

  currentExpression(evalType) {
    var editor = this.getEditor();
    if (!editor) return;

    var selection = editor.getLastSelection();
    var expression = selection.getText();

    if (expression) {
      var range = selection.getBufferRange();
      return [expression, range];
    } else {
      if (evalType === CONST_LINE) {
        return this.getLineExpression(editor);
      }
      return this.getMultiLineExpression(editor);
    }
  }

  copyRange(range) {
    var editor = this.getEditor();
    var endRow = range.end.row;
    endRow++;
    var text = editor.getTextInBufferRange(range);
    text = "\n" + text + "\n";

    if (endRow > editor.getLastBufferRow()) {
      text = "\n" + text;
    }

    editor.getBuffer().insert([endRow, 0], text);
  }

  getLineExpression(editor) {
    var cursor = editor.getCursors()[0];
    var range = cursor.getCurrentLineBufferRange();
    var expression = range && editor.getTextInBufferRange(range);
    return [expression, range];
  }

  getMultiLineExpression(editor) {
    var range = this.getCurrentParagraphIncludingComments(editor);
    var expression = editor.getTextInBufferRange(range);
    return [expression, range];
  }

  getCurrentParagraphIncludingComments(editor) {
    var cursor = editor.getLastCursor();
    var startRow = (endRow = cursor.getBufferRow());
    var lineCount = editor.getLineCount();

    // lines must include non-whitespace characters
    // and not be outside editor bounds
    while (/\S/.test(editor.lineTextForBufferRow(startRow)) && startRow >= 0) {
      startRow--;
    }
    while (
      /\S/.test(editor.lineTextForBufferRow(endRow)) &&
      endRow < lineCount
    ) {
      endRow++;
    }
    return {
      start: {
        row: startRow + 1,
        column: 0
      },
      end: {
        row: endRow,
        column: 0
      }
    };
  }

  evalFlash(range) {
    var editor = this.getEditor();
    var marker = editor.markBufferRange(range, {
      invalidate: "touch"
    });

    var decoration = editor.decorateMarker(marker, {
      type: "line",
      class: "eval-flash"
    });

    // return fn to flash error / success and destroy the flash
    return function(cssClass) {
      decoration.setProperties({
        type: "line",
        class: cssClass
      });
      var destroy = function() {
        marker.destroy();
      };
      setTimeout(destroy, 120);
    };
  }
}
