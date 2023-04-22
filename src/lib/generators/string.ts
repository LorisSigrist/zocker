import { faker } from "@faker-js/faker";
import { z } from "zod";
import Randexp from "randexp";
import { Generator } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { InvalidSchemaException } from "../exceptions.js";

export const generate_string: Generator<z.ZodString> = (
	string_schema,
	generation_options
) => {
	let regex: RegExp | undefined = undefined;

	const datetime = get_string_check(string_schema, "datetime");
	if (datetime) return faker.date.recent().toISOString();

	const uuid = get_string_check(string_schema, "uuid");
	if (uuid) return faker.datatype.uuid();

	const ip = get_string_check(string_schema, "ip");
	if (ip) {
		const ip_v4 = ip.version === "v4" ?? false;
		const ip_v6 = ip.version === "v6" ?? false;

		if (ip_v4) return faker.internet.ipv4();
		if (ip_v6) return faker.internet.ipv6();

		return weighted_random_boolean(0.5)
			? faker.internet.ipv4()
			: faker.internet.ipv6();
	}

	const email = get_string_check(string_schema, "email");
	if (email) return faker.internet.email();

	const url = get_string_check(string_schema, "url");
	if (url) return faker.internet.url();

	const regex_check = get_string_check(string_schema, "regex");
	if (regex_check) regex = regex_check.regex;

	const cuid = get_string_check(string_schema, "cuid");
	if (cuid) regex = /^c[^\s-]{8,}$/i;

	const cuid2 = get_string_check(string_schema, "cuid2");
	if (cuid2) regex = /^[a-z][a-z0-9]*$/;

	const ulid = get_string_check(string_schema, "ulid");
	if (ulid) regex = /[0-9A-HJKMNP-TV-Z]{26}/;

	if (regex) {
		const randexp = new Randexp(regex);
		randexp.randInt = (min, max) =>
			faker.datatype.number({ min, max, precision: 1 });
		return randexp.gen();
	}

	const ends_with = get_string_check(string_schema, "endsWith")?.value ?? "";
	const starts_with =
		get_string_check(string_schema, "startsWith")?.value ?? "";

	const include_checks = string_schema._def.checks.filter((check) => check.kind === "includes") as Extract<z.ZodStringCheck, { kind: "includes" }>[]
	const includes = include_checks.map((check) => check.value);


	const exact_length = get_string_check(string_schema, "length")?.value ?? null;
	const min_length = get_string_check(string_schema, "min")?.value ?? 0;
	const max_length =
		get_string_check(string_schema, "max")?.value ?? min_length + 10000;

	if (min_length > max_length)
		throw new InvalidSchemaException(
			"min length is greater than max length - The Schema never matches"
		);

	const emoji = get_string_check(string_schema, "emoji");
	if (emoji) {
		const length =
			exact_length ??
			faker.datatype.number({ min: min_length, max: max_length });
		let emojis = "";
		for (let i = 0; i < length; i++) {
			emojis += faker.internet.emoji();
		}
		return emojis;
	}

	let length =
		exact_length ?? faker.datatype.number({ min: min_length, max: max_length });
	return generate_random_string(length, starts_with, ends_with, includes);
};

function generate_random_string(
	length: number,
	starts_with: string,
	ends_with: string,
	includes: string[]
): string {
	const generated_length = length - starts_with.length - ends_with.length - includes.reduce((a, b) => a + b.length, 0);
	return starts_with + faker.datatype.string(generated_length) + includes.join() + ends_with;
}

//Get a check from a ZodString schema in a type-safe way
function get_string_check<Kind extends z.ZodStringCheck["kind"]>(
	schema: z.ZodString,
	kind: Kind,
): Extract<z.ZodStringCheck, { kind: Kind }> | undefined {
	const check = schema._def.checks.find((check) => check.kind === kind) as
		| Extract<z.ZodStringCheck, { kind: Kind }>
		| undefined;
	return check;
}