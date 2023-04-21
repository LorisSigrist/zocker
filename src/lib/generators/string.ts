import { faker } from "@faker-js/faker";
import { z } from "zod";
import Randexp from "randexp";
import { GenerationContext } from "lib/generate.js";
import { weighted_random_boolean } from "../utils/random.js";

export function generate_string<Z extends z.ZodString>(
	string_schema: Z,
	generation_options: GenerationContext<Z>
) {
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

	const regex = get_string_check(string_schema, "regex");
	if (regex) {
		const randexp = new Randexp(regex.regex);
		randexp.max = 10;
		return randexp.gen();
	}

	const exact_length = get_string_check(string_schema, "length")?.value ?? null;

	const min_length = get_string_check(string_schema, "min")?.value ?? 0;
	const max_length =
		get_string_check(string_schema, "max")?.value ?? min_length + 10000;

	if (min_length > max_length)
		throw new Error(
			"min length is greater than max length - The Schema never matches"
		);

	return exact_length
		? faker.datatype.string(exact_length)
		: faker.datatype.string(
				faker.datatype.number({ min: min_length, max: max_length })
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
