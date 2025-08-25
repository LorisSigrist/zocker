import { Generator } from "../generate.js";
import { z } from "zod/v3";
import { faker } from "@faker-js/faker";
import { InstanceofGeneratorDefinition } from "../zocker.js";

const generate_symbol: Generator<z.ZodSymbol> = () => {
	const symbol_key = faker.string.sample();
	return Symbol.for(symbol_key);
};

export const SymbolGenerator: InstanceofGeneratorDefinition<z.ZodSymbol> = {
	schema: z.ZodSymbol as any,
	generator: generate_symbol,
	match: "instanceof"
};
