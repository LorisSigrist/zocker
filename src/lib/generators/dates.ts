import { faker } from "@faker-js/faker";
import { GenerationContext, Generator } from "lib/generate.js";
import { z } from "zod";

export const generate_date: Generator<z.ZodDate> = (date_schema, options) => {
	const min =
		get_date_check(date_schema, "min")?.value ??
		new Date("1970-01-01").getTime();
	const max =
		get_date_check(date_schema, "max")?.value ??
		new Date(min + 1000_000).getTime();

	return faker.datatype.datetime({ min, max });
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
