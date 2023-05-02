import { Generator } from "../generate.js";
import { z } from "zod";
import { faker } from "@faker-js/faker";
import { GeneratorDefinitionFactory } from "lib/zocker.js";

export const SymbolGenerator: GeneratorDefinitionFactory<z.ZodSymbol> = (
	options = {}
) => {
	return {
		schema: options.schema ?? (z.ZodSymbol as any),
		generator: generate_symbol,
		match: options.match ?? "instanceof"
	};
};

const generate_symbol: Generator<z.ZodSymbol> = () => {
	const symbol_key = faker.datatype.string();
	return Symbol.for(symbol_key);
};
