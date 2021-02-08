import * as vscode from 'vscode';
import configuration from '../config';
import { MarkSelections } from '../store/MarkSelections';
import type { isDefined, Range, RangeDelta } from '../types';
import { EnhancedRange } from '../helper/EnhancedRange';

export class MarkSelectionController {
  // prettier-ignore
  constructor(
    private windowUri: vscode.Uri,
    private markSelections = new MarkSelections()
  ) {
    this.registerStickMark();
  }

  updateDecoration() {
    vscode.window.activeTextEditor?.setDecorations(
      configuration.decorationType,
      this.markSelections.store
    );
  }

  scrollSelectionToCenter() {
    vscode.window.activeTextEditor?.revealRange(
      vscode.window.activeTextEditor.selection,
      vscode.TextEditorRevealType.InCenterIfOutsideViewport
    );
  }

  setMarks(selections: vscode.Selection[]) {
    this.markSelections.getStoreAndSet(selections);
    this.updateDecoration();
  }

  updateViewWithSelection(selections: vscode.Selection[]) {
    vscode.window.activeTextEditor!.selections = this.markSelections.getStoreAndSet(selections);
    this.scrollSelectionToCenter();
    this.updateDecoration();
  }

  registerStickMark() {
    vscode.workspace.onDidChangeTextDocument(event => {
      if (!vscode.window.activeTextEditor) return;
      if (event.document.uri !== this.windowUri) return;

      event.contentChanges.forEach(change => {
        this.markSelections.getStoreAndSet(
          this.markSelections.store
            .map(mark => calSelectionNewLocation(change, mark))
            .filter((Boolean as unknown) as isDefined)
        );
      });

      !this.markSelections.store.length && this.updateDecoration();
    });
  }
}

const calSelectionNewLocation = (
  change: vscode.TextDocumentContentChangeEvent,
  currentMark: vscode.Selection
) => {
  const changedRange = new EnhancedRange(change.range);
  const currentRange = new EnhancedRange(currentMark);

  switch (true) {
    case changedRange.contains(currentRange):
      return;

    case changedRange.isClearBefore(currentRange):
      return currentRange.translateLines(calTranslateLine(changedRange, change)).toSelection();

    case changedRange.isPartialBefore(currentRange):
      return currentRange
        .translateLines(calTranslateLine(changedRange.shrinkEnd(1), change))
        .toSelection();

    case changedRange.isPartialAfter(currentRange):
      return currentRange
        .shrinkEnd(deltaLines(changedRange.intersection(currentRange)!))
        .toSelection();

    case changedRange.isSingleLine &&
      currentRange.isSingleLine &&
      changedRange.isCharacterBefore(currentRange):
      return currentRange.translateCharacter(calTranslateCharacter(change)).toSelection();

    default:
      return currentMark;
  }
};

const calTranslateLine = (range: Range, content: vscode.TextDocumentContentChangeEvent) =>
  appendLines(content) - deltaLines(range);

const calTranslateCharacter = (content: vscode.TextDocumentContentChangeEvent) =>
  appendCharacters(content) - deltaCharacters(content);

const deltaLines: RangeDelta = range => range.end.line - range.start.line;

const appendCharacters = ({ text }: vscode.TextDocumentContentChangeEvent) => text.length;

const deltaCharacters = ({ rangeLength }: vscode.TextDocumentContentChangeEvent) => rangeLength;

const appendLines = ({ text }: vscode.TextDocumentContentChangeEvent) =>
  text.split(/\n/).length - 1;
