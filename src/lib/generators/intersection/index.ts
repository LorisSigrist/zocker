import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { Generator, generate } from "../../generate.js";
import { z } from "zod";
import {
	InvalidSchemaException,
	NoGeneratorException
} from "../../exceptions.js";

const generate_intersection: Generator<z.ZodIntersection<any, any>> = (
	schema,
	ctx
) => {
	const schema_1 = schema._def.left;
	const schema_2 = schema._def.right;

	const merged = merge_schema(schema_1, schema_2);
	return generate(merged, ctx);
};

const merge_schema = (
	schema_1: z.ZodSchema,
	schema_2: z.ZodSchema
): z.ZodSchema => {
	if (schema_1 instanceof z.ZodNumber && schema_2 instanceof z.ZodNumber) {
		const combined = z.number();
		combined._def.checks = [...schema_1._def.checks, ...schema_2._def.checks];
		return combined;
	}

	if (schema_1 instanceof z.ZodString && schema_2 instanceof z.ZodString) {
		const combined = z.string();
		combined._def.checks = [...schema_1._def.checks, ...schema_2._def.checks];
		return combined;
	}

	if (schema_1 instanceof z.ZodBoolean && schema_2 instanceof z.ZodBoolean) {
		return z.boolean();
	}

	if (schema_1 instanceof z.ZodLiteral && schema_2 instanceof z.ZodLiteral) {
		if (schema_1._def.value === schema_2._def.value) {
			return schema_1;
		} else {
			throw new InvalidSchemaException(
				"There is no intersection between two literals with different values."
			);
		}
	}

	if (schema_1 instanceof z.ZodSymbol && schema_2 instanceof z.ZodSymbol) {
		return z.symbol();
	}

	throw new NoGeneratorException(
		"ZodIntersections only have very limited support at the moment."
	);
};

export const IntersectionGenerator: InstanceofGeneratorDefinition<
	z.ZodIntersection<any, any>
> = {
	schema: z.ZodIntersection as any,
	generator: generate_intersection,
	match: "instanceof"
};
