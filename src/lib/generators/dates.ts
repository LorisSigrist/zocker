import { faker } from "@faker-js/faker";
import { InvalidSchemaException } from "../exceptions.js";
import { Generator } from "lib/generate.js";
import { InstanceofGeneratorDefinition } from "lib/zocker.js";
import { z } from "zod";

const generate_date: Generator<z.ZodDate> = (date_schema, ctx) => {
	const min = get_date_check(date_schema, "min")?.value ?? null;
	const max = get_date_check(date_schema, "max")?.value ?? null;

	if (min && max && max < min)
		throw new InvalidSchemaException("max date is less than min date");

	return faker.datatype.datetime({
		min: min ?? undefined,
		max: max ?? undefined
	});
};

function get_date_check<Kind extends z.ZodDateCheck["kind"]>(
	schema: z.ZodDate,
	kind: Kind
): Extract<z.ZodDateCheck, { kind: Kind }> | undefined {
	const check = schema._def.checks.find((check) => check.kind === kind) as
		| Extract<z.ZodDateCheck, { kind: Kind }>
		| undefined;
	return check;
}

export const DateGenerator: InstanceofGeneratorDefinition<z.ZodDate> = {
	schema: z.ZodDate as any,
	generator: generate_date,
	match: "instanceof"
};
