import { z } from "zod";
import { GenerationContext, generate } from "./generate.js";

export type ZockerOptions<Z extends z.ZodTypeAny> = {
	generators?: Map<z.ZodTypeAny, () => any>;
};

export type ZockerGeneratorOptions<Z extends z.ZodTypeAny> = {};
export type Zocker<Z extends z.ZodTypeAny> = (
	options?: ZockerGeneratorOptions<Z>
) => z.infer<Z>;

/**
 * Create a Zocker-Function from a Zod-Schema that generates random test-data.
 * @param schema A Zod-Schema
 * @returns A Zocker-Function that can be used to generate random data that matches the schema.
 */
export function zocker<Z extends z.ZodSchema>(
	schema: Z,
	schema_options: ZockerOptions<Z> = {}
): Zocker<Z> {
	return (generation_options = {}) => {
		const generation_context: GenerationContext<Z> = {
			generators: schema_options.generators || new Map(),
		}
		return generate(schema, generation_context);
	};
}
