import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import { getLengthConstraints } from "./length-constraints.js";
import { getContentConstraints } from "./content-constraints.js";

// const ULID_REGEX =  /^[0-9A-HJKMNP-TV-Z]{26}$/;
const ULID_LENGTH = 26; // All valid ULIDs are 26 characters long
const ULID_CHARS = [..."0123456789ABCDEFGHJKMNPQRSTVWXYZ"]; // The characters allowed in an ULID

const ulid_generator: Generator<z.$ZodULID> = (schema, ctx) => {
	const length_constraints = getLengthConstraints(schema);
	const content_constraints = getContentConstraints(schema);

	const min_length_too_long = length_constraints.min > ULID_LENGTH;
	const max_length_too_short = length_constraints.max < ULID_LENGTH;
	const exact_length_wrong =
		length_constraints.exact != null && length_constraints.exact != ULID_LENGTH;
	const starts_with_too_long =
		content_constraints.starts_with.length > ULID_LENGTH;
	const ends_with_too_long = content_constraints.ends_with.length > ULID_LENGTH;
	const includes_too_long = content_constraints.includes.some(
		(i) => i.length > ULID_LENGTH
	);

	if (
		min_length_too_long ||
		max_length_too_short ||
		exact_length_wrong ||
		starts_with_too_long ||
		ends_with_too_long ||
		includes_too_long
	) {
		throw new Error(
			"Invalid length constraints for ULID. All valid ULIDs are 26 characters long"
		);
	}

	let ulid =
		content_constraints.starts_with + content_constraints.includes.join("");
	const generated_length =
		ULID_LENGTH - ulid.length - content_constraints.ends_with.length;

	for (let i = 0; i < generated_length; i++) {
		ulid += faker.helpers.arrayElement(ULID_CHARS);
	}

	ulid += content_constraints.ends_with;

	// TODO: Support overlapping include, starts_with and ends_with constraints

	return ulid;
};

export const ULIDGenerator: InstanceofGeneratorDefinition<z.$ZodULID> = {
	match: "instanceof",
	schema: z.$ZodULID as any,
	generator: ulid_generator
};
