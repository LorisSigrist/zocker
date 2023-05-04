import {
	ContentConstraints,
	LengthConstraints,
	StringKindGenerator
} from "./index.js";
import { faker } from "@faker-js/faker";
import { InvalidSchemaException } from "../../exceptions.js";
import Randexp from "randexp";
import { pick, weighted_random_boolean } from "../../utils/random.js";
import { SemanticFlag } from "lib/semantics.js";

export const uuid: StringKindGenerator = (ctx, lc, cc, td) => {
	if (lc.exact && lc.exact !== 36)
		throw new InvalidSchemaException(
			"uuid length must be exactly 36 if specified"
		);
	if (lc.min && lc.min > 36)
		throw new InvalidSchemaException("uuid length must be 36");
	if (lc.max && lc.max < 36)
		throw new InvalidSchemaException("uuid length must be 36");

	return faker.datatype.uuid();
};

export const cuid: StringKindGenerator = (ctx, lc, cc, td) => {
	if ((lc.max && lc.max < 8) || (lc.exact && lc.exact < 8))
		throw new InvalidSchemaException("cuid length must be at least 8");

	let min = lc.min && lc.min >= 9 ? lc.min : 9;
	let max = lc.max ? lc.max : 25;

	//const regex = new RegExp(`^c[^\s-]{${min - 1},${max - 1}}$`, "i");
	const regex = /^c[^\s-]{8,}$/i;
	return generate_regex(regex);
};

export const cuid2: StringKindGenerator = (ctx, lc, cc, td) => {
	if ((lc.exact && lc.exact < 1) || (lc.max && lc.max < 1))
		throw new InvalidSchemaException("cuid2 length must be at least 1");

	let min = lc.min && lc.min >= 1 ? lc.min : 1;
	let max = lc.max ? lc.max : 25;

	const regex = new RegExp(`^[a-z][a-z0-9]{${min - 1},${max - 1}}$`);
	return generate_regex(regex);
};

export const ulid: StringKindGenerator = (ctx, lc, cc, td) => {
	if (lc.exact && lc.exact !== 26)
		throw new InvalidSchemaException(
			"ulid length must be exactly 26 if specified"
		);
	if (lc.min && lc.min > 26)
		throw new InvalidSchemaException("ulid length must be 26");
	if (lc.max && lc.max < 26)
		throw new InvalidSchemaException("ulid length must be 26");

	const regex = /[0-9A-HJKMNP-TV-Z]{26}/;
	return generate_regex(regex);
};

export const ip: StringKindGenerator = (ctx, lc, cc, td) => {
	const format = cc.format as Extract<typeof cc.format, { kind: "ip" }>;
	const version = format.version ?? null;

	if (version === "v4") return faker.internet.ipv4();
	if (version === "v6") return faker.internet.ipv6();

	return weighted_random_boolean(0.5)
		? faker.internet.ipv4()
		: faker.internet.ipv6();
};

export const datetime: StringKindGenerator = (ctx, lc, cc, td) => {
	const format = cc.format as Extract<typeof cc.format, { kind: "datetime" }>;
	const offset = format.offset === true;

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
};

export const email: StringKindGenerator = (ctx, lc, cc, td) => {
	return faker.internet.email();
};

export const url: StringKindGenerator = (ctx, lc, cc, td) => {
	return faker.internet.url();
};

export const emoji: StringKindGenerator = (ctx, lc, cc, td) => {
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
};

export const regex: StringKindGenerator = (ctx, lc, cc, td) => {
	const format = cc.format as Extract<typeof cc.format, { kind: "regex" }>;
	const regex = new RegExp(format.regex);
	return generate_regex(regex);
};

export const any: StringKindGenerator = (ctx, lc, cc, td) => {
	try {
		const semantic_generators: {
			[flag in SemanticFlag]?: () => string;
		} = {
			fullname: faker.name.fullName,
			firstname: faker.name.firstName,
			lastname: faker.name.lastName,
			street: faker.address.street,
			city: faker.address.city,
			country: faker.address.country,
			zip: faker.address.zipCode,
			phoneNumber: faker.phone.number,
			paragraph: faker.lorem.paragraph,
			sentence: faker.lorem.sentence,
			word: faker.lorem.word,
			jobtitle: faker.name.jobTitle,
			color: color,
			"color-hex": faker.internet.color,
			weekday: faker.date.weekday,
			"unique-id": () => faker.helpers.unique(faker.datatype.uuid),
			key: () => faker.random.word(),
			unspecified: () =>
				faker.lorem.paragraphs(faker.datatype.number({ min: 1, max: 5 }))
		};
		const generator = semantic_generators[ctx.semantic_context];
		if (!generator)
			throw new Error(
				"No semantic generator found for context - falling back to random string"
			);

		const proposed_string = generator();
		if (!matches_constraints(proposed_string, lc, cc))
			throw new Error(
				"Invalid string generated, falling back to random string"
			);

		return proposed_string;
	} catch (e) {}

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
};

function color(): string {
	const generators = [faker.color.human, faker.internet.color];

	return pick(generators)();
}

function matches_constraints(
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

function generate_regex(regex: RegExp): string {
	const randexp = new Randexp(regex);
	randexp.randInt = (min, max) =>
		faker.datatype.number({ min, max, precision: 1 });
	return randexp.gen();
}
