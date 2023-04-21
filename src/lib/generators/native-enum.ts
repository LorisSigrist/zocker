import { Generator } from "../generate.js";
import { pick } from "../utils/random.js";
import { z } from "zod";

export const generate_native_enum: Generator<z.ZodNativeEnum<any>> = (
	schema,
	generation_context
) => {
	const values = Object.values(schema._def.values);
	const value = pick(values);
	return value;
};
