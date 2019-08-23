"use babel";

const Convert = require('ansi-to-html');

class ConsoleView {
  constructor(serializeState) {
    this.console = null;
    this.log = null;
    this.convert = new Convert();
  }

  initUI() {
    if (this.console) return;

    this.console = document.createElement("div");
    this.console.setAttribute("tabindex", -1);
    this.console.classList.add("xi", "console", "native-key-bindings");

    this.log = document.createElement("div");
    this.console.appendChild(this.log);

    atom.workspace.addBottomPanel({
      item: this.console
    });

    // sets the console max height
    this.console.setAttribute(
      "style",
      `max-height: ${atom.config.get("xi.consoleMaxHeight")}px;`
    );

    // listen for consoleMaxHeight changes
    atom.config.onDidChange("xi.consoleMaxHeight", data => {
      this.console.setAttribute("style", `max-height: ${data.newValue}px;`);
    });
  }

  serialize() {}

  destroy() {
    this.console.remove();
  }

  logStdout(text) {
    this.logText(text);
  }

  logStderr(text) {
    this.logText(text, true);
  }

  logText(text, error) {
    if (!text) return;
    var pre = document.createElement("pre");
    if (error) {
      pre.className = "error";
    }

    if (atom.config.get("xi.onlyLogLastMessage")) {
      this.log.innerHTML = "";
    }
    pre.innerHTML = this.convert.toHtml(text);
    this.log.appendChild(pre);

    if (!error && atom.config.get("xi.onlyShowLogWhenErrors")) {
      this.console.classList.add("hidden");
    } else {
      this.console.classList.remove("hidden");
    }

    this.console.scrollTop = this.console.scrollHeight;
  }
}

export default ConsoleView;
