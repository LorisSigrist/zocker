import { GeneratorDefinitionFactory } from "../zocker.js";
import { Generator } from "../generate.js";
import { pick } from "../utils/random.js";
import { z } from "zod";

export const NativeEnumGenerator: GeneratorDefinitionFactory<
	z.ZodNativeEnum<any>
> = (options = {}) => {
	return {
		schema: options.schema ?? (z.ZodNativeEnum as any),
		generator: generate_native_enum,
		match: options.match ?? "instanceof"
	};
};

const generate_native_enum: Generator<z.ZodNativeEnum<any>> = (schema, ctx) => {
	const values = Object.values(schema._def.values);
	const value = pick(values);
	return value;
};
