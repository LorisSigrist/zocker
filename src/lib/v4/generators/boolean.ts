import { faker } from "@faker-js/faker";
import { Generator } from "../generate.js";
import * as z from "zod/v4/core";
import { InstanceofGeneratorDefinition } from "../zocker.js";

const generate_boolean: Generator<z.$ZodBoolean> = () => {
	return faker.datatype.boolean();
};

export const BooleanGenerator: InstanceofGeneratorDefinition<z.$ZodBoolean> = {
	schema: z.$ZodBoolean as any,
	generator: generate_boolean,
	match: "instanceof"
};
