import { Generator, generate } from "../generate.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";
import * as z from "zod/v4/core";

const generate_readonly: Generator<z.$ZodReadonly<any>> = (
	readonly_schema,
	ctx
) => {
	const inner = generate(readonly_schema._zod.def.innerType, ctx);

	if (typeof inner === "object") {
		Object.freeze(inner);
	}

	return inner;
};

export const ReadonlyGenerator: InstanceofGeneratorDefinition<
	z.$ZodReadonly<any>
> = {
	schema: z.$ZodReadonly as any,
	generator: generate_readonly,
	match: "instanceof"
};
