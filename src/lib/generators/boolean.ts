import { faker } from "@faker-js/faker";
import { Generator } from "../generate.js";
import { z } from "zod";
import { GeneratorDefinitionFactory } from "../zocker.js";

export const BooleanGenerator: GeneratorDefinitionFactory<z.ZodBoolean> = (
	options = {}
) => {
	return {
		schema: options.schema ?? (z.ZodBoolean as any),
		generator: generate_boolean,
		match: options.match ?? "instanceof"
	};
};

const generate_boolean: Generator<z.ZodBoolean> = () => {
	return faker.datatype.boolean();
};
