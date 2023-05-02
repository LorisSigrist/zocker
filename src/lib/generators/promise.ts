import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { GeneratorDefinitionFactory } from "../zocker.js";

export const PromiseGenerator: GeneratorDefinitionFactory<z.ZodPromise<any>> = (
	options = {}
) => {
	return {
		schema: options.schema ?? (z.ZodPromise as any),
		generator: generate_promise,
		match: options.match ?? "instanceof"
	};
};

const generate_promise: Generator<z.ZodPromise<any>> = (
	schema,
	generation_context
) => {
	return generate(schema._def.type, generation_context);
};
