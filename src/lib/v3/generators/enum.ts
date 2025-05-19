import { InstanceofGeneratorDefinition } from "../zocker.js";
import { Generator } from "../generate.js";
import { pick } from "../utils/random.js";
import { z } from "zod";

const generate_enum: Generator<z.ZodEnum<any>> = (schema, ctx) => {
	const values = schema._def.values;
	const value = pick(values);
	return value;
};

export const EnumGenerator: InstanceofGeneratorDefinition<z.ZodEnum<any>> = {
	schema: z.ZodEnum as any,
	generator: generate_enum,
	match: "instanceof"
};
