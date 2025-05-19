import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { Generator, generate } from "../../generate.js";
import * as zCore from "zod/v4/core";
import { z as z4 } from "zod/v4";

import {
	InvalidSchemaException,
	NoGeneratorException
} from "../../exceptions.js";

const generate_intersection: Generator<zCore.$ZodIntersection<any, any>> = (
	schema,
	ctx
) => {
	const schema_1 = schema._zod.def.left;
	const schema_2 = schema._zod.def.right;

	const merged = merge_schema(schema_1, schema_2);
	return generate(merged, ctx);
};

const merge_schema = (
	schema_1: zCore.$ZodType,
	schema_2: zCore.$ZodType
): zCore.$ZodType => {
	if (
		schema_1 instanceof zCore.$ZodNumber &&
		schema_2 instanceof zCore.$ZodNumber
	) {
		const combined = z4.number();
		combined._zod.def.checks = [
			...(schema_1._zod.def.checks ?? []),
			...(schema_2._zod.def.checks ?? [])
		];
		return combined;
	}

	if (
		schema_1 instanceof zCore.$ZodString &&
		schema_2 instanceof zCore.$ZodString
	) {
		const combined = z4.string();
		combined._zod.def.checks = [
			...(schema_1._zod.def.checks ?? []),
			...(schema_2._zod.def.checks ?? [])
		];
		return combined;
	}

	if (
		schema_1 instanceof zCore.$ZodBoolean &&
		schema_2 instanceof zCore.$ZodBoolean
	) {
		return z4.boolean();
	}

	if (
		schema_1 instanceof zCore.$ZodLiteral &&
		schema_2 instanceof zCore.$ZodLiteral
	) {
		const common_values = setIntersection(
			new Set(schema_1._zod.def.values),
			new Set(schema_2._zod.def.values)
		);

		if (common_values.size === 0) {
			throw new InvalidSchemaException(
				"Cannot generate intersection of literal schemas with no common values"
			);
		}

		return z4.literal(Array.from(common_values));
	}

	if (
		schema_1 instanceof zCore.$ZodSymbol &&
		schema_2 instanceof zCore.$ZodType
	) {
		return z4.symbol();
	}

	throw new NoGeneratorException(
		"ZodIntersections only have very limited support at the moment."
	);
};

export const IntersectionGenerator: InstanceofGeneratorDefinition<
	zCore.$ZodIntersection<any, any>
> = {
	schema: zCore.$ZodIntersection as any,
	generator: generate_intersection,
	match: "instanceof"
};

function setIntersection(a: Set<any>, b: Set<any>) {
	return new Set([...a].filter((x) => b.has(x)));
}
