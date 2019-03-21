
# Visual Studio Code Yarn Task Provider

[![Build Status][2]][3]

This extension adds better support for managing a package through [Yarn Package Manager][1], including running `yarn install` and running any scripts within the `scripts` section of your `package.json`.

To begin using this package just install it either through
``` shell
ext install dkneeland.yarn-task-provider
```

or by searching for **Yarn Task Provider** in the VSCode extension marketplace.

Now once you open a project with a `package.json` in the root directory you can use `Terminal -> Run Task...` and the extension will show you what tasks it has detected.

Thanks for using this! If you have any issues please create an Issue on GitHub and/or email me at dillon.kneeland@outlook.com.

[1]: https://yarnpkg.com/en/
[2]: https://dev.azure.com/dkneeland/yarn-task-provider/_apis/build/status/dillonKneeland.vscode-yarn-task-provider?branchName=master
[3]: https://dev.azure.com/dkneeland/yarn-task-provider/_build/latest?definitionId=1&branchName=master
