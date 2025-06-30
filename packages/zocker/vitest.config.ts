import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Run setup files before each test suite
		setupFiles: ["./tests/setup.ts"]
	}
});
