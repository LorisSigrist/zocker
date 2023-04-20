import { faker } from "@faker-js/faker";
import { GenerationContext, generate } from "../generate.js";
import { z } from "zod";

export function generate_record<Z extends z.ZodRecord>(
    schema: Z,
    generation_context: GenerationContext<Z>
): z.infer<Z> {
    const size = faker.datatype.number({ min: 0, max: 10 });

    const record = {} as any as Record<z.infer<Z["_def"]["keyType"]>, z.infer<Z["_def"]["valueType"]>>;

    for (let i = 0; i < size; i++) {
        const key = generate(schema._def.keyType, generation_context) as z.infer<Z["_def"]["keyType"]>
        const value = generate(schema._def.valueType, generation_context) as z.infer<Z["_def"]["valueType"]>
        record[key] = value;
    }

    return record;
}