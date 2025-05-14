import { InstanceofGeneratorDefinition } from "lib/zocker.js";
import { Generator, generate } from "../generate.js";
import * as z from "@zod/core";
import { getLengthConstraints } from "./string/length-constraints.js";
import { InvalidSchemaException } from "lib/exceptions.js";
import { getContentConstraints } from "./string/content-constraints.js";

const CUID_REGEX = /^c[^\s-]{8,}$/i;
const CUID_MIN_LENGTH = 9;


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



    console.log(schema._zod.def);
    return "cjld2cyuq0000t3rmniod1foy";
};

export const CUIDGenerator: InstanceofGeneratorDefinition<
    z.$ZodCUID
> = {
    schema: z.$ZodCUID as any,
    generator: generate_cuid,
    match: "instanceof"
};

