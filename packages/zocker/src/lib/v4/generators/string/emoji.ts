import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import { getLengthConstraints } from "./length-constraints.js";
import { getContentConstraints } from "./content-constraints.js";

const generate_emoji: Generator<z.$ZodEmoji> = (schema, ctx) => {
	const lengthConstraints = getLengthConstraints(schema);
	const contentConstraints = getContentConstraints(schema);

	const length =
		lengthConstraints.exact ??
		faker.number.int({
			min: lengthConstraints.min,
			max:
				lengthConstraints.max == Infinity
					? lengthConstraints.min + 50_000
					: lengthConstraints.max
		});

	const generated_length =
		length -
		contentConstraints.starts_with.length -
		contentConstraints.ends_with.length;

	let emojis = contentConstraints.starts_with;
	for (let i = 0; i < length; i++) {
		emojis += faker.internet.emoji();
	}
	emojis += contentConstraints.ends_with;

	return emojis;
};

export const EmojiGenerator: InstanceofGeneratorDefinition<z.$ZodEmoji> = {
	match: "instanceof",
	generator: generate_emoji,
	schema: z.$ZodEmoji as any
};
