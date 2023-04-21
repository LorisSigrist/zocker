import { z } from "zod";
import { GenerationContext, generate } from "../generate.js";
import { pick } from "lib/utils/random.js";

//It's important to have the schemas out here, so that they have reference equality accross generations.
//This allows us to not worry about infinite recursion, as the cyclic generation logic will protect us.
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
    z.record(z.any()),
    z.array(z.any()),
    z.tuple([z.any(), z.any()]),
    z.map(z.any(), z.any()),
    z.set(z.any()),
]


export function generate_any<Z extends z.ZodAny>(
    schema: Z,
    generation_context: GenerationContext<Z>
): z.infer<Z> {

    const schema_to_use = pick(potential_schemas);
    const generated = generate(schema_to_use, generation_context);
    return generated;
}