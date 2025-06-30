import type { InstanceofGeneratorDefinition } from "../../zocker.js";
import type { Generator } from "../../generate.js";
import * as z from "zod/v4/core";
import { getLengthConstraints } from "./length-constraints.js";
import { InvalidSchemaException } from "../../exceptions.js";
import { getContentConstraints } from "./content-constraints.js";
import { faker } from "@faker-js/faker";

// const CUID_REGEX = /^c[^\s-]{8,}$/i;
const CUID_MIN_LENGTH = 9;
const CUID_COMMON_LENGHT = 25; // Most CUIDs are around 25 characters long

// const CUID2_REGEX = /^[a-z][0-9a-z]+$/;
const CUID2_MIN_LENGTH = 2;
const CUID2_COMMON_LENGTH = 24;

/**
 * Generates a valid CUID. The CUID format is as follows:
 * 1. The char 'c'
 * 2. 8 or more characters [a-zA-Z0-9]. Technically more are allowed, just not - or whitespace.
 *
 * @param schema A CUID Schema
 * @param generation_context The relevant generation context
 * @returns A CUID that conforms to the given schema
 * @throws InvalidSchemaException if the Schema cannot be satisfied
 */
const generate_cuid: Generator<z.$ZodCUID> = (schema, generation_context) => {
	const length_constraints = getLengthConstraints(schema);
	const content_constraints = getContentConstraints(schema);

	// Validate that the length constraints can be satisfied for a CUID
	const exact_length_too_short =
		length_constraints.exact != null &&
		length_constraints.exact < CUID_MIN_LENGTH;
	const max_length_too_short = length_constraints.max < CUID_MIN_LENGTH;
	if (exact_length_too_short || max_length_too_short) {
		throw new InvalidSchemaException(
			"CUID cannot be less than 9 characters long"
		);
	}

	// validate that the content constraints can be verified
	if (
		content_constraints.starts_with != "" &&
		!content_constraints.starts_with.startsWith("c")
	) {
		// Note: Zod also allows uppercase 'C' as the first character, but according to the CUID spec that isn't allowed
		throw new InvalidSchemaException("CUID must start with a 'c'");
	}

	const length =
		length_constraints.exact ??
		faker.number.int({
			min: Math.max(length_constraints.min, CUID_MIN_LENGTH),
			max:
				length_constraints.max == Infinity
					? length_constraints.min + CUID_COMMON_LENGHT
					: length_constraints.max
		});

	return generateCUIDofLength(length);
};

/**
 * Generates a valid CUID2. The CUID2 format is as follows:
 * - One alpha character
 * - 1 or more alphanumeric characters
 *
 * @param schema A CUID2 Schema
 * @param generation_context The relevant generation context
 * @returns A CUID2 that conforms to the given schema
 * @throws InvalidSchemaException if the Schema cannot be satisfied
 */
const generate_cuid2: Generator<z.$ZodCUID2> = (schema, generation_context) => {
	const length_constraints = getLengthConstraints(schema);
	const content_constraints = getContentConstraints(schema);

	// Validate that the length constraints can be satisfied for a CUID
	const exact_length_too_short =
		length_constraints.exact != null &&
		length_constraints.exact < CUID2_MIN_LENGTH;
	const max_length_too_short = length_constraints.max < CUID2_MIN_LENGTH;
	if (exact_length_too_short || max_length_too_short) {
		throw new InvalidSchemaException(
			"CUID2 cannot be less than 2 characters long"
		);
	}

	const length =
		length_constraints.exact ??
		faker.number.int({
			min: Math.max(length_constraints.min, CUID2_MIN_LENGTH),
			max:
				length_constraints.max == Infinity
					? length_constraints.min + CUID2_COMMON_LENGTH
					: length_constraints.max
		});

	return generateCUID2ofLength(length);
};

export const CUIDGenerator: InstanceofGeneratorDefinition<z.$ZodCUID> = {
	schema: z.$ZodCUID as any,
	generator: generate_cuid,
	match: "instanceof"
};

export const CUID2Generator: InstanceofGeneratorDefinition<z.$ZodCUID2> = {
	schema: z.$ZodCUID2 as any,
	generator: generate_cuid2,
	match: "instanceof"
};

/**
 * Generates a CUID of the given length
 * @param len The length of the CUID. Must be at least 9
 * @returns A CUID of the given length
 * @throws If the length is too short
 */
function generateCUIDofLength(len: number) {
	if (len < CUID_MIN_LENGTH)
		throw new TypeError("CUID must be at least 9 characters long");

	let cuid = "c" + faker.string.alphanumeric({ length: len - 1 });
	return cuid;
}

/**
 * Generates a CUID2 of the given length
 * @param len The length of the CUID2. Must be at least 2
 * @returns A CUID of the given length
 * @throws If the length is too short
 */
function generateCUID2ofLength(len: number) {
	if (len < CUID2_MIN_LENGTH)
		throw new TypeError("CUID2 must be at least 2 characters long");
	let cuid2 =
		faker.string.alpha({ casing: "lower" }) +
		faker.string.alphanumeric({ length: len - 1, casing: "lower" });
	return cuid2;
}
