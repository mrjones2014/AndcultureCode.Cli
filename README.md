# AndcultureCode.Cli

[![Build Status](https://travis-ci.org/AndcultureCode/AndcultureCode.Cli.svg?branch=master)](https://travis-ci.org/AndcultureCode/AndcultureCode.Cli)
[![codecov](https://codecov.io/gh/AndcultureCode/AndcultureCode.Cli/branch/master/graph/badge.svg)](https://codecov.io/gh/AndcultureCode/AndcultureCode.Cli)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

`and-cli` command-line tool to manage the development of software applications.

## Getting started

From the root of the cloned or forked repository, run this command:

```
npm install && ./and-cli.js install
```

What this does:

1. Installs a global version of the npm package
2. Creates an alias `and-cli` for the installed version of the npm package in your project, which defaults to globally installed package if not installed for project
3. Creates an alias `and-cli-dev` for the running the cli while developing for it, via the directory in which you cloned or forked the repository

To install `and-cli` only for the current project, run this in its root directory:

```
# npm
npm install --save-dev and-cli

# yarn
yarn add and-cli --dev
```

To install the CLI globally, do:

```
# npm
npm install and-cli -g

# yarn
yarn global add and-cli
```

The documentation for `and-cli` commands can be found in [COMMANDS.md](./COMMANDS.md).

## Project structure

```
.
├── __mocks__/                              # Mocked module implementations for Jest
│   ...
│   └── shelljs.js
├── modules/                                # Modules are shared functions holding business logic to be imported & called by commands
│   ...
│   ├── command-registry.js                 # Module holding abstractions around command registration (internal & external)
│   ├── command-registry.test.js            # Unit test file for the command-registry module
│   ├── commands.js                         # Module exporting names & descriptions of each command to be registered for the CLI
|   ...
│   └── zip.js
├── tests/                                  # Setup, utilities and shared specs for the test suite
|   ...
│   └── test-utils.js
├── types/                                  # Custom types found in the project. Not currently on TS, but this will ease the migration
|   ...
│   └── option-string-type.js
├── utilities/                              # Utility functions that aren't really categorized as a standard 'module'
|   ...
|   ├── option-string-factory.js            # Factory for building out option strings to be passed to `program.option`, ie `-i, --info`
|   └── option-string-factory.test.js       # Unit tests file for the option-string-factory utility
├── and-cli.js                              # Main entrypoint/parent command that registers subcommands
├── and-cli-copy.js                         # Implementation of the 'copy' command
├── and-cli-copy.test.js                    # Integration test file for the 'copy' command
| ...
├── and-cli.test.js                         # Integration test file for the main entrypoint/parent command
├── COMMANDS.md                             # Markdown file containing extra documentation for each command
├── command-runner.js                       # Utility module for wrapping command body functions in to mimic top-level async
├── package.json
└── package-lock.json

```

## Testing strategy

For testing, we use [`Jest`](https://github.com/facebook/jest). We integration test top-level commands (such as `and-cli-dotnet`) and unit test shared modules/utilities (such as `modules/dotnet-build` or `utilities/option-string-factory`).

While we do not have any coverage thresholds currently configured, we ask that new modules/utilities introduced to the codebase are unit tested for high-value paths. Integration tests should be considered, but written more sparingly due to the overhead of run-time.

## Extending functionality

The functionality of this CLI can be extended by adding it as a dependency in your node project and requiring the main module, ie `require("and-cli")`. All commands should be registered through the `command-registry` module, which provides multiple functions for adding, overriding, and removing commands.

A small example of a project that imports this package and pulls in all of the base commands:

```JS
#!/usr/bin/env node

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const commandRegistry = require("and-cli/modules/command-registry");
const program = require("and-cli");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

// Register all of the base commands from the and-cli with this application
commandRegistry.registerBaseCommands();

program.parse(process.argv);

// #endregion Entrypoint
```

For more examples, or to see what the full project structure might look like, see this example repository:

[`AndcultureCode.Cli.PluginExample`](https://github.com/AndcultureCode/AndcultureCode.Cli.PluginExample)

## Aliasing commands

Existing commands & options can be aliased so they are easier to type or remember. Aliases can be registered in your `package.json` file, or registered in your extended CLI through the `command-registry` module.

### Registering aliases in your package.json file

To add aliases without any additional code, add an `and-cli` section with an `aliases` object underneath. Each key of the `aliases` section will be the alias you want to use (which cannot contain spaces), and the value will be the command and any options that should be run in place of it.

_Note: when defining aliases, the command/option string to be mapped should not contain the CLI name itself. See example below._

```JSON
{
    "and-cli": {
        "aliases": {
            "d": "dotnet",
            "dcRb": "dotnet -cRb",
        }
    }
}
```

If you are extending the `and-cli` with your own commands, you will also need to call `commandRegistry.registerAliasesFromConfig()` to read the aliases from `package.json`.

_Note: Ensure you are calling `commandRegistry.parseWithAliases()`, or the preprocessing to handle the aliases will not run._

```JS
#!/usr/bin/env node

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const commandRegistry = require("and-cli/modules/command-registry");
const program = require("and-cli");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

// Register the base 'dotnet' command and register aliases from the package.json file
commandRegistry
    .registerBaseCommand("dotnet")
    .registerAliasesFromConfig();

// Ensure you call parseWithAliases() in place of program.parse() to preprocess the arguments.
commandRegistry.parseWithAliases();

// #endregion Entrypoint
```

### Registering aliases through the command registry

Aliases can be registered just like commands would be with the `commandRegistry.registerAlias()` function.

_Note: Ensure you are calling `commandRegistry.parseWithAliases()`, or the preprocessing to handle the aliases will not run._

```JS
#!/usr/bin/env node

// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const commandRegistry = require("and-cli/modules/command-registry");
const program = require("and-cli");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Entrypoint
// -----------------------------------------------------------------------------------------

// Register the base 'dotnet' command and alias some of its options
commandRegistry
    .registerBaseCommand("dotnet")
    .registerAlias({
        command: "d",
        description: "dotnet",
    })
    .registerAlias({
        command: "dcRb",
        description: "dotnet -cRb",
    });

// Ensure you call parseWithAliases() in place of program.parse() to preprocess the arguments.
commandRegistry.parseWithAliases();

// #endregion Entrypoint
```

Regardless of how they are registered, aliases will be specially noted in the help menu of the CLI.

```SH
Usage: and-cli [options] [command]

andculture cli

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  copy            Copy files and/or directories
  d               (alias) dotnet
  dcRb            (alias) dotnet -cRb
  deploy          Deploy various application types
  dotnet          Run various dotnet commands for the project
  dotnet-test     Run various dotnet test runner commands for the project
  github          Commands for interacting with AndcultureCode github resources
  install         Collection of commands related to installation and configuration of the and-cli
  migration       Run commands to manage Entity Framework migrations
  nuget           Manages publishing of nuget dotnet core projects
  webpack         Run various webpack commands for the project
  webpack-test    Run various webpack test commands for the project
  help [command]  display help for command
```

## Troubleshooting

### Leading slash auto-converted to absolute path

Due to POSIX auto path conversion if you have an argument that needs to start with a leading slash "/". Escape it with an additional slash "//".

Upon application startup the CLI will replace it with the single slash "/".

### Value for command arguments are out of order

Depending upon the shell/terminal you are using, the node process sometimes requires the `--` delimiter between the command and the arguments. Otherwise, especially in a shell like windows command prompt, the value for arguments gets piped out of order.

Example:

-   Before: `and-cli dotnet --cli "test db migrate"`
    -   Works in most shells, but requires the arguments to be in quotes. Fails in windows command prompt
-   After: `and-cli dotnet -- --cli test db migrate`
    -   Portable and doesn't require quotes

### Command listed in documentation is not found or functioning as expected

If you are using the project alias, check to make sure the version in your `package.json` is up to date. You can ensure the latest is installed by running:

```
npm install --save-dev and-cli@latest
```

If you don't have the package installed in your project and you're using a global package, you can check the current version with:

```
npm list -g --depth=0 | grep and-cli
```

The latest version can be installed by running:

```
npm install --global and-cli@latest
```
