/*
    Utility functions for taking random actions.
    All functions are based on faker.js, and are therefore reproducible if the seed is set.
*/

import { faker } from "@faker-js/faker";

/**
 * @deprecated Use `faker.helpers.arrayElement` directly
 */
export function pick<T>(array: readonly T[]): T {
	return faker.helpers.arrayElement(array);
}

/**
 * Randomly pick between two option, with a given probability of picking the first option.
 * @param probability - The probability of choosing option_1 (between 0 and 1)
 */
export function weighted_pick<A, B>(
	option_1: A,
	option_2: B,
	probability: number
): A | B {
	const first = faker.datatype.boolean({ probability });
	return first ? option_1 : option_2;
}

/**
 * @deprecated Use `faker.datatype.boolean({ probability })` directly
 */
export function weighted_random_boolean(true_probability: number): boolean {
	return faker.datatype.boolean({ probability: true_probability });
}
