import { faker } from "@faker-js/faker";
import { z } from "zod";
import Randexp from "randexp";
import { Generator } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { InvalidSchemaException, NoGeneratorException } from "../exceptions.js";

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

type TransformDefinition = {
	trim: boolean;
	case: "upper" | "lower" | null;
};

type CacheEntry = {
	length_constraints: LengthConstraints;
	content_constraints: ContentConstraints;
	transform_constaints: TransformDefinition;
};

const cache = new WeakMap<z.ZodString, CacheEntry>();

export const generate_string: Generator<z.ZodString> = (string_schema, ctx) => {
	const cache_hit = cache.get(string_schema);

	const cc =
		cache_hit?.content_constraints ?? content_constraints(string_schema);
	const lc = cache_hit?.length_constraints ?? length_constraints(string_schema);
	const tf = cache_hit?.transform_constaints ?? transforms(string_schema);

	if (!cache_hit)
		cache.set(string_schema, {
			length_constraints: lc,
			content_constraints: cc,
			transform_constaints: tf
		});

	let generated = generate_pre_transform(string_schema, lc, cc);
	if (tf.trim) generated = generated.trim();
	if (tf.case === "upper") generated = generated.toUpperCase();
	if (tf.case === "lower") generated = generated.toLowerCase();

	return generated;
};

function generate_random_string(
	lc: LengthConstraints,
	cc: ContentConstraints
): string {
	const min = Math.max(
		0,
		lc.min ?? 0,
		(cc.starts_with?.length ?? 0) +
			(cc.ends_with?.length ?? 0) +
			cc.includes.reduce((a, b) => a + b.length, 0)
	);

	const max = lc.max ?? (lc.min !== null ? lc.min + 10_000 : 10_000);

	let length =
		lc.exact ??
		faker.datatype.number({
			min,
			max
		});

	const generated_length =
		length -
		(cc.starts_with?.length ?? 0) -
		(cc.ends_with?.length ?? 0) -
		cc.includes.reduce((a, b) => a + b.length, 0);

	if (generated_length < 0) {
		throw new InvalidSchemaException(
			"Length constraints are impossible to satisfy"
		);
	}
	return (
		(cc.starts_with ?? "") +
		faker.datatype.string(generated_length) +
		cc.includes.join() +
		(cc.ends_with ?? "")
	);
}

//Get a check from a ZodString schema in a type-safe way
function get_string_checks<Kind extends z.ZodStringCheck["kind"]>(
	schema: z.ZodString,
	kind: Kind
): Extract<z.ZodStringCheck, { kind: Kind }>[] {
	const check = schema._def.checks.filter((check) => check.kind === kind) as
		| Extract<z.ZodStringCheck, { kind: Kind }>[];
	return check;
}

/**
 * Gets the length constraints from a ZodString schema
 * @param schema
 * @throws InvalidSchemaException if the schemas length constraints are impossible
 */
function length_constraints(schema: z.ZodString): LengthConstraints {
	const exact = get_string_checks(schema, "length")[0]?.value ?? null;

	const min_checks = get_string_checks(schema, "min");
	const max_checks = get_string_checks(schema, "max");

	const min =
		min_checks.length === 0
			? null
			: min_checks.map((c) => c.value).reduce((a, b) => Math.max(a, b), 0);
	const max =
		max_checks.length === 0
			? null
			: max_checks.map((c) => c.value).reduce((a, b) => Math.min(a, b), 10_000);

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
	//Sort from longest to shortest
	const starts_with_checks = get_string_checks(schema, "startsWith").sort(
		(a, b) => b.value.length - a.value.length
	);
	const ends_with_checks = get_string_checks(schema, "endsWith").sort(
		(a, b) => b.value.length - a.value.length
	);

	//If there are multiple startsWith or endsWith checks, we can just use the longest one
	const starts_with = starts_with_checks[0]?.value ?? null;
	const ends_with = ends_with_checks[0]?.value ?? null;

	if (starts_with_checks.length >= 2) {
		//For each adjacent pair of checks, check if the first starts with the second
		for (let i = 0; i < starts_with_checks.length - 1; i++) {
			const first = starts_with_checks[i]!.value;
			const second = starts_with_checks[i + 1]!.value;

			if (!first.startsWith(second)) {
				throw new InvalidSchemaException(
					"startsWith constraints are not compatible - The Schema cannot be satisfied"
				);
			}
		}
	}

	if (ends_with_checks.length >= 2) {
		//For each adjacent pair of checks, check if the first ends with the second
		for (let i = 0; i < ends_with_checks.length - 1; i++) {
			const first = ends_with_checks[i]!.value;
			const second = ends_with_checks[i + 1]!.value;

			if (!first.endsWith(second)) {
				throw new InvalidSchemaException(
					"endsWith constraints are not compatible - The Schema cannot be satisfied"
				);
			}
		}
	}

	const include_checks = schema._def.checks.filter(
		(check) => check.kind === "includes"
	) as Extract<z.ZodStringCheck, { kind: "includes" }>[];

	//get the includes checks, get the values, sort them from longest to shortest
	let includes = include_checks
		.map((check) => check.value)
		.sort((a, b) => b.length - a.length);

	if (includes.length >= 2) {
	}

	//If "startsWith" includes one of the "includes" checks, remove it
	if (starts_with !== null) {
		includes = includes.filter((include) => !starts_with.includes(include));
	}

	//If "endsWith" includes one of the "includes" checks, remove it
	if (ends_with !== null) {
		includes = includes.filter((include) => !ends_with.includes(include));
	}

	return { starts_with, ends_with, includes };
}

