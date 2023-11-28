import * as vscode from 'vscode';

export class MarkSelections {
  private collection: readonly vscode.Selection[] = [];

  get store() {
    return this.collection;
  }

  get lastSelection() {
    return this.collection[this.collection.length - 1];
  }

  setSelection(selections: readonly vscode.Selection[]) {
    const oldSelection = this.collection;
    this.collection = selections;
    return oldSelection;
  }
}
