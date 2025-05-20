import { get_semantic_flag } from "../semantics.js";
import { GenerationContext, generate } from "../generate.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";
import * as z from "zod/v4/core";

export type ObjectOptions = {
	/** If extra keys should be generated on schemas that allow it. Defaults to true */
	generate_extra_keys: boolean;
};

const generate_object = <T extends z.$ZodShape>(
	object_schema: z.$ZodObject<T>,
	ctx: GenerationContext<z.$ZodObject<T>>
): z.infer<z.$ZodObject<T>> => {
	type Shape = z.infer<typeof object_schema>;
	type Value = Shape[keyof Shape];
	type Key = string | number | symbol;

	const mock_entries = [] as [Key, Value][];

	Object.entries(object_schema._zod.def.shape).forEach((entry) => {
		const key = entry[0] as Key;
		const property_schema = entry[1] as Value;

		const prev_semantic_context = ctx.semantic_context;
		const semantic_flag = get_semantic_flag(String(key));

		try {
			ctx.path.push(key);
			ctx.semantic_context = semantic_flag;

			//@ts-ignore
			const generated_value: Value = generate(property_schema, ctx);
			mock_entries.push([key, generated_value]);
		} finally {
			ctx.path.pop();
			ctx.semantic_context = prev_semantic_context;
		}
	});

	return Object.fromEntries(mock_entries) as Shape;
};

export const ObjectGenerator: InstanceofGeneratorDefinition<z.$ZodObject<any>> =
	{
		schema: z.$ZodObject as any,
		generator: generate_object,
		match: "instanceof"
	};
