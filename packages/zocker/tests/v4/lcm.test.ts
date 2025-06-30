import { lcm } from "../../src/lib/v4/utils/lcm.js";
import { describe, it, expect } from "vitest";

describe("LCM", () => {
	it("works for integers", () => {
		const result = lcm(3, 5);
		expect(result).toBe(15);
	});

	it("works for non-integers where one is a multiple of the other", () => {
		const result = lcm(0.1, 0.2);
		expect(result).toBe(0.2);
	});

	it("works for non-integers where neither is a multiple of the other", () => {
		const result = lcm(0.3, 0.4);
		expect(result).toBe(1.2);
	});

	it("works for mixed integers and non-integers", () => {
		const result = lcm(2, 0.5);
		expect(result).toBe(2);
	});
});
