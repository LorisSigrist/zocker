import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import { getLengthConstraints } from "./length-constraints.js";
import { getContentConstraints } from "./content-constraints.js";
import RandExp from "randexp";

const URL_MIN_LENGTH = 2; // Must have at least a protocol. Eg: "a:"

const url_generator: Generator<z.$ZodURL> = (schema, ctx) => {
    const hostnameRegex = schema._zod.def.hostname;
    const protocolRegex  = schema._zod.def.protocol;

    const length_constraints = getLengthConstraints(schema);
    const content_constraints = getContentConstraints(schema);

    const generated_url = new URL(faker.internet.url());
    if (hostnameRegex !== undefined) {
        const generated_hostname = generateStringForRegex(hostnameRegex);
        generated_url.hostname = generated_hostname;
         console.log(generated_url, hostnameRegex, generated_hostname);
    }
    if (protocolRegex !== undefined) generated_url.protocol = generateStringForRegex(protocolRegex);

    return generated_url.href;
};

export const URLGenerator: InstanceofGeneratorDefinition<z.$ZodURL> = {
    match: "instanceof",
    schema: z.$ZodURL as any,
    generator: url_generator
}



function generateStringForRegex(regex: RegExp): string {
    const randexp = new RandExp(regex);
    randexp.randInt = (min: number, max: number ) =>
        faker.datatype.number({ min, max, precision: 1 });
    return randexp.gen();
}
