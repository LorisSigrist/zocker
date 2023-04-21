import { faker } from "@faker-js/faker";
import { GenerationContext } from "../generate.js";
import { z } from "zod";

export function generate_boolean<Z extends z.ZodBoolean>(
	schema: Z,
	generation_context: GenerationContext<Z>
): z.infer<Z> {
	return faker.datatype.boolean();
}
