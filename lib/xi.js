"use babel";

import ConsoleView from "./console-view";
import Repl from "./repl";

export default {
  consoleView: null,
  repl: null,
  config: {
    xiPath: {
      type: "string",
      default: "xi",
      description: "Path to the xi executable."
    },
    consoleMaxHeight: {
      type: "integer",
      default: 100,
      description: "Console maximum height in pixels."
    }
  },

  activate(state) {
    this.consoleView = new ConsoleView(state.consoleViewState);
    this.repl = new Repl(this.consoleView);
  },

  deactivate() {
    this.consoleView.destroy();
    this.repl.destroy();
  },

  serialize() {
    return {
      consoleViewState: this.consoleView.serialize()
    };
  }
};
