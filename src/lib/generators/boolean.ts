import { faker } from "@faker-js/faker";
import { Generator } from "../generate.js";
import { z } from "zod";

export const generate_boolean: Generator<z.ZodBoolean> = (
	schema,
	generation_context
) => {
	return faker.datatype.boolean();
};
