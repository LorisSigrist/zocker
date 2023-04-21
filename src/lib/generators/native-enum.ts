import { GenerationContext } from "../generate.js";
import { pick } from "../utils/random.js";
import { z } from "zod";

export function generate_native_enum<Z extends z.ZodNativeEnum<any>>(
	schema: Z,
	generation_context: GenerationContext<Z>
): z.infer<Z> {
	const values = Object.values(schema._def.values);
	const value = pick(values);
	return value;
}
