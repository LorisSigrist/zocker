import { Generator, generate } from "../generate.js";
import { z } from "zod";

export const generate_lazy: Generator<z.ZodLazy<any>> = (
	schema,
	generation_context
) => {
	const getter = schema._def.getter();
	return generate(getter, generation_context);
};
