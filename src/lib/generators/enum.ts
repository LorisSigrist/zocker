import { GeneratorDefinitionFactory } from "../zocker.js";
import { Generator } from "../generate.js";
import { pick } from "../utils/random.js";
import { z } from "zod";

export const EnumGenerator: GeneratorDefinitionFactory<z.ZodEnum<any>> = (options = {}) => {
	return {
		schema: options.schema ?? z.ZodEnum as any,
		generator: generate_enum,
		match: options.match ?? "instanceof",
	};
};

const generate_enum: Generator<z.ZodEnum<any>> = (
	schema,
	generation_context
) => {
	const values = schema._def.values;
	const value = pick(values);
	return value;
};
