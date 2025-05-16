import { InstanceofGeneratorDefinition } from "../zocker.js";
import { generate, Generator } from "../generate.js";
import * as z from "zod/v4/core";
import { NoGeneratorException } from "../exceptions.js";

const pipe_generator: Generator<z.$ZodPipe> = (schema, ctx) => {
    const first = schema._zod.def.in;
    const second = schema._zod.def.out;

    if(!(second instanceof z.$ZodTransform)) {
        throw new NoGeneratorException("Currently only transforms are supported as the second parameter to `z.pipe`");
    }

    const transform_function = second._zod.def.transform

    const value = generate(first, ctx);
    const transformed = transform_function(value, { "issues": [], value })

    return transformed;
};

export const PipeGenerator: InstanceofGeneratorDefinition<z.$ZodPipe> = {
    schema: z.$ZodPipe as any,
    generator: pipe_generator,
    match: "instanceof"
};
