import { Generator } from "../generate.js";
import { pick } from "../utils/random.js";
import { z } from "zod";

export const generate_enum: Generator<z.ZodEnum<any>> = (
	schema,
	generation_context
) => {
	const values = schema._def.values;
	const value = pick(values);
	return value;
};
