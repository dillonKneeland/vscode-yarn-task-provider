import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class YarnTaskProvider implements vscode.TaskProvider {
    static YarnType = 'yarn';
    private yarnPromise: Thenable<vscode.Task[]> | undefined = undefined;
    private fileWatchers: vscode.FileSystemWatcher[] = [];

    constructor() {
        this.scanWorkspaces();
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this.yarnPromise = undefined;
            this.scanWorkspaces();
        });
    }

    private scanWorkspaces() {
        for (var fileWatcher of this.fileWatchers)
            fileWatcher.dispose();
        this.fileWatchers = [];

        for (const workspaceRoot of vscode.workspace.workspaceFolders) {
            if (!workspaceRoot || !workspaceRoot.uri?.fsPath) continue;

            const pattern = path.join(workspaceRoot.uri.fsPath, 'package.json');
            const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
            fileWatcher.onDidChange(() => this.yarnPromise = undefined);
            fileWatcher.onDidCreate(() => this.yarnPromise = undefined);
            fileWatcher.onDidDelete(() => this.yarnPromise = undefined);
            this.fileWatchers.push(fileWatcher);
        }
    }

    public provideTasks(): Thenable<vscode.Task[]> | undefined {
        if (!this.yarnPromise) {
            this.yarnPromise = this.getYarnTasks();
        }
        return this.yarnPromise;
    }

    public resolveTask(_task: vscode.Task): vscode.Task | undefined {
        const {
            task,
            args = []
        } = _task.definition;
        return new vscode.Task(_task.definition, _task.scope, _task.name, YarnTaskProvider.YarnType,
            new vscode.ShellExecution(`yarn run ${task} ${args.join(' ')}`));
    }

    private async getYarnTasks(): Promise<vscode.Task[]> {
        const result: vscode.Task[] = [];

        for (const workspaceRoot of vscode.workspace.workspaceFolders) {
            if (!workspaceRoot || !workspaceRoot.uri?.fsPath) {
                continue;
            }
            const packageFile = path.join(workspaceRoot.uri.fsPath, 'package.json');
            if (!fs.existsSync(packageFile))
                continue;

            const packageData = JSON.parse(fs.readFileSync(packageFile).toString());

            let kind: YarnTaskDefinition = {
                type: 'yarn',
                task: 'install'
            };
            let task = new vscode.Task(kind, workspaceRoot, kind.task, YarnTaskProvider.YarnType, new vscode.ShellExecution('yarn install'));
            result.push(task);
            if (packageData?.scripts)
                for (const key of Object.keys(packageData.scripts)) {
                    kind = {
                        type: 'yarn',
                        task: key
                    };
                    task = new vscode.Task(kind, workspaceRoot, kind.task, YarnTaskProvider.YarnType, new vscode.ShellExecution(`yarn run ${kind.task}`));
                    result.push(task);
                }
        }
        return result;
    }
}

interface YarnTaskDefinition extends vscode.TaskDefinition {
    task: string;
}