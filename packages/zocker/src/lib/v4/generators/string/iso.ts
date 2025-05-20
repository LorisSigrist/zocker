import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import Randexp from "randexp";

const iso_datetime_generator: Generator<z.$ZodISODateTime> = (schema, ctx) => {
	const pattern = schema._zod.def.pattern!;

	const randexp = new Randexp(pattern);
	randexp.randInt = (min: number, max: number) =>
		faker.number.int({ min, max });
	return randexp.gen();
};

export const ISODateTimeGenerator: InstanceofGeneratorDefinition<z.$ZodISODateTime> =
{
	match: "instanceof",
	schema: z.$ZodISODateTime as any,
	generator: iso_datetime_generator
};

const iso_date_generator: Generator<z.$ZodISODate> = (schema, ctx) => {
	const pattern = schema._zod.def.pattern!;

	const randexp = new Randexp(pattern);
	randexp.randInt = (min: number, max: number) =>
		faker.number.int({ min, max });
	return randexp.gen();
};

export const ISODateGenerator: InstanceofGeneratorDefinition<z.$ZodISODate> = {
	match: "instanceof",
	schema: z.$ZodISODate as any,
	generator: iso_date_generator
};

const iso_time_generator: Generator<z.$ZodISOTime> = (schema, ctx) => {
	const pattern = schema._zod.def.pattern!;

	const randexp = new Randexp(pattern);
	randexp.randInt = (min: number, max: number) =>
		faker.number.int({ min, max });
	return randexp.gen();
};

export const ISOTimeGenerator: InstanceofGeneratorDefinition<z.$ZodISOTime> = {
	match: "instanceof",
	schema: z.$ZodISOTime as any,
	generator: iso_time_generator
};

const iso_duration_generator: Generator<z.$ZodISODuration> = (schema, ctx) => {
	// We don't support regexes with positive lookaheads, so we need to
	// manually generate a valid ISO time.

	// Format :P3Y6M4DT12H30M5S

	const parts = [
		faker.number.int({ min: 0, max: 100 }),
		faker.number.int({ min: 0, max: 11 }),
		faker.number.int({ min: 0, max: 31 }),
		faker.number.int({ min: 0, max: 23 }),
		faker.number.int({ min: 0, max: 59 }),
		faker.number.int({ min: 0, max: 59 })
	];

	// TODO: Support other Duration Formats
	let result = `P${parts[0]}Y${parts[1]}M${parts[2]}DT${parts[3]}H${parts[4]}M${parts[5]}S`;
	return result;
};

export const ISODurationGenerator: InstanceofGeneratorDefinition<z.$ZodISODuration> =
{
	match: "instanceof",
	schema: z.$ZodISODuration as any,
	generator: iso_duration_generator
};
