import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

let taskProvider: vscode.Disposable | undefined;

export function activate(_context: vscode.ExtensionContext): void {
  let workspaceRoot = vscode.workspace.rootPath;
  if (!workspaceRoot) {
    return;
  }

  let pattern = path.join(workspaceRoot, "package.json");
  let yarnPromise: Thenable<vscode.Task[]> | undefined = undefined;
  let fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
  fileWatcher.onDidChange(() => yarnPromise = undefined);
  fileWatcher.onDidCreate(() => yarnPromise = undefined);
  fileWatcher.onDidDelete(() => yarnPromise = undefined);
  taskProvider = vscode.tasks.registerTaskProvider('yarn', {
    provideTasks: () => {
      if (!yarnPromise) {
        yarnPromise = getYarnTasks();
      }
      return yarnPromise;
    },
    resolveTask(_task: vscode.Task): vscode.Task | undefined {
      const {
        task,
        args = []
      } = _task.definition;
      return new vscode.Task(_task.definition, _task.name, 'yarn',
          new vscode.ShellExecution(`yarn run ${task} ${args.join(' ')}`));
    }
  });
}

export function deactivate(): void {
  if (taskProvider) {
    taskProvider.dispose();
  }
}

function exists(filename: string): Promise<boolean> {
  return new Promise<boolean>((resolve, _reject) => {
    fs.exists(filename, (value) => {
      resolve(value);
    });
  });
}

let _channel: vscode.OutputChannel;
function getOutputChannel(): vscode.OutputChannel {
  if (!_channel) {
    _channel = vscode.window.createOutputChannel('Yarn Auto Detection');
  }
  return _channel;
}

interface YarnTaskDefinition extends vscode.TaskDefinition {
  task: string;
}

async function getYarnTasks(): Promise<vscode.Task[]> {
  let workspaceRoot = vscode.workspace.rootPath;
  let emptyTasks: vscode.Task[] = [];
  if (!workspaceRoot) {
    return emptyTasks;
  }
  let packageFile = path.join(workspaceRoot, 'package.json');
  if (!await exists(packageFile)) {
    return emptyTasks;
  }  
  let result: vscode.Task[] = [];
  let out = getOutputChannel();

  let taskName = "install";
  let kind: YarnTaskDefinition = {
    type: 'yarn',
    task: taskName
  };
  let task = new vscode.Task(kind, taskName, 'yarn', new vscode.ShellExecution('yarn install'));
  result.push(task);

  let packageData = JSON.parse(fs.readFileSync(packageFile).toString());

  for (let key of Object.keys(packageData.scripts)) {
    taskName = key;
    kind = {
      type: 'yarn',
      task: taskName
    };
    task = new vscode.Task(kind, taskName, 'yarn', new vscode.ShellExecution(`yarn run ${taskName}`));
    result.push(task);
  }
  return result;
}