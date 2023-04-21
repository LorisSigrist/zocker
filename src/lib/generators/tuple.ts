import { Generator, generate } from "../generate.js";
import { z } from "zod";

export const generate_tuple: Generator<z.ZodTuple<any>> = (
	schema,
	generation_context
) => {
	const tuple = schema._def.items.map(<Z extends z.ZodSchema>(item: Z) =>
		generate(item, generation_context)
	);
	return tuple as z.infer<typeof schema>;
};
