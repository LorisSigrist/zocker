import { InstanceofGeneratorDefinition } from "../zocker.js";
import { generate, Generator } from "../generate.js";
import * as z from "zod/v4/core";

const generate_tuple: Generator<z.$ZodTuple> = (schema, generation_context) => {
	const tuple = schema._zod.def.items.map((item) =>
		generate(item, generation_context)
	);
	return tuple as z.infer<typeof schema>;
};

export const TupleGenerator: InstanceofGeneratorDefinition<z.$ZodTuple> = {
	schema: z.$ZodTuple as any,
	generator: generate_tuple,
	match: "instanceof"
};
