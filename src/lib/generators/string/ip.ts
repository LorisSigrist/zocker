import * as z from "@zod/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { getLengthConstraints } from "./length-constraints.js";
import { getContentConstraints } from "./content-constraints.js";
import { faker } from "@faker-js/faker";

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const IPV4_MIN_LENGTH = 7; // 1.1.1.1
const IPV4_MAX_LENGTH = 15; // 255.255.255.255
const IPV4_NUM_DOTS = 3;

const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

const ipv4_generator: Generator<z.$ZodIPv4> = (schema, ctx) => {
    const length_constraints = getLengthConstraints(schema);
    const content_constraints = getContentConstraints(schema);

    // Verify that the length constraints can be satisfied
    const min_length_too_long = length_constraints.min > IPV4_MAX_LENGTH;
    const max_length_too_short = length_constraints.max < IPV4_MIN_LENGTH;
    const exact_length_too_long = length_constraints.exact != null && length_constraints.exact > IPV4_MAX_LENGTH;
    const exact_length_too_short = length_constraints.exact != null && length_constraints.exact < IPV4_MIN_LENGTH;

    if (
        min_length_too_long ||
        max_length_too_short ||
        exact_length_too_long ||
        exact_length_too_short
    ) {
        throw new Error("Invalid length constraints for IPv4");
    }

    const length = length_constraints.exact ?? faker.datatype.number({
        min: Math.max(length_constraints.min, IPV4_MIN_LENGTH),
        max: Math.min(length_constraints.max, IPV4_MAX_LENGTH)
    });

    // How many characters are numbers in the final IP?
    const num_numbers_in_ip = length - IPV4_NUM_DOTS; 
    const segment_lengths = partition(num_numbers_in_ip, 4);   

    const segments = segment_lengths.map(length => generateIPv4Segment(length));
    return segments.join(".");

}
const ipv6_generator: Generator<z.$ZodIPv6> = (schema, ctx) => {
    const length_constraints = getLengthConstraints(schema);
    const content_constraints = getContentConstraints(schema);

    return "";
}

export const IPv4Generator: InstanceofGeneratorDefinition<z.$ZodIPv4> = {
    schema: z.$ZodIPv4 as any,
    generator: ipv4_generator,
    match: "instanceof"
};

export const IPv6Generator: InstanceofGeneratorDefinition<z.$ZodIPv6> = {
    schema: z.$ZodIPv6 as any,
    generator: ipv6_generator,
    match: "instanceof"
};

/**
 * Generates an IPv4 segment (0-255) of the given length
 * @param length How many characters the segment should be. Between 1 and 3
 * @returns An IPv4 segment
 * @throws TypeError if the length is invalid
 */
function generateIPv4Segment(length: number) {
    if (length < 1 || length > 3 || !Number.isInteger(length)) throw new TypeError("IPv4 segments must be between 1 and 3 characters long");

    switch (length) { 
        case 1: return faker.datatype.number({ min: 0, max: 9 }).toString();
        case 2: return faker.datatype.number({ min: 10, max: 99 }).toString();
        case 3: default: return faker.datatype.number({ min: 100, max: 255 }).toString();
    }
}

/**
 * Partitions a total number into a specified number of partitions,
 * ensuring each partition is between 1 and 3.
 * 
 * @param total The total number to partition.
 * @param num_partitions The number of partitions to create.
 * @returns An array of partition sizes.
 * @throws Error if it's not possible to partition the total into the given constraints.
 */
function partition(total: number, num_partitions: number): number[] {
    const MAX_PARTITION_SIZE = 3;

    if (total < num_partitions || total > num_partitions * MAX_PARTITION_SIZE) {
        throw new Error("Cannot partition the total into the given constraints.");
    }

    let remaining = total;
    const partitions = Array(num_partitions).fill(1); // Start with the minimum value for each partition
    remaining -= num_partitions; // Subtract the minimum values from the total

    // while remaining > 0, pich a random partition to increase
    while (remaining > 0) {
        const partition_index = faker.datatype.number({ min: 0, max: num_partitions - 1 });
        if (partitions[partition_index] >= MAX_PARTITION_SIZE) continue;
        
        partitions[partition_index]++;
        remaining--;
    }

    return partitions;
}