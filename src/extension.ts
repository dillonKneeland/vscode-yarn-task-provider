import * as vscode from 'vscode';
import { YarnTaskProvider } from './yarnTaskProvider';

let taskProvider: (vscode.Disposable | undefined);


export function activate(_context: vscode.ExtensionContext): void {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
    return;
  }
  taskProvider = vscode.tasks.registerTaskProvider(YarnTaskProvider.YarnType, new YarnTaskProvider());
}

export function deactivate(): void {
  if (taskProvider) taskProvider.dispose();
}
