import { get_semantic_flag } from "../semantics.js";
import { GenerationContext, generate } from "../generate.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";
import { z } from "zod";
import { faker } from "@faker-js/faker";

export type ObjectOptions = {
	/** If extra keys should be generated on schemas that allow it. Defaults to true */
	generate_extra_keys: boolean;
};

const generate_object = <T extends z.ZodRawShape>(
	object_schema: z.ZodObject<T>,
	ctx: GenerationContext<z.ZodObject<T>>
): z.infer<z.ZodObject<T>> => {
	type Shape = z.infer<typeof object_schema>;
	type Value = Shape[keyof Shape];
	type Key = string | number | symbol;

	const mock_entries = [] as [Key, Value][];

	Object.entries(object_schema.shape).forEach((entry) => {
		const key = entry[0] as Key;
		const property_schema = entry[1] as Value;

		const prev_semantic_context = ctx.semantic_context;
		const semantic_flag = get_semantic_flag(String(key));

		try {
			ctx.path.push(key);
			ctx.semantic_context = semantic_flag;

			//@ts-ignore
			const generated_value = generate(property_schema, ctx);
			mock_entries.push([key, generated_value]);
		} finally {
			ctx.path.pop();
			ctx.semantic_context = prev_semantic_context;
		}
	});

	let catchall_schema: z.ZodSchema | null = object_schema._def.catchall;
	if (catchall_schema instanceof z.ZodNever) catchall_schema = null;
	const is_passthrough = object_schema._def.unknownKeys === "passthrough";
	if (is_passthrough && !catchall_schema) catchall_schema = z.any();

	if (catchall_schema && ctx.object_options.generate_extra_keys) {
		const key_schema = z.union([z.string(), z.number(), z.symbol()]);
		const num_additional_keys = faker.datatype.number({ min: 0, max: 10 });
		try {
			for (let i = 0; i < num_additional_keys; i++) {
				const prev_semantic_context = ctx.semantic_context;
				let key: Key;
				try {
					ctx.semantic_context = "key";
					key = generate(key_schema, ctx);
				} finally {
					ctx.semantic_context = prev_semantic_context;
				}

				const value = generate(catchall_schema, ctx);

				//Prepend to mock_entries,
				//so that the catchall keys would be overwritten by the original keys in case of a collision
				mock_entries.unshift([key, value]);
			}
		} catch (e) {}
	}

	return Object.fromEntries(mock_entries) as Shape;
};

export const ObjectGenerator: InstanceofGeneratorDefinition<z.ZodObject<any>> =
	{
		schema: z.ZodObject as any,
		generator: generate_object,
		match: "instanceof"
	};
