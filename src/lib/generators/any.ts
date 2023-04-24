import { z } from "zod";
import { generate, Generator } from "../generate.js";
import { pick } from "../utils/random.js";

/**
 * Create a Generator for the `z.any()` and `z.unknown()` schemas.
 * @param strategy - How to generate the value. "true-any" will generate any possible value, "json-compatible" will generate any JSON-compatible value, and "fast" will just return undefined, but is vastly faster.
 * @returns 
 */
export function Any(strategy: "true-any" | "json-compatible" | "fast" = "true-any"): Generator<z.ZodAny | z.ZodUnknown> {

	if (strategy === "fast") {
		return () => undefined;
	}

	if (strategy === "json-compatible") {

		const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
		const jsonSchema : z.ZodSchema = z.lazy(() =>
			z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
		);


		return (_schema, generation_context) => {
			const generated = generate(jsonSchema, generation_context);
			return generated;
		}
	}

	const any = z.any();

	//It's important to have the schemas outside the generator, so that they have reference equality accross invocations.
	//This allows us to not worry about infinite recursion, as the cyclic generation logic will protect us.
	const potential_schemas = [
		z.undefined(),
		z.null(),
		z.boolean(),
		z.number(),
		z.string(),
		z.bigint(),
		z.date(),
		z.symbol(),
		z.unknown(),
		z.nan(),
		z.record(any), //`z.object` is just a subset of this - no need for a separate case.
		z.array(any), //Tuples are just a subset of this - no need for a separate case.
		z.map(any, any),
		z.set(any),
		z.promise(any)
	].map((schema) => schema.optional());

	const generate_any: Generator<z.ZodAny | z.ZodUnknown> = (
		_schema,
		generation_context
	) => {
		const schema_to_use = pick(potential_schemas);
		const generated = generate(schema_to_use, generation_context);
		return generated;
	};

	return generate_any;
}