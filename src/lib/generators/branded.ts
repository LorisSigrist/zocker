import { Generator, generate } from "../generate.js";
import { z } from "zod";

export const generate_branded: Generator<z.ZodBranded<any, any>> = (
	schema,
	generation_context
) => {
	return generate(schema._def.type, generation_context);
};
