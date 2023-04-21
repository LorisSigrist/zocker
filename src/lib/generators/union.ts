import { z } from "zod";
import { GenerationContext, generate } from "../generate.js";
import { pick } from "../utils/random.js";

export function generate_union<Z extends z.ZodUnion<any>>(
	schema: Z,
	generation_context: GenerationContext<Z>
): z.infer<Z> {
	const schemas = schema._def.options as z.ZodTypeAny[];

	//Pick a random schema from the union
	const random_schema = pick(schemas);

	return generate(random_schema, generation_context);
}
