import * as z from "zod/v4/core";
import * as zod from "zod";
import { generate, Generator } from "../generate.js";
import { pick } from "../utils/random.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";

export type AnyOptions = {
	strategy: "true-any" | "json-compatible" | "fast";
};

const literalSchema = zod.union([zod.string(), zod.number(), zod.boolean(), zod.null()]);
const jsonSchema: z.$ZodType = zod.lazy(() =>
	zod.union([literalSchema, zod.array(jsonSchema), zod.record(zod.string(), jsonSchema)])
);

//It's important to have the schemas outside the generator, so that they have reference equality accross invocations.
//This allows us to not worry about infinite recursion, as the cyclic generation logic will protect us.
const any = zod.any();
const potential_schemas = [
	zod.undefined(),
	zod.null(),
	zod.boolean(),
	zod.number(),
	zod.string(),
	zod.bigint(),
	zod.date(),
	zod.symbol(),
	zod.unknown(),
	zod.nan(),
	zod.record(any, any), //`z.object` is just a subset of this - no need for a separate case.
	zod.array(any), //Tuples are just a subset of this - no need for a separate case.
	zod.map(any, any),
	zod.set(any),
	zod.promise(any)
].map((schema) => schema.optional());

const generate_any: Generator<z.$ZodAny> = (schema, ctx) => {
	if (ctx.any_options.strategy === "fast") {
		return undefined;
	}

	if (ctx.any_options.strategy === "json-compatible") {
		const generated = generate(jsonSchema, ctx);
		return generated;
	}

	const schema_to_use = pick(potential_schemas);
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
