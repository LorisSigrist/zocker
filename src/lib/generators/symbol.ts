import { Generator } from "../generate.js";
import { z } from "zod";
import { faker } from "@faker-js/faker";
import { InstanceofGeneratorDefinition } from "lib/zocker.js";

const generate_symbol: Generator<z.ZodSymbol> = () => {
	const symbol_key = faker.datatype.string();
	return Symbol.for(symbol_key);
};

export const SymbolGenerator: InstanceofGeneratorDefinition<z.ZodSymbol> = {
	schema: z.ZodSymbol as any,
	generator: generate_symbol,
	match: "instanceof"
};
