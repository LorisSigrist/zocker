import { Generator, generate } from "../generate.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";
import { z } from "zod";

const generate_readonly: Generator<z.ZodReadonly<any>> = (
	readonly_schema,
	ctx
) => {
	const inner = generate(readonly_schema._def.innerType, ctx);

	if (typeof inner === "object") {
		Object.freeze(inner);
	}

	return inner;
};

export const ReadonlyGenerator: InstanceofGeneratorDefinition<
	z.ZodReadonly<any>
> = {
	schema: z.ZodReadonly as any,
	generator: generate_readonly,
	match: "instanceof"
};
