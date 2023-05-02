import { GeneratorDefinitionFactory } from "../zocker.js";
import { generate, Generator } from "../generate.js";
import { z } from "zod";

export const TupleGenerator: GeneratorDefinitionFactory<z.ZodTuple> = (
	options = {}
) => {
	return {
		schema: options.schema ?? (z.ZodTuple as any),
		generator: generate_tuple,
		match: options.match ?? "instanceof"
	};
};

const generate_tuple: Generator<z.ZodTuple> = (schema, generation_context) => {
	const tuple = schema._def.items.map(<Z extends z.ZodSchema>(item: Z) =>
		generate(item, generation_context)
	);
	return tuple as z.infer<typeof schema>;
};
