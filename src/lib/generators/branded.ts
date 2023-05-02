import { GeneratorDefinitionFactory } from "lib/zocker.js";
import { Generator, generate } from "../generate.js";
import { z } from "zod";

export const BrandedGenerator: GeneratorDefinitionFactory<
	z.ZodBranded<any, any>
> = (options = {}) => {
	return {
		schema: options.schema ?? (z.ZodBranded as any),
		generator: generate_branded,
		match: options.match ?? "instanceof"
	};
};

const generate_branded: Generator<z.ZodBranded<any, any>> = (
	schema,
	generation_context
) => {
	return generate(schema._def.type, generation_context);
};
