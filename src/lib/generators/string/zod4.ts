
import * as z from "@zod/core";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { Generator } from "../../generate.js";
import { faker } from "@faker-js/faker";
import { InvalidSchemaException } from "../../exceptions.js";

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
 * Returns the constraints on the _content_ of a string.
 * 
 * @param string_schema 
 */
function getContentConstraints(string_schema: z.$ZodString): ContentConstraints {
    const starts_with_checks = string_schema._zod.def.checks?.filter(c => c instanceof z.$ZodCheckStartsWith) ?? [];
    const ends_with_checks = string_schema._zod.def.checks?.filter(c => c instanceof z.$ZodCheckEndsWith) ?? [];
    const includes_checks = string_schema._zod.def.checks?.filter(c => c instanceof z.$ZodCheckIncludes) ?? [];

    const starts_with = starts_with_checks.reduce((acc, check) => {
        const suggested_starts_with = check._zod.def.prefix;

        const longer = suggested_starts_with.length > acc.length ? suggested_starts_with : acc;
        const shorter = suggested_starts_with.length < acc.length ? suggested_starts_with : acc;

        if (!longer.startsWith(shorter)) throw new InvalidSchemaException("startsWith constraints are not compatible - The Schema cannot be satisfied");
        return longer;
    }, "");

    const ends_with = ends_with_checks.reduce((acc, check) => {
        const suggested_ends_with = check._zod.def.suffix;

        const longer = suggested_ends_with.length > acc.length ? suggested_ends_with : acc;
        const shorter = suggested_ends_with.length < acc.length ? suggested_ends_with : acc;

        if (!longer.endsWith(shorter)) throw new InvalidSchemaException("endsWith constraints are not compatible - The Schema cannot be satisfied");
        return longer;
    }, "");

    const includes = includes_checks.map(c => c._zod.def.includes)
        .filter(include => !starts_with.includes(include))  // filter out trivial includes
        .filter(include => !ends_with.includes(include));   // filter out trivial includes

    return {
        starts_with,
        ends_with,
        includes
    }
}



/**
 * Returns the length constraints that apply for a given schema. If multiple constraints
 * are specified (eg. multiple min-lengths), the most restrictive is applied
 * 
 * @param string_schema The schema to get length constraints for
 * @returns The length constraints
 */
function getLengthConstraints(string_schema: z.$ZodString): LengthConstraints {
    const min_length_checks = string_schema._zod.def.checks?.filter(c => c instanceof z.$ZodCheckMinLength) ?? [];
    const max_length_checks = string_schema._zod.def.checks?.filter(c => c instanceof z.$ZodCheckMaxLength) ?? [];
    const exact_length_checks = string_schema._zod.def.checks?.filter(c => c instanceof z.$ZodCheckLengthEquals) ?? [];

    const min_length = min_length_checks.reduce((acc, check) => {
        const value = check._zod.def.minimum;
        return value > acc ? value : acc;
    }, 0);

    const max_length = max_length_checks.reduce((acc, check) => {
        const value = check._zod.def.maximum;
        return value < acc ? value : acc;
    }, Infinity);

    // Make sure min & max don't conflict
    if (min_length > max_length) throw new InvalidSchemaException("min length is greater than max length");

    // if there are multiple 
    let exact_length = null;
    for (const exact_length_check of exact_length_checks) {
        const suggested_length = exact_length_check._zod.def.length;
        if (exact_length == null) exact_length = suggested_length;
        else if (suggested_length != exact_length) throw new InvalidSchemaException("Cannot generate a string with conflictung exact length constraints");
    }

    // If there is an exact length constraint, make sure it doesn't conflict with min/max length constraints
    if (exact_length !== null) {
        if (min_length > exact_length) throw new InvalidSchemaException("min length is greater than exact length");
        if (max_length < exact_length) throw new InvalidSchemaException("max length is less than exact length");
    }

    return {
        min: min_length,
        max: max_length,
        exact: exact_length
    }
}