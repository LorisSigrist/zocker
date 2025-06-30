import { beforeEach, afterEach, vi } from "vitest";

// Check if we're running in CI environment
const isCI =
	process.env.CI === "true" ||
	process.env.GITHUB_ACTIONS === "true" ||
	process.env.GITLAB_CI === "true" ||
	process.env.BUILDKITE === "true" ||
	process.env.CIRCLECI === "true" ||
	process.env.TRAVIS === "true" ||
	process.env.NODE_ENV === "ci";

// You can also override this with a specific environment variable
const strictConsoleMode = isCI || process.env.VITEST_STRICT_CONSOLE === "true";

if (strictConsoleMode) {
	let originalMethods: Record<string, any> = {};

	// Store original console methods
	beforeEach(() => {
		originalMethods = {
			log: console.log,
			warn: console.warn,
			info: console.info,
			debug: console.debug
		};

		// Replace console methods with error-throwing versions
		const createStrictConsoleMethod = (methodName: string) => {
			return vi.fn().mockImplementation((...args: any[]) => {
				// Create a nice error message showing what was logged
				const message = args
					.map((arg) => {
						try {
							return typeof arg === "string"
								? arg
								: JSON.stringify(arg, null, 2);
						} catch {
							return String(arg);
						}
					})
					.join(" ");

				// Get stack trace to show where the console method was called
				const stack = new Error().stack?.split("\n").slice(2).join("\n") || "";

				throw new Error(
					`console.${methodName}() usage detected in tests.\n\n` +
						`Logged message: ${message}\n\n` +
						`Called from:\n${stack}\n\n` +
						`Please remove console.${methodName} statements from your tests or use proper testing assertions instead.\n` +
						`Tip: Use expect().toBe() or other Vitest assertions for testing output.`
				);
			});
		};

		console.log = createStrictConsoleMethod("log");
		console.warn = createStrictConsoleMethod("warn");
		console.info = createStrictConsoleMethod("info");
		console.debug = createStrictConsoleMethod("debug");

		// Note: We typically don't restrict console.error as it's often used for legitimate error reporting
		// But you can uncomment the next line if you want to restrict it too:
		// console.error = createStrictConsoleMethod('error')
	});

	// Restore original methods after each test
	afterEach(() => {
		console.log = originalMethods.log;
		console.warn = originalMethods.warn;
		console.info = originalMethods.info;
		console.debug = originalMethods.debug;
	});
}
