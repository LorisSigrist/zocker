import { GenerationContext } from "lib/generate.js";
import { z } from "zod";

export function generate_effects<Z extends z.ZodEffects<any>>(
    effects_schema: Z,
    generation_options: GenerationContext<Z>
) {

    if(effects_schema._def.effect.type !== "transform") {
        throw new Error("Effects other than transform are not supported yet.");
    }

    const transform_function = effects_schema._def.effect.transform;
}
