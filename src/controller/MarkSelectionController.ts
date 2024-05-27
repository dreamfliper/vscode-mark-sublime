import * as vscode from 'vscode';
import configuration from '../config';
import { MarkSelections } from '../store/MarkSelections';
import type { Range } from '../types';
import { EnhancedRange } from '../helper/EnhancedRange';

export class MarkSelectionController {
  // prettier-ignore
  constructor(
    private windowUri: vscode.Uri,
    private markSelections = new MarkSelections()
  ) {
    this.#registerStickyMark();
  }

  updateDecoration() {
    vscode.window.activeTextEditor?.setDecorations(
      configuration.decorationType,
      this.markSelections.store.map((range, index) => ({
        range,
        hoverMessage: `mark: ${index + 1}`,
      }))
    );
  }
  scrollSelectionToCenter() {
    vscode.window.activeTextEditor?.revealRange(
      vscode.window.activeTextEditor.selection,
      vscode.TextEditorRevealType.InCenterIfOutsideViewport
    );
  }

  setMarks(selections: readonly vscode.Selection[]) {
    this.markSelections.setSelection(selections);
    this.updateDecoration();
  }

  selectToMark([firstSelection]: readonly vscode.Selection[]) {
    if (!this.markSelections.lastSelection) return;
    vscode.window.activeTextEditor!.selection = new EnhancedRange(
      new EnhancedRange(this.markSelections.lastSelection).union(new EnhancedRange(firstSelection))
    ).toSelection();
  }

  peekMark() {
    const { document } = vscode.window.activeTextEditor!;
    vscode.commands.executeCommand(
      'editor.action.peekLocations',
      document.uri,
      vscode.window.activeTextEditor?.selection.start,
      this.markSelections.store.map(selection => new vscode.Location(document.uri!, selection))
    );
  }

  updateViewWithSelection(selections: readonly vscode.Selection[]) {
    vscode.window.activeTextEditor!.selections = this.markSelections.setSelection(selections);
    this.scrollSelectionToCenter();
    this.updateDecoration();
  }

  #registerStickyMark() {
    vscode.workspace.onDidChangeTextDocument(event => {
      if (!vscode.window.activeTextEditor) return;
      if (event.document.uri !== this.windowUri) return;

      event.contentChanges.forEach(change => {
        this.markSelections.setSelection(
          this.markSelections.store
            .map(mark => calSelectionNewLocation(change, mark))
            .filter(Boolean)
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
  const changeRange = new EnhancedRange(change.range);
  const markRnage = new EnhancedRange(currentMark);

  switch (true) {
    case changeRange.contains(markRnage):
      return new vscode.Selection(
        changeRange.start,
        changeRange.start.translate(appendLines(change.text))
      );

    case markRnage.contains(changeRange):
      return markRnage.resize(calDeltaLines(change)).toSelection();

    case changeRange.isClearBefore(markRnage):
      return markRnage.translateLines(calDeltaLines(change)).toSelection();

    case changeRange.isPartialBefore(markRnage):
      return markRnage
        .resize(-rangeLines(changeRange.intersection(markRnage)!))
        .translateLines(calDeltaLines(change) + rangeLines(changeRange.intersection(markRnage)!))
        .toSelection();

    case changeRange.isPartialAfter(markRnage):
      return markRnage.resize(-rangeLines(changeRange.intersection(markRnage)!)).toSelection();

    case changeRange.isSingleLine &&
      markRnage.isSingleLine &&
      changeRange.isCharacterBefore(markRnage):
      return markRnage.translateCharacter(calTranslateCharacter(change)).toSelection();

    default:
      return currentMark;
  }
};

const calDeltaLines = (change: vscode.TextDocumentContentChangeEvent) =>
  appendLines(change.text) - removeLines(change.range);

const calTranslateCharacter = (change: vscode.TextDocumentContentChangeEvent) =>
  appendCharacters(change) - removeCharacters(change);

const appendCharacters = ({ text }: vscode.TextDocumentContentChangeEvent) => text.length;
const removeCharacters = ({ rangeLength }: vscode.TextDocumentContentChangeEvent) => rangeLength;

const removeLines = (range: Range) => range.end.line - range.start.line;
const rangeLines = removeLines;
const appendLines = (text: string) => text.match(new RegExp('\n', 'g'))?.length ?? 0;
