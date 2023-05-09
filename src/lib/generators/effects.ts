import { InstanceofGeneratorDefinition } from "../zocker.js";
import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { NoGeneratorException } from "../exceptions.js";

const generate_effects: Generator<z.ZodEffects<any>> = (
	effects_schema,
	generation_options
) => {
	if (effects_schema._def.effect.type !== "transform") {
		throw new NoGeneratorException(
			"To use refinements or preprocessors, you must supply a custom generator for your schema when calling `zocker`"
		);
	}

	//Generate an argument, then pass it to the transform function.
	//This should result in a valid output.
	const argument: any = generate(
		effects_schema._def.schema,
		generation_options
	);
	const transform_function = effects_schema._def.effect.transform;

	return transform_function(argument, {
		addIssue: () => {},
		path: []
	});
};

export const EffectsGenerator: InstanceofGeneratorDefinition<
	z.ZodEffects<any>
> = {
	schema: z.ZodEffects as any,
	generator: generate_effects,
	match: "instanceof"
};
