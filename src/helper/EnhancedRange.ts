import * as vscode from 'vscode';
import { Range } from '../types';

export class EnhancedRange extends vscode.Range {
  constructor(arg: Pick<vscode.Range, 'start' | 'end'>) {
    super(arg.start, arg.end);
  }

  toSelection() {
    return new vscode.Selection(this.start, this.end);
  }

  isClearBefore(other: Range) {
    return this.end.line < other.start.line;
  }

  isInRange(other: Range) {
    return other.contains(this);
  }

  isBefore(other: Range) {
    return this.start.isBefore(other.start);
  }

  isAfter(other: Range) {
    return this.start.isAfter(other.start);
  }

  isCharacterBefore(other: Range) {
    return this.start.character < other.start.character;
  }

  hasIntersection(other: Range) {
    return this.intersection(other) !== undefined;
  }

  isPartialBefore(other: Range) {
    return this.hasIntersection(other) && this.isBefore(other);
  }

  isPartialAfter(other: Range) {
    return this.hasIntersection(other) && this.isAfter(other);
  }

  shrinkEnd(lines: number) {
    return new EnhancedRange(
      this.with({
        end: this.end.with(this.end.line - lines),
      })
    );
  }

  translateLines(lines: number) {
    return new EnhancedRange({
      start: this.start.translate(lines),
      end: this.end.translate(lines),
    });
  }

  translateCharacter(characterDelta: number) {
    return new EnhancedRange({
      start: this.start.translate({ characterDelta }),
      end: this.end.translate({ characterDelta }),
    });
  }
}
