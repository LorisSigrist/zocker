import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import Randexp from "randexp";

const nanoid_generator: Generator<z.$ZodNanoID> = (schema, ctx) => {
	const pattern = z.regexes.nanoid;

	const randexp = new Randexp(pattern);
	randexp.randInt = (min: number, max: number) =>
		faker.number.int({ min, max });
	return randexp.gen();
};

export const NanoIDGenerator: InstanceofGeneratorDefinition<z.$ZodNanoID> = {
	match: "instanceof",
	schema: z.$ZodNanoID as any,
	generator: nanoid_generator
};
