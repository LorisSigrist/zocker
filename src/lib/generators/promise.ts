import { Generator, generate } from "../generate.js";
import { z } from "zod";

export const generate_promise: Generator<z.ZodPromise<any>> = (
	schema,
	generation_context
) => {
	return generate(schema._def.type, generation_context);
};
