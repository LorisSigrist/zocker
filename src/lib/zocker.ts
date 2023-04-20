import { faker } from "@faker-js/faker";
import { z } from "zod";
import { generate_number } from "./numbers.js";
import { generate_string } from "./string.js";

export type ZockerOptions<Z extends z.ZodTypeAny> = {};
export type ZockerGeneratorOptions<Z extends z.ZodTypeAny> = {};
export type Zocker<Z extends z.ZodTypeAny> = (
	options?: ZockerGeneratorOptions<Z>
) => z.infer<Z>;

/**
 * Create a Zocker-Function from a Zod-Schema that generates random test-data.
 * @param schema A Zod-Schema
 * @returns A Zocker-Function that can be used to generate random data that matches the schema.
 */
export function zocker<Z extends z.ZodTypeAny>(
	schema: Z,
	schema_options: ZockerOptions<Z> = {}
): Zocker<Z> {
	return function generate(generation_options = {}) {
		if (schema instanceof z.ZodNumber)
			return generate_number(schema, generation_options);

		if (schema instanceof z.ZodString) {
			const str = generate_string(schema, generation_options);
			return str;
		}

		if (schema instanceof z.ZodBoolean) {
			return faker.datatype.boolean();
		}

		if (schema instanceof z.ZodDate) {
			return faker.datatype.datetime();
		}

		if (schema instanceof z.ZodBigInt) {
			return faker.datatype.bigInt();
		}

		if (schema instanceof z.ZodUndefined) {
			return undefined;
		}

		if (schema instanceof z.ZodNull) {
			return null;
		}

		if (schema instanceof z.ZodVoid) {
			return;
		}

		if (schema instanceof z.ZodEffects) {
			throw new Error("We currently don't support ZodEffects.");
		}

		if (schema instanceof z.ZodObject) {
			const generate_object = <T extends z.ZodRawShape>(
				object_schema: z.ZodObject<T>
			) => {
				type Shape = z.infer<typeof object_schema>;

				const mock_entries = [] as [keyof Shape, any][];

				Object.entries(object_schema.shape).forEach((entry) => {
					type Key = keyof Shape;
					type Value = Shape[keyof Shape];

					const key = entry[0] as Key;
					const property_schema = entry[1] as Value;

					const generated_value = zocker(
						property_schema,
						schema_options
					)(generation_options);

					mock_entries.push([key, generated_value]);
				});

				return Object.fromEntries(mock_entries) as Shape;
			};
			return generate_object(schema);
		}

		if (schema instanceof z.ZodArray) {
			const generate_array = <T extends z.ZodTypeAny>(
				array_schema: z.ZodArray<T>
			) => {
				const exact_length = array_schema._def.exactLength?.value ?? null;

				const min = array_schema._def.minLength
					? array_schema._def.minLength.value
					: 0;
				const max = array_schema._def.maxLength
					? array_schema._def.maxLength.value
					: min + 10;

				const length =
					exact_length !== null
						? exact_length
						: faker.datatype.number({ min, max });

				const generated_array = [] as z.infer<T>[];

				for (let i = 0; i < length; i++) {
					const generated_value = zocker(
						array_schema.element,
						schema_options
					)(generation_options);

					generated_array.push(generated_value);
				}

				return generated_array;
			};
			return generate_array(schema);
		}

		throw new Error("Not implemented");
	};
}
