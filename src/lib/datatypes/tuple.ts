import { GenerationContext, generate } from "../generate.js";
import { z } from "zod";

export function generate_tuple<T extends z.ZodTuple<any>>(schema: T, generation_context: GenerationContext<T>): z.infer<T> {
    const tuple = schema._def.items.map(<Z extends z.ZodSchema>(item: Z) => generate(item, generation_context));
    return tuple as z.infer<T>;
}