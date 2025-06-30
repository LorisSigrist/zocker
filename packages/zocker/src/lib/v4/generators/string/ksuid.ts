import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { getLengthConstraints } from "./length-constraints.js";
import { getContentConstraints } from "./content-constraints.js";
import RandExp from "randexp";

const KSUID_LENGTH = 27;

const ksuid_generator: Generator<z.$ZodKSUID> = (schema, ctx) => {
	const length_constraints = getLengthConstraints(schema);

	const min_length_too_long = length_constraints.min > KSUID_LENGTH;
	const max_length_too_short = length_constraints.max < KSUID_LENGTH;
	const exact_length_too_long =
		length_constraints.exact != null && length_constraints.exact > KSUID_LENGTH;
	const exact_length_too_short =
		length_constraints.exact != null && length_constraints.exact < KSUID_LENGTH;

	if (
		min_length_too_long ||
		max_length_too_short ||
		exact_length_too_long ||
		exact_length_too_short
	) {
		throw new Error(`KSUID must be exactly ${KSUID_LENGTH} characters long`);
	}

	const content_constraints = getContentConstraints(schema);

	const ksuid = new RandExp(z.regexes.ksuid);
	return ksuid.gen();
};

export const KSUIDGenerator: InstanceofGeneratorDefinition<z.$ZodKSUID> = {
	match: "instanceof",
	schema: z.$ZodKSUID as any,
	generator: ksuid_generator
};
