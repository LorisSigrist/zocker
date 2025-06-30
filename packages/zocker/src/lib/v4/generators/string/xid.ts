import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import Randexp from "randexp";
import { getLengthConstraints } from "./length-constraints.js";

// const XID_REGEX = /^[0-9a-vA-V]{20}$/;
const XID_LENGTH = 20;

const xid_generator: Generator<z.$ZodXID> = (schema, ctx) => {
	const pattern = schema._zod.def.pattern ?? z.regexes.xid;

	const length_constraints = getLengthConstraints(schema);
	const min_length_too_long = length_constraints.min > XID_LENGTH;
	const max_length_too_short = length_constraints.max < XID_LENGTH;
	const exact_length_too_long =
		length_constraints.exact != null && length_constraints.exact > XID_LENGTH;
	const exact_length_too_short =
		length_constraints.exact != null && length_constraints.exact < XID_LENGTH;

	if (
		min_length_too_long ||
		max_length_too_short ||
		exact_length_too_long ||
		exact_length_too_short
	) {
		throw new Error(`XID must be exactly ${XID_LENGTH} characters long`);
	}

	const randexp = new Randexp(pattern);
	randexp.randInt = (min: number, max: number) =>
		faker.number.int({ min, max });
	return randexp.gen();
};

export const XIDGenerator: InstanceofGeneratorDefinition<z.$ZodXID> = {
	match: "instanceof",
	schema: z.$ZodXID as any,
	generator: xid_generator
};
