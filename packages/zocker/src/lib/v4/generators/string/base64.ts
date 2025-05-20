import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";

const base64_generator: Generator<z.$ZodBase64> = (schema, ctx) => {
	return generateBase64String();
};

const base64url_generator: Generator<z.$ZodBase64URL> = (schema, ctx) => {
	const data = generateBase64String();
	const encodedData = data
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replaceAll("=", "");
	return encodedData;
};

export const Base64Generator: InstanceofGeneratorDefinition<z.$ZodBase64> = {
	match: "instanceof",
	schema: z.$ZodBase64 as any,
	generator: base64_generator
};

export const Base64URLGenerator: InstanceofGeneratorDefinition<z.$ZodBase64URL> =
	{
		match: "instanceof",
		schema: z.$ZodBase64URL as any,
		generator: base64url_generator
	};

function generateBase64String(): string {
	const bytes = faker.number.int({ min: 0, max: 100000 });
	let data = "";
	for (let i = 0; i < bytes; i++) {
		data += String.fromCharCode(faker.number.int({ min: 0, max: 255 }));
	}
	return btoa(data);
}
