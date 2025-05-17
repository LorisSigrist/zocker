import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import { getLengthConstraints } from "./length-constraints.js";
import { getContentConstraints } from "./content-constraints.js";

const generate_emoji: Generator<z.$ZodEmoji> = (schema, ctx) => {
    
  const lengthConstraints = getLengthConstraints(schema);
  const content_constraints = getContentConstraints(schema);

  const length = lengthConstraints.exact ?? faker.datatype.number({
    min: lengthConstraints.min,
    max: lengthConstraints.max == Infinity ? lengthConstraints.min + 50_000 : lengthConstraints.max
  });

	let emojis = "";
	for (let i = 0; i < length; i++) {
		emojis += faker.internet.emoji();
	}
	return emojis;
}

export const EmojiGenerator: InstanceofGeneratorDefinition<z.$ZodEmoji> = {
  match: "instanceof",
  generator: generate_emoji,
  schema: z.$ZodEmoji as any
}
