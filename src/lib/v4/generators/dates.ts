import { faker } from "@faker-js/faker";
import { InvalidSchemaException } from "../exceptions.js";
import { Generator } from "../generate.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";
import * as z from "zod/v4/core";

// The minimum & maximum date 
// according to https://262.ecma-international.org/5.1/#sec-15.9.1.1
const MIN_DATE = new Date(-8640000000000000);
const MAX_DATE = new Date(8640000000000000);

const generate_date: Generator<z.$ZodDate> = (date_schema, ctx) => {
	const min_checks = date_schema._zod.def.checks?.filter(c => c instanceof z.$ZodCheckGreaterThan) ?? [];
	const max_checks = date_schema._zod.def.checks?.filter(c => c instanceof z.$ZodCheckLessThan) ?? [];
	
	const min = min_checks.reduce((acc, check) => {
		const value = check._zod.def.value as Date;
		return value > acc ? value : acc;
	}, MIN_DATE);

	const max = max_checks.reduce((acc, check) => {
		const value = check._zod.def.value as Date;
		return value < acc ? value : acc;
	}, MAX_DATE);

	if (min && max && max < min)
		throw new InvalidSchemaException("max date is less than min date");

	return faker.datatype.datetime({
		min: min.getTime() ?? undefined,
		max: max.getTime() ?? undefined
	});
};

export const DateGenerator: InstanceofGeneratorDefinition<z.$ZodDate> = {
	schema: z.$ZodDate as any,
	generator: generate_date,
	match: "instanceof"
};
