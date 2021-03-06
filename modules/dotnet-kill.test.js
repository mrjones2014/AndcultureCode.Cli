// -----------------------------------------------------------------------------------------
// #region Imports
// -----------------------------------------------------------------------------------------

const dotnetKill = require("./dotnet-kill");
const faker = require("faker");
const ps = require("./ps");
const testUtils = require("../tests/test-utils");

// #endregion Imports

// -----------------------------------------------------------------------------------------
// #region Mocks
// -----------------------------------------------------------------------------------------

// Mocking the echo module explicitly to suppress extra output from the module.
jest.mock("./echo");

// #endregion Mocks

// -----------------------------------------------------------------------------------------
// #region Tests
// -----------------------------------------------------------------------------------------

describe("dotnetKill", () => {
    // -----------------------------------------------------------------------------------------
    // #region run
    // -----------------------------------------------------------------------------------------

    describe("run", () => {
        let shellExitSpy;
        beforeEach(() => {
            shellExitSpy = testUtils.spyOnShellExit();
        });

        test(`when '${dotnetKill.cmd()}' fails, it calls shell.exit`, () => {
            // Arrange
            const exitCode = faker.random.number({ min: 1 });
            const spawnSyncSpy = testUtils.spyOnSpawnSync(exitCode);

            // Act
            dotnetKill.run();

            // Assert
            expect(spawnSyncSpy).toHaveBeenCalled();
            expect(shellExitSpy).toHaveBeenCalledWith(exitCode);
        });

        test("when no dotnet process ids are found, it returns 0", async () => {
            // Arrange
            const psListSpy = jest
                .spyOn(ps, "list")
                .mockImplementation(() => []);

            // Act
            const result = await dotnetKill.run();

            // Assert
            expect(psListSpy).toHaveBeenCalled();
            expect(result).toBe(0);
        });

        test("when dotnet process ids are found, it calls ps.kill", async () => {
            // Arrange
            const mockPid = faker.random.number({ min: 1, max: 100 });
            const mockProcesses = [{ pid: mockPid }, { pid: mockPid + 1 }];
            const psKillSpy = jest
                .spyOn(ps, "kill")
                .mockImplementation(() => 0);
            jest.spyOn(ps, "list").mockImplementation(() => mockProcesses);

            // Act
            await dotnetKill.run();

            // Assert
            expect(psKillSpy).toHaveBeenCalledWith(
                mockProcesses.map((e) => e.pid)
            );
        });
    });

    // #endregion run
});

// #endregion Tests
