import { GeneratorDefinitionFactory } from "../../zocker.js";
import { Generator, generate } from "../../generate.js";
import { z } from "zod";
import { NoGeneratorException } from "../../exceptions.js";

export const IntersectionGenerator: GeneratorDefinitionFactory<z.ZodIntersection<any, any>> = () => {
    return {
        schema: z.ZodIntersection as any,
        generator: generate_intersection,
        match: "instanceof"
    };
}

const generate_intersection: Generator<z.ZodIntersection<any, any>> = (schema, ctx) => {
    const schema_1 = schema._def.left;
    const schema_2 = schema._def.right;

    if (schema_1 instanceof z.ZodNumber && schema_2 instanceof z.ZodNumber) {
        const combined = z.number();
        combined._def.checks = [...schema_1._def.checks, ...schema_2._def.checks];
        return generate(combined, ctx);
    }

    if (schema_1 instanceof z.ZodString && schema_2 instanceof z.ZodString) {
        try {
            const combined = z.string();
            combined._def.checks = [...schema_1._def.checks, ...schema_2._def.checks];
            return generate(combined, ctx);
        } catch (e) {
            throw new NoGeneratorException("ZodIntersections only have very limited support at the moment. - Your string intersection is too complex.", { cause: e })
        }
    }

    throw new NoGeneratorException("ZodIntersections only have very limited support at the moment.")
}