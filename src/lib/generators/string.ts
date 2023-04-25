import { faker } from "@faker-js/faker";
import { Schema, z } from "zod";
import Randexp from "randexp";
import { Generator } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { InvalidSchemaException } from "../exceptions.js";

type LengthConstraints = {
	min: number | null;
	max: number | null;
	exact: number | null;
};

type ContentConstraints = {
	starts_with: string | null;
	ends_with: string | null;
	includes: string[];
};

export const generate_string: Generator<z.ZodString> = (string_schema, ctx) => {
	const cc = content_constraints(string_schema);
	const lc = length_constraints(string_schema);

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


	const emoji = get_string_check(string_schema, "emoji");
	if (emoji) {
		const length =
			lc.exact ??
			faker.datatype.number({ min: lc.min ?? 0, max: lc.max ?? (lc.min !== null ? lc.min + 10_000 : 10_000) });
		let emojis = "";
		for (let i = 0; i < length; i++) {
			emojis += faker.internet.emoji();
		}
		return emojis;
	}

	return generate_random_string(lc, cc);
};

function generate_random_string(
	lc: LengthConstraints,
	cc: ContentConstraints
): string {

	let length = lc.exact ?? faker.datatype.number({ min: lc.min ?? 0, max: lc.max ?? (lc.min !== null ? lc.min + 10_000 : 10_000) });

	const generated_length =
		length -
		(cc.starts_with?.length ?? 0) -
		(cc.ends_with?.length ?? 0) -
		cc.includes.reduce((a, b) => a + b.length, 0);
	return (
		(cc.starts_with ?? "") +
		faker.datatype.string(generated_length) +
		cc.includes.join() +
		(cc.ends_with ?? "")
	);
}

//Get a check from a ZodString schema in a type-safe way
function get_string_check<Kind extends z.ZodStringCheck["kind"]>(
	schema: z.ZodString,
	kind: Kind
): Extract<z.ZodStringCheck, { kind: Kind }> | undefined {
	const check = schema._def.checks.find((check) => check.kind === kind) as
		| Extract<z.ZodStringCheck, { kind: Kind }>
		| undefined;
	return check;
}

/**
 * Gets the length constraints from a ZodString schema
 * @param schema 
 * @throws InvalidSchemaException if the schemas length constraints are impossible
 */
function length_constraints(schema: z.ZodString): LengthConstraints {
	const exact = get_string_check(schema, "length")?.value ?? null;
	const min = get_string_check(schema, "min")?.value ?? null;
	const max = get_string_check(schema, "max")?.value ?? null;

	if (min !== null && max !== null && min > max)
		throw new InvalidSchemaException(
			"min length is greater than max length - The Schema cannot be satisfied"
		);

	if (exact !== null) {
		if (min !== null && exact < min)
			throw new InvalidSchemaException(
				"exact length is less than min length - The Schema cannot be satisfied"
			);
		if (max !== null && exact > max)
			throw new InvalidSchemaException(
				"exact length is greater than max length - The Schema cannot be satisfied"
			);
	}
	return { exact, min, max };
}


function content_constraints(schema: z.ZodString): ContentConstraints {
	const starts_with = get_string_check(schema, "startsWith")?.value ?? null;
	const ends_with = get_string_check(schema, "endsWith")?.value ?? null;

	const include_checks = schema._def.checks.filter(
		(check) => check.kind === "includes"
	) as Extract<z.ZodStringCheck, { kind: "includes" }>[];
	const includes = include_checks.map((check) => check.value);

	return { starts_with, ends_with, includes };
}