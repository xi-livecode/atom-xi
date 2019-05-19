"use babel";

import ConsoleView from "./console-view";
import Repl from "./repl";

export default {
  consoleView: null,
  repl: null,
  config: {
    xiPath: {
      type: "string",
      default: "xi"
    },
    bootPath: {
      type: "string",
      default: ""
    },
    useBootFileInCurrentDirectory: {
      type: "boolean",
      default: false,
      description:
        "If a init.xi file is found at the root of your Atom project, it will be used to boot Xi."
    },
    onlyShowLogWhenErrors: {
      type: "boolean",
      default: false,
      description: "Only show console if last message was an error."
    },
    onlyLogLastMessage: {
      type: "boolean",
      default: false,
      description: "Only log last message to the console."
    },
    consoleMaxHeight: {
      type: "integer",
      default: 100,
      description: "The console maximum height in pixels."
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
