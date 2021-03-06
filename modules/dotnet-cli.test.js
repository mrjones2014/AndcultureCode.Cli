// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const dotnetBuild = require("./dotnet-build");
const dotnetCli = require("./dotnet-cli");
const dotnetPath = require("./dotnet-path");
const faker = require("faker");
const shell = require("shelljs");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

// Mocking dir module to suppress lots of extra output from popd/pushd errors from lack of actual
// directory stack.
jest.mock("./dir");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("dotnetCli", () => {
    // -----------------------------------------------------------------------------------------
    // #region cmd
    // -----------------------------------------------------------------------------------------

    describe("cmd", () => {
        test("given a string array of arguments, it returns a properly formatted command string to the Cli path with space-separated arguments", () => {
            // Arrange
            const cliPath = testUtils.randomFile();
            const cliArgs = faker.random.words(3).split(" ");
            jest.spyOn(dotnetPath, "cliPath").mockImplementation(() => cliPath);
            const expectedString = `dotnet ${cliPath} ${cliArgs.join(" ")}`;

            // Act
            const result = dotnetCli.cmd(cliArgs).toString();

            // Assert
            expect(result).toBe(expectedString);
        });
    });

    // #endregion cmd

    // -----------------------------------------------------------------------------------------
    // #region run
    // -----------------------------------------------------------------------------------------

    describe("run", () => {
        let shellExitSpy;
        beforeEach(() => {
            shellExitSpy = testUtils.spyOnShellExit();
        });

        test("when dotnetPath.cliPath returns undefined, it calls dotnetBuild.run", () => {
            // Arrange
            const dotnetPathSpy = jest
                .spyOn(dotnetPath, "cliPath")
                .mockImplementation(() => undefined);
            const dotnetBuildSpy = jest
                .spyOn(dotnetBuild, "run")
                .mockImplementation();

            // Act
            dotnetCli.run();

            // Assert
            expect(dotnetPathSpy).toHaveBeenCalled();
            expect(dotnetBuildSpy).toHaveBeenCalled();
        });

        test("when child_process.spawnSync returns non-zero status, it calls shell.exit with the status", () => {
            // Arrange
            const exitCode = testUtils.randomNumber(1);
            const spawnSync = testUtils.spyOnSpawnSync(exitCode);

            // Act
            dotnetCli.run();

            // Assert
            expect(spawnSync).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });
    });

    // #endregion run
});

// #endregion Tests
