/*
    Utility functions for taking random actions.
    All functions are based on faker.js, and are therefore reproducible if the seed is set.
*/

import { faker } from "@faker-js/faker";

export function pick<T>(array: readonly T[]): T {
	//Generate a random index
	const index = faker.datatype.number({
		min: 0,
		max: array.length - 1,
		precision: 1
	});

	if (array.hasOwnProperty(index)) return array[index]!;
	else throw new Error(`Index ${index} does not exist in array ${array}`);
}

/**
 * Randomly pick between two option, with a given probability of picking the first option.
 * @param probability - The probability of choosing option_1 (between 0 and 1)
 */
export function weighted_pick<A,B>(option_1 : A, option_2: B, probability: number ) : A | B {
	if(probability <= 0) return option_2;
	if(probability >= 1) return option_1;
    const random = faker.datatype.number({min: 0, max: 1, precision: 0.01});
    if(random < probability) return option_1;
    else return option_2;
}

export function weighted_random_boolean(true_probability: number) : boolean {
    return weighted_pick(true, false, true_probability);
}