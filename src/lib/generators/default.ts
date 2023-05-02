import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { weighted_random_boolean } from "../utils/random.js";
import { GeneratorDefinitionFactory } from "lib/zocker.js";

type DefaultOptions = {
	default_chance: number;
};

const default_options: DefaultOptions = {
	default_chance: 0.3
};

export const DefaultGenerator: GeneratorDefinitionFactory<
	z.ZodDefault<any>,
	Partial<DefaultOptions>
> = (partial_options = {}) => {
	const options = { ...default_options, ...partial_options };

	return {
		schema: options.schema ?? (z.ZodDefault as any),
		generator: Default(options.default_chance),
		match: options.match ?? "instanceof"
	};
};

function Default(default_chance: number = 0.3): Generator<z.ZodDefault<any>> {
	return (schema, ctx) => {
		const should_use_default = weighted_random_boolean(default_chance);
		const default_value = schema._def.defaultValue;
		return should_use_default
			? default_value()
			: generate(schema._def.innerType, ctx);
	};
}
