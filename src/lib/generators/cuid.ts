import { InstanceofGeneratorDefinition } from "lib/zocker.js";
import { Generator, generate } from "../generate.js";
import * as z from "@zod/core";
import { getLengthConstraints } from "./string/length-constraints.js";
import { InvalidSchemaException } from "../exceptions.js";
import { getContentConstraints } from "./string/content-constraints.js";
import { faker } from "@faker-js/faker";

const CUID_MIN_LENGTH = 9;
const CUID_COMMON_LENGHT = 25; // Most CUIDs are around 25 characters long


/**
 * Generates a valid CUID. The CUID format is as follows:
 * 1. The char 'c'
 * 2. 8 or more characters [a-zA-Z0-9]. Technically more are allowed, just not - or whitespace.
 * 
 * @param schema A CUID Schema
 * @param generation_context The relevant generation context
 * @returns A CUID that conforms to the given schema
 * @throws InvalidSchemaException if the Schema cannot be satisfied
 */
const generate_cuid: Generator<z.$ZodCUID> = (
    schema,
    generation_context
) => {
    const length_constraints = getLengthConstraints(schema);
    const content_constraints = getContentConstraints(schema);

    // Validate that the length constraints can be satisfied for a CUID
    const exact_length_too_short = length_constraints.exact != null && length_constraints.exact < CUID_MIN_LENGTH;
    const max_length_too_short = length_constraints.max < CUID_MIN_LENGTH;
    if (exact_length_too_short || max_length_too_short) {
        throw new InvalidSchemaException("CUID cannot be less than 9 characters long");
    }

    // validate that the content constraints can be verified
    if (content_constraints.starts_with != "" && !content_constraints.starts_with.startsWith("c")) {
        // Note: Zod also allows uppercase 'C' as the first character, but according to the CUID spec that isn't allowed
        throw new InvalidSchemaException("CUID must start with a 'c'");
    }

    const length = length_constraints.exact ?? faker.datatype.number({
        min: Math.max(length_constraints.min, CUID_MIN_LENGTH),
        max: length_constraints.max == Infinity ? length_constraints.min + CUID_COMMON_LENGHT : length_constraints.max
    });

    return generateCUIDofLength(length);
};

export const CUIDGenerator: InstanceofGeneratorDefinition<
    z.$ZodCUID
> = {
    schema: z.$ZodCUID as any,
    generator: generate_cuid,
    match: "instanceof"
};

/**
 * Generates a CUID of the given length
 * @param len The length of the CUID. Must be at least 9
 * @returns A CUID of the given length
 * @throws 
 */
function generateCUIDofLength(len: number) { 
    if(len < CUID_MIN_LENGTH) throw new TypeError("CUID must be at least 9 characters long");
    
    let cuid = "c" + faker.random.alphaNumeric( len - 1);
    return cuid;
}