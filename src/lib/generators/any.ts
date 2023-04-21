import { z } from "zod";
import { GenerationContext, generate } from "../generate.js";
import { pick } from "lib/utils/random.js";

export function generate_any<Z extends z.ZodAny>(
    schema: Z,
    generation_context: GenerationContext<Z>
): z.infer<Z> {

    const potential_schemas = [
        z.undefined(),
        z.null(),
        z.boolean(),
        z.number(),
        z.string(),
        z.bigint(),
        z.date(),
        z.symbol(),
        z.unknown(),
        z.nan(),
        z.record(z.any())
    ]

    const schema_to_use = pick(potential_schemas);
    const generated = generate(schema_to_use, generation_context);
    return generated;
}