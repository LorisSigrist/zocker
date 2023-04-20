import { z } from "zod";
import { faker } from "@faker-js/faker";

import { generate_string } from "./datatypes/string.js";
import { generate_number } from "./datatypes/numbers.js";
import { generate_date } from "./datatypes/dates.js";
import { generate_bigint } from "./datatypes/bigint.js";
import { generate_object } from "./datatypes/object.js";
import { generate_array } from "./datatypes/array.js";
import { generate_effects } from "./datatypes/effects.js";

/**
 * Contains all the necessary configuration to generate a value for a given schema.
 */
export type GenerationContext<Z extends z.ZodSchema> = {
    generators: Map<z.ZodSchema, () => any>;
};

export function generate<Z extends z.ZodSchema>(schema: Z, generation_context: GenerationContext<Z>) {

    //Check if there is a custom generator for this schema and use it if there is.
    const custom_generator = generation_context.generators.get(schema);
    if(custom_generator) return custom_generator();

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
       return generate_effects(schema, generation_context);
    }


    if (schema instanceof z.ZodObject) {
        return generate_object(schema, generation_context);
    }

    if (schema instanceof z.ZodArray) {
        return generate_array(schema,generation_context);
    }

    throw new Error("Unknown Zod-Type - Not implemented.");
}