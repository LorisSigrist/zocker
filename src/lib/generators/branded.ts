import { InstanceofGeneratorDefinition } from "lib/zocker.js";
import { Generator, generate } from "../generate.js";
import { z } from "zod";

const generate_branded: Generator<z.ZodBranded<any, any>> = (
	schema,
	generation_context
) => {
	return generate(schema._def.type, generation_context);
};

export const BrandedGenerator: InstanceofGeneratorDefinition<
	z.ZodBranded<any, any>
> = {
	schema: z.ZodBranded as any,
	generator: generate_branded,
	match: "instanceof"
};
