import { z } from "zod";
import { faker } from "@faker-js/faker";
import { Generator } from "../generate.js";

export const generate_number: Generator<z.ZodNumber> = (
	number_schema,
	generation_context
) => {
	let min =
		get_number_check(number_schema, "min")?.value ??
		Number.MIN_SAFE_INTEGER / 2;
	let max =
		get_number_check(number_schema, "max")?.value ??
		Number.MAX_SAFE_INTEGER / 2;

	let finite = !!get_number_check(number_schema, "finite");
	let int = !!get_number_check(number_schema, "int");

	if (int) {
		return faker.datatype.number({ min, max });
	} else {
		return faker.datatype.float({ min, max });
	}
};

//Get a check from a ZodNumber schema in a type-safe way
function get_number_check<Kind extends z.ZodNumberCheck["kind"]>(
	schema: z.ZodNumber,
	kind: Kind
): Extract<z.ZodNumberCheck, { kind: Kind }> | undefined {
	const check = schema._def.checks.find((check) => check.kind === kind) as
		| Extract<z.ZodNumberCheck, { kind: Kind }>
		| undefined;
	return check;
}
