import { InstanceofGeneratorDefinition } from "../zocker.js";
import { generate, Generator } from "../generate.js";
import { z } from "zod";

const generate_tuple: Generator<z.ZodTuple> = (schema, generation_context) => {
	const tuple = schema._def.items.map(<Z extends z.ZodSchema>(item: Z) =>
		generate(item, generation_context)
	);
	return tuple as z.infer<typeof schema>;
};

export const TupleGenerator: InstanceofGeneratorDefinition<z.ZodTuple> = {
	schema: z.ZodTuple as any,
	generator: generate_tuple,
	match: "instanceof"
};
