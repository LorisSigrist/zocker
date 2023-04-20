import { faker } from "@faker-js/faker";
import { GenerationContext } from "lib/generate.js";
import { z } from "zod";

export function generate_date<Z extends z.ZodDate>(
	date_schema: Z,
	options: GenerationContext<Z>
): Date {
	const min =
		get_date_check(date_schema, "min")?.value ??
		new Date("1970-01-01").getTime();
	const max =
		get_date_check(date_schema, "max")?.value ??
		new Date(min + 1000_000).getTime();

	return faker.datatype.datetime({ min, max });
}

function get_date_check<Kind extends z.ZodDateCheck["kind"]>(
	schema: z.ZodDate,
	kind: Kind
): Extract<z.ZodDateCheck, { kind: Kind }> | undefined {
	const check = schema._def.checks.find((check) => check.kind === kind) as
		| Extract<z.ZodDateCheck, { kind: Kind }>
		| undefined;
	return check;
}
