import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import { getLengthConstraints } from "./length-constraints.js";
import { getContentConstraints } from "./content-constraints.js";
import RandExp from "randexp";

const URL_MIN_LENGTH = 2; // Must have at least a protocol. Eg: "a:"

const url_generator: Generator<z.$ZodURL> = (schema, ctx) => {
	const hostnameRegex = schema._zod.def.hostname;
	const protocolRegex = schema._zod.def.protocol;

	const length_constraints = getLengthConstraints(schema);
	const content_constraints = getContentConstraints(schema);

	const generated_url = new URL(faker.internet.url());
	if (hostnameRegex !== undefined)
		generated_url.hostname = generateURLSafeStringForRegex(hostnameRegex);
	if (protocolRegex !== undefined)
		generated_url.protocol = generateURLSafeStringForRegex(protocolRegex);

	return generated_url.href;
};

export const URLGenerator: InstanceofGeneratorDefinition<z.$ZodURL> = {
	match: "instanceof",
	schema: z.$ZodURL as any,
	generator: url_generator
};

function generateURLSafeStringForRegex(regex: RegExp): string {
	const randexp = new RandExp(regex);

	// Disallow invalid characters
	randexp.defaultRange.subtract(0, 127);
	randexp.defaultRange.add(97, 122); // a-z
	randexp.defaultRange.add(48, 57); // 0-9
	randexp.defaultRange.add(45, 45); // -
	randexp.defaultRange.add(65, 90); // A-Z

	randexp.randInt = (min: number, max: number) =>
		faker.number.int({ min, max });
	return randexp.gen();
}
