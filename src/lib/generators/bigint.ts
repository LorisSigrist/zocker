import { faker } from "@faker-js/faker";
import { Generator } from "../generate.js";
import { z } from "zod";

export const generate_bigint: Generator<z.ZodBigInt> = (
	bigint_schema,
	options
) => {
	const multiple_of =
		get_bigint_check(bigint_schema, "multipleOf")?.value ?? 1n;

	const min =
		get_bigint_check(bigint_schema, "min")?.value ??
		BigInt(Math.round(Number.MIN_SAFE_INTEGER / 2));
	const max =
		get_bigint_check(bigint_schema, "max")?.value ??
		BigInt(Math.round(Number.MAX_SAFE_INTEGER / 2));

	return faker.datatype.bigInt({ min, max }) * multiple_of;
};

function get_bigint_check<Kind extends z.ZodBigIntCheck["kind"]>(
	schema: z.ZodBigInt,
	kind: Kind
): Extract<z.ZodBigIntCheck, { kind: Kind }> | undefined {
	const check = schema._def.checks.find((check) => check.kind === kind) as
		| Extract<z.ZodBigIntCheck, { kind: Kind }>
		| undefined;
	return check;
}
