import { z } from "zod";
import { faker } from "@faker-js/faker";
import { generate_string } from "./datatypes/string.js";
import { generate_number } from "./datatypes/numbers.js";
import { generate_date } from "./datatypes/dates.js";
import { generate_bigint } from "./datatypes/bigint.js";

/**
 * Contains all the necessary configuration to generate a value for a given schema.
 */
export type GenerationContext<Z extends z.ZodSchema> = {};

export function generate<Z extends z.ZodSchema>(schema: Z, generation_context: GenerationContext<Z>) {
    if (schema instanceof z.ZodNumber)
        return generate_number(schema, generation_context);

    if (schema instanceof z.ZodString) {
        const str = generate_string(schema, generation_context);
        return str;
    }

    if (schema instanceof z.ZodBoolean) {
        return faker.datatype.boolean();
    }

    if (schema instanceof z.ZodDate) {
        return generate_date(schema, generation_context);
    }

    if (schema instanceof z.ZodBigInt) {
        return generate_bigint(schema, generation_context);
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

    if (schema instanceof z.ZodLiteral) {
        return schema._def.value;
    }

    if (schema instanceof z.ZodUnknown) {
        return undefined;
    }

    if (schema instanceof z.ZodAny) {
        return undefined;
    }

    if (schema instanceof z.ZodNaN) {
        return NaN;
    }

    if (schema instanceof z.ZodSymbol) {
        return Symbol();
    }

    if (schema instanceof z.ZodNever) {
        throw new Error("We currently don't support ZodNever.");
    }

    if (schema instanceof z.ZodEffects) {
        console.log(schema);
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

                const generated_value = generate(property_schema, generation_context);

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
                const generated_value = generate(array_schema.element, generation_context);
                generated_array.push(generated_value);
            }

            return generated_array;
        };
        return generate_array(schema);
    }

    throw new Error("Unknown Zod-Type - Not implemented.");
}