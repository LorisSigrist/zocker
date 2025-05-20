import * as z from "zod/v4/core";
import * as z4 from "zod/v4";
import { generate, Generator } from "../generate.js";
import { pick } from "../utils/random.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";

export type AnyOptions = {
	strategy: "true-any" | "json-compatible" | "fast";
};

const literalSchema = z4.union([
	z4.string(),
	z4.number(),
	z4.boolean(),
	z4.null()
]);
const jsonSchema: z.$ZodType = z4.lazy(() =>
	z4.union([
		literalSchema,
		z4.array(jsonSchema),
		z4.record(z4.string(), jsonSchema)
	])
);

//It's important to have the schemas outside the generator, so that they have reference equality accross invocations.
//This allows us to not worry about infinite recursion, as the cyclic generation logic will protect us.
const any = z4.any();
const potential_schemas = [
	z4.undefined(),
	z4.null(),
	z4.boolean(),
	z4.number(),
	z4.string(),
	z4.bigint(),
	z4.date(),
	z4.symbol(),
	z4.unknown(),
	z4.nan(),
	z4.record(z4.union([z4.string(), z4.number(), z4.symbol()]), any), //`z.object` is just a subset of this - no need for a separate case.
	z4.array(any), //Tuples are just a subset of this - no need for a separate case.
	z4.map(any, any),
	z4.set(any),
	z4.promise(any)
].map((schema) => schema.optional());

const generate_any: Generator<z.$ZodAny> = (schema, ctx) => {
	if (ctx.any_options.strategy === "fast") {
		return undefined;
	}

	if (ctx.any_options.strategy === "json-compatible") {
		const generated = generate(jsonSchema, ctx);
		return generated;
	}

	const schema_to_use: z.$ZodType = pick(potential_schemas);
	const generated = generate(schema_to_use, ctx);
	return generated;
};

const generate_unknown: Generator<z.$ZodUnknown> = (schema, ctx) => {
	if (ctx.unknown_options.strategy === "fast") {
		return undefined;
	}

	if (ctx.unknown_options.strategy === "json-compatible") {
		const generated = generate(jsonSchema, ctx);
		return generated;
	}

	const schema_to_use = pick(potential_schemas);
	const generated = generate(schema_to_use, ctx);
	return generated;
};

export const AnyGenerator: InstanceofGeneratorDefinition<z.$ZodAny> = {
	schema: z.$ZodAny as any,
	generator: generate_any,
	match: "instanceof"
};

export const UnknownGenerator: InstanceofGeneratorDefinition<z.$ZodUnknown> = {
	schema: z.$ZodUnknown as any,
	generator: generate_unknown,
	match: "instanceof"
};
