import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import Randexp from "randexp";

const iso_datetime_generator: Generator<z.$ZodISODateTime> = (schema, ctx) => {
	const offset = schema._zod.def.offset === true;

	const defined_precision = schema._zod.def.precision;
	let precision =
		defined_precision != null
			? defined_precision
			: faker.number.int({ min: 0, max: 6 });
	let datetime = faker.date.recent({ days: 100 }).toISOString();

	// remove the precision (if present).
	const PRECISION_REGEX = /(\.\d+)?Z/;
	datetime = datetime.replace(PRECISION_REGEX, "Z");

	if (precision > 0) {
		const number = faker.number.int({
			min: 0,
			max: Math.pow(10, precision) - 1
		});
		const replacement = `.${number.toString().padStart(precision, "0")}Z`;
		datetime = datetime.replace("Z", replacement);
	}

	if (offset) {
		const hours_number = faker.number.int({ min: 0, max: 23 });
		const minutes_number = faker.number.int({ min: 0, max: 59 });

		const hours = hours_number.toString().padStart(2, "0");
		const minutes = minutes_number.toString().padStart(2, "0");

		const sign = faker.datatype.boolean({ probability: 0.5 }) ? "+" : "-";
		datetime = datetime.replace("Z", `${sign}${hours}:${minutes}`);
	}

	return datetime;
};

export const ISODateTimeGenerator: InstanceofGeneratorDefinition<z.$ZodISODateTime> =
	{
		match: "instanceof",
		schema: z.$ZodISODateTime as any,
		generator: iso_datetime_generator
	};

const iso_date_generator: Generator<z.$ZodISODate> = (schema, ctx) => {
	const date = faker.date.recent({ days: 100 }).toISOString().split("T")[0];
	if (!date)
		throw new Error(
			"INTERNAL ERROR - ISODateGenerator - `date` is undefined - Please open an issue."
		);
	return date;
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
	const time = randexp.gen();

	return time;
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
