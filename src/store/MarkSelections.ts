import * as vscode from "vscode";

export class MarkSelections {
  private collection: vscode.Selection[] = [];
  get store() {
    return this.collection;
  }
  getStoreAndSet(selections: vscode.Selection[]) {
    const oldSelection = this.collection;
    this.collection = selections;
    return oldSelection;
  }
}
