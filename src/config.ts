import * as vscode from 'vscode';

class Configuration {
  private _decorationType!: vscode.TextEditorDecorationType;

  get decorationType() {
    return this._decorationType;
  }

  set iconPath(path: string) {
    this._decorationType = vscode.window.createTextEditorDecorationType({
      gutterIconPath: path + '/mark-gutter.svg',
      gutterIconSize: 'auto',
      rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen,
      overviewRulerLane: vscode.OverviewRulerLane.Left,
    });
  }
}

export default new Configuration();
