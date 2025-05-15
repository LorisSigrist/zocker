import * as z from "@zod/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import { getLengthConstraints } from "./length-constraints.js";
import { getContentConstraints } from "./content-constraints.js";

const URL_MIN_LENGTH = 2; // Must have at least a protocol. Eg: "a:"

const url_generator: Generator<z.$ZodURL> = (schema, ctx) => {
    const hostnameRegex = schema._zod.def.hostname as RegExp | undefined;
    const protocolRegex  = schema._zod.def.protocol as RegExp | undefined;

    const length_constraints = getLengthConstraints(schema);
    const content_constraints = getContentConstraints(schema);

    const generated_url = new URL(faker.internet.url());

    return generated_url.href;
};

export const URLGenerator: InstanceofGeneratorDefinition<z.$ZodURL> = {
    match: "instanceof",
    schema: z.$ZodURL as any,
    generator: url_generator
}