function transforms(schema: z.ZodString): TransformDefinition {
	const transform_definition: TransformDefinition = {
		trim: false,
		case: null
	};

	const transform_types: z.ZodStringCheck["kind"][] = [
		"trim",
		"toUpperCase",
		"toLowerCase"
	];
	let transform_seen = false;

	for (const check of schema._def.checks) {
		const is_transform = transform_types.includes(check.kind);
		if (!is_transform && transform_seen) {
			throw new NoGeneratorException(
				"Zocker currently does not support `trim` and `toUpperCase`/`toLowerCase`, unless they are the last checks in the chain"
			);
		}
		transform_seen = transform_seen || is_transform;

		if (is_transform) {
			switch (check.kind) {
				case "trim":
					transform_definition.trim = true;
					break;
				case "toUpperCase":
					transform_definition.case = "upper";
					break;
				case "toLowerCase":
					transform_definition.case = "lower";
					break;
			}
		}
	}
	return transform_definition;
}

const generate_pre_transform = (
	string_schema: z.ZodString,
	lc: LengthConstraints,
	cc: ContentConstraints
) => {
	let regex: RegExp | undefined = undefined;

	const datetime_checks = get_string_checks(string_schema, "datetime");
	if (datetime_checks.length > 0) {
		let offset = true;
		for (const check of datetime_checks) {
			if (check.offset !== true) offset = false;
		}
		let datetime = faker.date.recent().toISOString();
		if (offset) {
			const hours_number = faker.datatype.number({ min: 0, max: 23 });
			const minutes_number = faker.datatype.number({ min: 0, max: 59 });
			const hours = hours_number.toString().padStart(2, "0");
			const minutes = minutes_number.toString().padStart(2, "0");

			const sign = weighted_random_boolean(0.5) ? "+" : "-";

			datetime = datetime.replace("Z", `${sign}${hours}:${minutes}`);
		}
		return datetime;
	}

	const uuid = get_string_checks(string_schema, "uuid")[0];
	if (uuid) return faker.datatype.uuid();

	const ip_checks = get_string_checks(string_schema, "ip");
	if (ip_checks.length > 0) {
		let version: z.IpVersion | undefined = undefined;
		for (const check of ip_checks) {
			if (check.version && version && check.version !== version) {
				throw new InvalidSchemaException(
					"Specified multiple incompatible versions of IP address"
				);
			}
			version = check.version ?? version;
		}

		const ip_v4 = version === "v4" ?? false;
		const ip_v6 = version === "v6" ?? false;

		if (ip_v4) return faker.internet.ipv4();
		if (ip_v6) return faker.internet.ipv6();

		return weighted_random_boolean(0.5)
			? faker.internet.ipv4()
			: faker.internet.ipv6();
	}

	const email = get_string_checks(string_schema, "email")[0];
	if (email) return faker.internet.email();

	const url = get_string_checks(string_schema, "url")[0];
	if (url) return faker.internet.url();

	const regex_checks = get_string_checks(string_schema, "regex");
	if (regex_checks.length > 0) {
		if (
			cc.starts_with !== null ||
			cc.ends_with !== null ||
			cc.includes.length > 0
		)
			throw new NoGeneratorException(
				"Zocker's included regex generator currently does not work together with `starts_with`, `ends_with` or `includes`. Incorperate these into your regex, or provide a custom generator."
			);

		if (regex_checks.length > 1)
			throw new NoGeneratorException(
				"Zocker's included regex generator currently does support multiple regex checks on the same string. Provide a custom generator instead."
			);

		regex = regex_checks[0]!.regex;
	}

	const cuid = get_string_checks(string_schema, "cuid")[0];
	if (cuid) regex = /^c[^\s-]{8,}$/i;

	const cuid2 = get_string_checks(string_schema, "cuid2")[0];
	if (cuid2) regex = /^[a-z][a-z0-9]*$/;

	const ulid = get_string_checks(string_schema, "ulid")[0];
	if (ulid) regex = /[0-9A-HJKMNP-TV-Z]{26}/;

	if (regex) {
		const randexp = new Randexp(regex);
		randexp.randInt = (min, max) =>
			faker.datatype.number({ min, max, precision: 1 });
		return randexp.gen();
	}

	const emoji = get_string_checks(string_schema, "emoji")[0];
	if (emoji) {
		const length =
			lc.exact ??
			faker.datatype.number({
				min: lc.min ?? 0,
				max: lc.max ?? (lc.min !== null ? lc.min + 10_000 : 10_000)
			});
		let emojis = "";
		for (let i = 0; i < length; i++) {
			emojis += faker.internet.emoji();
		}
		return emojis;
	}

	return generate_random_string(lc, cc);
};
