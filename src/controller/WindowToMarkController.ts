import type * as vscode from 'vscode';
import { MarkSelectionController } from './MarkSelectionController';

export class WindowToMarkController {
  private markControllerMap: Map<vscode.Uri, MarkSelectionController> = new Map();
  getMarkController = (windowUri: vscode.Uri) =>
    this.markControllerMap.get(windowUri) ||
    this.markControllerMap
      .set(windowUri, new MarkSelectionController(windowUri))
      .get(windowUri)!;
}
