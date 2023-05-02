import { get_semantic_flag } from "../semantics.js";
import { GenerationContext, generate } from "../generate.js";
import { GeneratorDefinitionFactory } from "../zocker.js";
import { z } from "zod";

export const ObjectGenerator: GeneratorDefinitionFactory<z.ZodObject<any>> = (
	options = {}
) => {
	return {
		schema: options.schema ?? (z.ZodObject as any),
		generator: generate_object,
		match: options.match ?? "instanceof"
	};
};

const generate_object = <T extends z.ZodRawShape>(
	object_schema: z.ZodObject<T>,
	generation_context: GenerationContext<z.ZodObject<T>>
): z.infer<z.ZodObject<T>> => {
	type Shape = z.infer<typeof object_schema>;
	type Key = keyof Shape;
	type Value = Shape[keyof Shape];

	const mock_entries = [] as [Key, Value][];

	Object.entries(object_schema.shape).forEach((entry) => {
		const key = entry[0] as Key;
		const property_schema = entry[1] as Value;

		const prev_semantic_context = generation_context.semantic_context;
		const semantic_flag = get_semantic_flag(String(key));

		try {
			generation_context.path.push(key);
			generation_context.semantic_context = semantic_flag;

			//@ts-ignore
			const generated_value = generate(property_schema, generation_context);
			mock_entries.push([key, generated_value]);
		} finally {
			generation_context.path.pop();
			generation_context.semantic_context = prev_semantic_context;
		}
	});

	return Object.fromEntries(mock_entries) as Shape;
};
