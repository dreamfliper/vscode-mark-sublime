import type * as vscode from 'vscode';

export type VscodeSelections = Array<vscode.Selection>;
export type TextEditor = vscode.TextEditor;
export type Range = vscode.Range;
export type FuncSameType<T> = (...arg: T[]) => T;
export type FuncTypeTo<T, R> = (...arg: T[]) => R;
export type RangeUtil = FuncSameType<Range>;
export type RangeDelta = FuncTypeTo<Range, number>;
