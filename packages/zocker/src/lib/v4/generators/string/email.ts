import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import Randexp from "randexp";

const email_generator: Generator<z.$ZodEmail> = (schema, ctx) => {
	const pattern =
		getRegexCheck(schema) ?? schema._zod.def.pattern ?? z.regexes.email;

	// 1. Try using an email from faker
	const generated_email: string = faker.internet.email();
	if (generated_email.match(pattern)) {
		return generated_email;
	}

	// 2. As a fallback, use Randexp to generate a guaranteed valid string.
	const randexp = new Randexp(pattern);
	randexp.randInt = (min: number, max: number) =>
		faker.number.int({ min, max });
	return randexp.gen();
};

export const EmailGenerator: InstanceofGeneratorDefinition<z.$ZodEmail> = {
	match: "instanceof",
	schema: z.$ZodEmail as any,
	generator: email_generator
};

function getRegexCheck(schema: z.$ZodEmail): RegExp | null {
	const checks = schema._zod.def.checks ?? [];
	const regex_checks = checks.filter(
		(check) => check instanceof z.$ZodCheckRegex
	);
	return regex_checks.at(0)?._zod.def.pattern ?? null;
}
