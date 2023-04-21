import { Generator } from "../generate.js";
import { z } from "zod";
import { faker } from "@faker-js/faker";

export const generate_symbol: Generator<z.ZodSymbol> = () => {
	const symbol_key = faker.datatype.string();
	return Symbol.for(symbol_key);
};
