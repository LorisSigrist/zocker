import { InstanceofGeneratorDefinition } from "../zocker.js";
import { Generator } from "../generate.js";
import { pick } from "../utils/random.js";
import { z } from "zod";

const generate_native_enum: Generator<z.ZodNativeEnum<any>> = (schema, ctx) => {
	const values = Object.values(schema._def.values);
	const value = pick(values);
	return value;
};

export const NativeEnumGenerator: InstanceofGeneratorDefinition<
	z.ZodNativeEnum<any>
> = {
	schema: z.ZodNativeEnum as any,
	generator: generate_native_enum,
	match: "instanceof"
};
