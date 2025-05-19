import { InstanceofGeneratorDefinition } from "../zocker.js";
import { Generator } from "../generate.js";
import { pick } from "../utils/random.js";
import * as z from "zod/v4/core";

const generate_enum: Generator<z.$ZodEnum<any>> = (schema, ctx) => {
	const values = Object.values(schema._zod.def.entries);
	const value = pick(values);
	return value;
};

export const EnumGenerator: InstanceofGeneratorDefinition<z.$ZodEnum<any>> = {
	schema: z.$ZodEnum as any,
	generator: generate_enum,
	match: "instanceof"
};
