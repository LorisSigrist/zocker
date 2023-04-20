import { GenerationContext, generate } from "../generate.js";
import { z } from "zod";

export function generate_effects<Z extends z.ZodEffects<any>>(
    effects_schema: Z,
    generation_options: GenerationContext<Z>
) {

    if(effects_schema._def.effect.type !== "transform") {
        throw new Error("To use refinements or preprocessors, you must supply a custom generator for your schema when calling `zocker`");
    }

    //Generate an argument, then pass it to the transform function.
    //This should result in a valid output.
    const argument : any = generate(effects_schema._def.schema, generation_options);
    const transform_function = effects_schema._def.effect.transform;

    return transform_function(argument, {
        addIssue: () => {},
        path: [],
    });
}