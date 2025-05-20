import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { GenerationContext, Generator } from "../../generate.js";
import { z } from "zod";
import {
	InvalidSchemaException,
	NoGeneratorException
} from "../../exceptions.js";
import * as StrGens from "./generators.js";

type StringFormat =
	| {
			kind: "ip";
			version: "v4" | "v6" | null;
	  }
	| {
			kind: "datetime";
			offset: boolean;
	  }
	| {
			kind:
				| "url"
				| "uuid"
				| "cuid"
				| "cuid2"
				| "ulid"
				| "emoji"
				| "email"
				| "any";
	  }
	| {
			kind: "regex";
			regex: RegExp;
	  };

export type LengthConstraints = {
	min: number | null;
	max: number | null;
	exact: number | null;
};

export type ContentConstraints = {
	format: StringFormat;
	starts_with: string | null;
	ends_with: string | null;
	includes: string[];
};

export type TransformDefinition = {
	trim: boolean;
	case: "upper" | "lower" | null;
};

type CacheEntry = {
	length_constraints: LengthConstraints;
	content_constraints: ContentConstraints;
	transform_constaints: TransformDefinition;
};

export type StringKindGenerator = <Z extends z.ZodString>(
	ctx: GenerationContext<Z>,
	lc: LengthConstraints,
	cc: ContentConstraints,
	td: TransformDefinition
) => string;

const generate_string: Generator<z.ZodString> = (string_schema, ctx) => {
	const cc = content_constraints(string_schema);
	const lc = length_constraints(string_schema);
	const tf = transforms(string_schema);

	const generate_raw_string = () => {
		switch (cc.format.kind) {
			case "ip":
				return StrGens.ip(ctx, lc, cc, tf);

			case "datetime":
				return StrGens.datetime(ctx, lc, cc, tf);

			case "email":
				return StrGens.email(ctx, lc, cc, tf);
			case "url":
				return StrGens.url(ctx, lc, cc, tf);
			case "uuid":
				return StrGens.uuid(ctx, lc, cc, tf);

			case "cuid":
				return StrGens.cuid(ctx, lc, cc, tf);
			case "cuid2":
				return StrGens.cuid2(ctx, lc, cc, tf);
			case "ulid":
				return StrGens.ulid(ctx, lc, cc, tf);

			case "emoji":
				return StrGens.emoji(ctx, lc, cc, tf);

			case "regex":
				return StrGens.regex(ctx, lc, cc, tf);
			case "any":
			default:
				return StrGens.any(ctx, lc, cc, tf);
		}
	};

	let string = generate_raw_string();

	if (tf.trim) string = string.trim();

	if (tf.case === "upper") string = string.toUpperCase();
	else if (tf.case === "lower") string = string.toLowerCase();

	return string;
};

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
function length_constraints<Z extends z.ZodString>(
	schema: Z
): LengthConstraints {
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

	//A list of all the z.ZodStringCheck kinds that we consider to be "format" checks
	//They are all considered to be mutually exclusive
	const format_checks: z.ZodStringCheck["kind"][] = [
		"uuid",
		"email",
		"url",
		"regex",
		"cuid",
		"cuid2",
		"ulid",
		"emoji",
		"ip",
		"datetime"
	];

	const checks_to_formats: {
		[Kind in (typeof format_checks)[number]]?: (
			checks: Extract<z.ZodStringCheck, { kind: Kind }>[]
		) => StringFormat;
	} = {
		uuid: () => ({ kind: "uuid" }),
		email: () => ({ kind: "email" }),
		url: () => ({ kind: "url" }),
		regex: (checks) => {
			if (starts_with !== null || ends_with !== null || includes.length > 0)
				throw new NoGeneratorException(
					"Zocker's included regex generator currently does not work together with `starts_with`, `ends_with` or `includes`. Incorperate these into your regex, or provide a custom generator."
				);

			if (checks.length > 1)
				throw new NoGeneratorException(
					"Zocker's included regex generator currently does support multiple regex checks on the same string. Provide a custom generator instead."
				);

			const regex = checks[0]?.regex!;
			return { kind: "regex", regex };
		},
		cuid: () => ({ kind: "cuid" }),
		cuid2: () => ({ kind: "cuid2" }),
		ulid: () => ({ kind: "ulid" }),
		emoji: () => ({ kind: "emoji" }),
		ip: (checks) => {
			let version: z.IpVersion | undefined = undefined;
			for (const check of checks) {
				if (check.version && version && check.version !== version) {
					throw new InvalidSchemaException(
						"Specified multiple incompatible versions of IP address"
					);
				}
				version = check.version ?? version;
			}

			return { kind: "ip", version: version ?? null };
		},
		datetime: (checks) => {
			let offset = true;
			for (const check of checks) {
				if (check.offset !== true) offset = false;
			}
			return { kind: "datetime", offset };
		}
	};

	let format_kind: (typeof format_checks)[number] | undefined = undefined;
	let checks = [] as Extract<
		z.ZodStringCheck,
		{ kind: (typeof format_checks)[number] }
	>[];

	for (const check of schema._def.checks) {
		if (!format_checks.includes(check.kind)) continue;
		if (format_kind !== check.kind && format_kind) {
			throw new InvalidSchemaException(
				"Multiple incompatible format constraints - The Schema cannot be satisfied"
			);
		} else format_kind = check.kind;
		checks.push(check);
	}

	if (!format_kind) {
		const format: StringFormat = {
			kind: "any"
		};

		return { format, starts_with, ends_with, includes };
	}

	const format_factory = checks_to_formats[format_kind];
	const format: StringFormat = format_factory
		? format_factory(checks as any)
		: { kind: "any" };
	return { format, starts_with, ends_with, includes };
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

export const StringGenerator: InstanceofGeneratorDefinition<z.ZodString> = {
	schema: z.ZodString as any,
	generator: generate_string,
	match: "instanceof"
};
