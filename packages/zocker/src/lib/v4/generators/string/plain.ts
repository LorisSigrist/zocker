import * as z from "zod/v4/core";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { GenerationContext, Generator } from "../../generate.js";
import { faker } from "@faker-js/faker";
import { NoGeneratorException } from "../../exceptions.js";
import {
	type ContentConstraints,
	getContentConstraints
} from "./content-constraints.js";
import {
	type LengthConstraints,
	getLengthConstraints
} from "./length-constraints.js";
import Randexp from "randexp";
import { pick } from "../../utils/random.js";
import { SemanticFlag } from "../../semantics.js";
import z4 from "zod/v4";
import { legacyFormatString } from "./legacy.js";

const generate_string: Generator<z.$ZodString> = (string_schema, ctx) => {
	const legacy = legacyFormatString(string_schema, ctx);
	if (legacy !== null) return legacy;

	const lengthConstraints = getLengthConstraints(string_schema);
	const contentConstraints = getContentConstraints(string_schema);
	const regexConstraints = getRegexConstraints(string_schema);

	if (regexConstraints.length > 0) {
		if (regexConstraints.length > 1)
			throw new NoGeneratorException(
				"Zocker's included regex generator currently does support multiple regex checks on the same string. Provide a custom generator instead."
			);

		if (lengthConstraints.exact !== null)
			throw new NoGeneratorException(
				"Zocker's included regex generator currently does not work together with length constraints (minLength, maxLength, length). Provide a custom generator instead."
			);

		if (
			contentConstraints.starts_with != "" ||
			contentConstraints.ends_with != "" ||
			contentConstraints.includes.length > 0
		)
			throw new NoGeneratorException(
				"Zocker's included regex generator currently does not work together with startWith, endsWith or includes constraints. Provide a custom generator instead."
			);

		const regex = regexConstraints[0]!;

		const randexp = new Randexp(regex);
		randexp.randInt = (min: number, max: number) =>
			faker.number.int({ min, max });
		return randexp.gen();
	}

	// If there is no other format, try generating a human readable string
	// If this fails the constraints, generate a random stirng that passes

	try {
		const human_readable_string = generateStringWithoutFormat(
			ctx,
			lengthConstraints,
			contentConstraints
		);
		if (
			stringMatchesConstraints(
				human_readable_string,
				lengthConstraints,
				contentConstraints
			)
		) {
			return human_readable_string;
		}
	} catch (e) {
		// Human Readable string generation failed. Falling back to random string
	}

	// update the min-length
	lengthConstraints.min = Math.max(
		lengthConstraints.min,
		contentConstraints.starts_with.length,
		contentConstraints.ends_with.length,
		...contentConstraints.includes.map((s) => s.length)
	);

	// The string length to generate
	const length =
		lengthConstraints.exact ??
		faker.number.int({
			min: lengthConstraints.min,
			max:
				lengthConstraints.max == Infinity
					? lengthConstraints.min + 50_000
					: lengthConstraints.max
		});

	// How many characters need to be generated.
	// This is fewer than the length if there are startWith/endsWith constraints
	const generated_length =
		length -
		contentConstraints.starts_with.length -
		contentConstraints.ends_with.length -
		contentConstraints.includes.reduce((a, b) => a + b.length, 0);

	return (
		contentConstraints.starts_with +
		faker.string.sample(generated_length) +
		contentConstraints.includes.join("") +
		contentConstraints.ends_with
	);
};

export const StringGenerator: InstanceofGeneratorDefinition<z.$ZodString> = {
	schema: z.$ZodString as any,
	generator: generate_string,
	match: "instanceof"
};

/**
 * Takes in a ZodType & Returns a list of 0 or more regexes it has to fulfill.
 *
 * @example `z.string().regex(/abc/) -> [/abc/]`
 * @param schema
 */
function getRegexConstraints(schema: z.$ZodType): RegExp[] {
	const regex_checks =
		schema._zod.def.checks?.filter((c) => c instanceof z.$ZodCheckRegex) ?? [];
	return regex_checks.map((check) => check._zod.def.pattern);
}

function generateStringWithoutFormat(
	ctx: GenerationContext<z.$ZodString>,
	lc: LengthConstraints,
	cc: ContentConstraints
) {
	const semantic_generators: {
		[flag in SemanticFlag]?: () => string;
	} = {
		fullname: faker.person.fullName,
		firstname: faker.person.firstName,
		lastname: faker.person.lastName,
		street: faker.location.street,
		city: faker.location.city,
		country: faker.location.country,
		zip: faker.location.zipCode,
		phoneNumber: faker.phone.number,
		paragraph: faker.lorem.paragraph,
		sentence: faker.lorem.sentence,
		word: faker.lorem.word,
		jobtitle: faker.person.jobTitle,
		color: color,
		gender: faker.person.gender,
		municipality: faker.location.city,
		"color-hex": () => faker.color.rgb({ prefix: "#", casing: "lower" }),
		weekday: faker.date.weekday,
		"unique-id": faker.string.uuid,
		key: () => faker.lorem.word(),
		unspecified: () =>
			faker.lorem.paragraphs(faker.number.int({ min: 1, max: 5 }))
	};

	const generator = semantic_generators[ctx.semantic_context];
	if (!generator)
		throw new Error(
			"No semantic generator found for context - falling back to random string"
		);

	const proposed_string = generator();
	return proposed_string;
}

function color(): string {
	const generators = [faker.color.human, faker.internet.color];
	return pick(generators)();
}

function stringMatchesConstraints(
	str: string,
	lc: LengthConstraints,
	cc: ContentConstraints
): boolean {
	if (lc.exact && str.length !== lc.exact) return false;
	if (lc.min && str.length < lc.min) return false;
	if (lc.max && str.length > lc.max) return false;

	if (cc.starts_with && !str.startsWith(cc.starts_with)) return false;
	if (cc.ends_with && !str.endsWith(cc.ends_with)) return false;
	if (cc.includes.length > 0 && !cc.includes.every((i) => str.includes(i)))
		return false;

	return true;
}
