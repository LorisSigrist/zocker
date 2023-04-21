import { RecursionLimitReachedException } from "../exceptions.js";
import { GenerationContext, generate } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { z } from "zod";

export function generate_nullable<Z extends z.ZodNullable<any>>(
    schema: Z,
    generation_context: GenerationContext<Z>
): z.infer<Z> {
    const should_be_null = weighted_random_boolean(
        generation_context.null_chance
    );

    try {
        return should_be_null
            ? null
            : generate(schema._def.innerType, generation_context);
    } catch (e) {
        if (e instanceof RecursionLimitReachedException) {
            return null;
        } else {
            throw e;
        }
    }
}