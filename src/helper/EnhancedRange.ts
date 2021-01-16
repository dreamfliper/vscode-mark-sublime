import * as vscode from "vscode";
import { Range } from "../types";

export class EnhancedRange extends vscode.Range {
  constructor(arg: Pick<vscode.Range, "start" | "end">) {
    super(arg.start, arg.end);
  }

  toSelection() {
    return new vscode.Selection(this.start, this.end);
  }

  isClearBefore(other: Range) {
    return this.end.isBefore(other.start);
  }

  isInRange(other: Range) {
    return other.contains(this);
  }

  isBefore(other: Range) {
    return this.start.isBefore(other.start);
  }

  hasIntersection(other: Range) {
    return this.intersection(other) !== undefined;
  }

  isPartialBefore(other: Range) {
    return this.hasIntersection(other) && this.isBefore(other);
  }

  shrinkEnd(lines: number) {
    return this.with({
      end: this.end.with(this.end.line - lines),
    });
  }

  transLateLines(lines: number) {
    return new EnhancedRange({
      start: this.start.translate(lines),
      end: this.end.translate(lines),
    });
  }
}