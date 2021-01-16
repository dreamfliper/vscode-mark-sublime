import * as vscode from 'vscode';
import { WindowToMarkController as TabToMarkController } from './controller/WindowToMarkController';
import type { TextEditor } from './types';
import configuration from './config';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
	configuration.iconPath = context.asAbsolutePath('images');
	vscode.commands.registerCommand('mark.swapWithMark', guardWithNullTab(swapWithMark));
	vscode.commands.registerCommand('mark.setMark', guardWithNullTab(setMark));
	vscode.commands.registerCommand('mark.clearMark', guardWithNullTab(clearMark));
	vscode.commands.registerCommand('mark.forceUpdate', guardWithNullTab(forceUpdate));
}

const guardWithNullTab = (fn: any) => () => {
	const { activeTextEditor } = vscode.window;
	if (!activeTextEditor) return;
	fn(activeTextEditor);
};

const tabToMarkController = new TabToMarkController();

const swapWithMark = ({ document, selections }: TextEditor) =>
	tabToMarkController.getMarkController(document.uri).updateViewWithSelection(selections);

const setMark = ({ document, selections }: TextEditor) =>
	tabToMarkController.getMarkController(document.uri).setMarks(selections);

const clearMark = ({ document }: TextEditor) =>
	tabToMarkController.getMarkController(document.uri).setMarks([]);

const forceUpdate = ({ document }: TextEditor) =>
	tabToMarkController.getMarkController(document.uri).updateDecoration();
