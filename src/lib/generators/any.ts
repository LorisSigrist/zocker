import { z } from "zod";
import { generate, Generator } from "../generate.js";
import { pick } from "../utils/random.js";

const any = z.any();

//It's important to have the schemas out here, so that they have reference equality accross generations.
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

export const generate_any: Generator<z.ZodAny | z.ZodUnknown> = (
	_schema,
	generation_context
) => {
	const schema_to_use = pick(potential_schemas);
	const generated = generate(schema_to_use, generation_context);
	return generated;
};
