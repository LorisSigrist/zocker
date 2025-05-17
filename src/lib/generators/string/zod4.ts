
import * as z from "zod/v4/core";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { Generator } from "../../generate.js";
import { faker } from "@faker-js/faker";
import {  NoGeneratorException } from "../../exceptions.js";
import { getContentConstraints } from "./content-constraints.js";
import { getLengthConstraints } from "./length-constraints.js";
import Randexp from "randexp";

/**
 * Represents the constraints that apply to the _length_ of a string
 * 
 * @property min The minimum length of the string (0 if not specified)
 * @property max The maximum length of the string (Infinity if not specified)
 * @property exact The exact length of the string (if specified)
 */
export type LengthConstraints = {
    min: number;
    max: number;
    exact: number | null;
};

/**
 * Represents the constraints that apply to the _content_ of a string
 * 
 * @property starts_with The string that the string must start with. ("" if not specified)
 * @property ends_with The string that the string must end with. ("" if not specified)
 * @property includes An array of strings that the string must contain
 */
export type ContentConstraints = {
    starts_with: string;
    ends_with: string;
    includes: string[];
};

const generate_string: Generator<z.$ZodString> = (string_schema, ctx) => {

    const lengthConstraints = getLengthConstraints(string_schema);
    const contentConstraints = getContentConstraints(string_schema);
    const regexConstraints = getRegexConstraints(string_schema);

    if (regexConstraints.length > 0) {
        if (regexConstraints.length > 1) throw new NoGeneratorException(
            "Zocker's included regex generator currently does support multiple regex checks on the same string. Provide a custom generator instead."
        );

        if(lengthConstraints.exact !== null) throw new NoGeneratorException(
            "Zocker's included regex generator currently does not work together with length constraints (minLength, maxLength, length). Provide a custom generator instead."
        )

        if(contentConstraints.starts_with != "" || contentConstraints.ends_with != "" || contentConstraints.includes.length > 0) throw new NoGeneratorException(
            "Zocker's included regex generator currently does not work together with startWith, endsWith or includes constraints. Provide a custom generator instead."
        )

        const regex = regexConstraints[0]!;
        
        const randexp = new Randexp(regex);
        randexp.randInt = (min: number, max: number) =>
            faker.datatype.number({ min, max, precision: 1 });
        return randexp.gen();
    }

    // update the min-length
    lengthConstraints.min = Math.max(
        lengthConstraints.min,
        contentConstraints.starts_with.length,
        contentConstraints.ends_with.length,
        ...contentConstraints.includes.map(s => s.length)
    )

    // The string length to generate
    const length = lengthConstraints.exact ?? faker.datatype.number({
        min: lengthConstraints.min,
        max: lengthConstraints.max == Infinity ? lengthConstraints.min + 50_000 : lengthConstraints.max
    });

    // How many characters need to be generated.
    // This is fewer than the length if there are startWith/endsWith constraints
    const generated_length = length -
        contentConstraints.starts_with.length -
        contentConstraints.ends_with.length -
        contentConstraints.includes.reduce((a, b) => a + b.length, 0);


    return (
        contentConstraints.starts_with +
        faker.datatype.string(generated_length) +
        contentConstraints.includes.join("") +
        contentConstraints.ends_with
    );
}

export const StringGenerator: InstanceofGeneratorDefinition<z.$ZodString> = {
    schema: z.$ZodString as any,
    generator: generate_string,
    match: "instanceof"
};


/**
 * Takes in a ZodType & Returns a list of 0 or more regexes it has to fulfill.
 * 
 * @example `z.string().regex(/abc/) -> [/abc/]`
 * @param schema 
 */
function getRegexConstraints(schema: z.$ZodType): RegExp[] {
    const regex_checks = schema._zod.def.checks?.filter(c => c instanceof z.$ZodCheckRegex) ?? [];
    return regex_checks.map(check => check._zod.def.pattern);
}
