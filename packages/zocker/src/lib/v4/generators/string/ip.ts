import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { getLengthConstraints } from "./length-constraints.js";
import { getContentConstraints } from "./content-constraints.js";
import { faker } from "@faker-js/faker";

// Zod checks IPv4 via new URL("http://<ipv4-address>") constructor
const IPV4_REGEX =
	/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const IPV4_MIN_LENGTH = 7; // 1.1.1.1
const IPV4_MAX_LENGTH = 15; // 255.255.255.255
const IPV4_NUM_DOTS = 3;

// Zod checks IPv6 via new URL("http://[<ipv6-address>]") constructor
// IPv6 has the :: syntax to denote one or more groups of 0s
// This makes generation more complex
const IPV6_MIN_LENGTH = 3; // ::1
const IPV6_MAX_LENGTH = 39; // 1111:2222:3333:4444:5555:6666:7777:8888
const IPV6_MIN_LENGTH_WITHOUT_DOUBLE_COLON = 15; // 0:0:0:0:0:0:0:0
const IPV6_MAX_LENGTH_WITH_DOUBLE_COLON = 36; // ::1111:2222:3333:4444:5555:6666:7777

const ipv4_generator: Generator<z.$ZodIPv4> = (schema, ctx) => {
	const length_constraints = getLengthConstraints(schema);
	const content_constraints = getContentConstraints(schema);

	// Verify that the length constraints can be satisfied
	const min_length_too_long = length_constraints.min > IPV4_MAX_LENGTH;
	const max_length_too_short = length_constraints.max < IPV4_MIN_LENGTH;
	const exact_length_too_long =
		length_constraints.exact != null &&
		length_constraints.exact > IPV4_MAX_LENGTH;
	const exact_length_too_short =
		length_constraints.exact != null &&
		length_constraints.exact < IPV4_MIN_LENGTH;

	if (
		min_length_too_long ||
		max_length_too_short ||
		exact_length_too_long ||
		exact_length_too_short
	) {
		throw new Error("Invalid length constraints for IPv4");
	}

	const length =
		length_constraints.exact ??
		faker.number.int({
			min: Math.max(length_constraints.min, IPV4_MIN_LENGTH),
			max: Math.min(length_constraints.max, IPV4_MAX_LENGTH)
		});

	// TODO: Support content_constraints

	// How many characters are numbers in the final IP?
	return generateIPv4OfLength(length);
};

const ipv6_generator: Generator<z.$ZodIPv6> = (schema, ctx) => {
	const length_constraints = getLengthConstraints(schema);
	const content_constraints = getContentConstraints(schema);

	// Verify that the length constraints can be satisfied
	const min_length_too_long = length_constraints.min > IPV6_MAX_LENGTH;
	const max_length_too_short = length_constraints.max < IPV6_MIN_LENGTH;
	const exact_length_too_long =
		length_constraints.exact != null &&
		length_constraints.exact > IPV6_MAX_LENGTH;
	const exact_length_too_short =
		length_constraints.exact != null &&
		length_constraints.exact < IPV6_MIN_LENGTH;

	if (
		min_length_too_long ||
		max_length_too_short ||
		exact_length_too_long ||
		exact_length_too_short
	) {
		throw new Error("Invalid length constraints for IPv6");
	}

	const length =
		length_constraints.exact ??
		faker.number.int({
			min: Math.max(length_constraints.min, IPV6_MIN_LENGTH),
			max: Math.min(length_constraints.max, IPV6_MAX_LENGTH)
		});

	return generateIPv6OfLength(length);
};

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
 * Generates an IPv4 Address of the given length. The length must be such that
 * an IPv4 address can be made.
 *
 * @param length
 */
export function generateIPv4OfLength(length: number) {
	const num_numbers_in_ip = length - IPV4_NUM_DOTS;
	const segment_lengths = partition(num_numbers_in_ip, 4, 1, 3);

	const segments = segment_lengths.map((length) => generateIPv4Segment(length));
	return segments.join(".");
}

/**
 * Generates an IPv6 Address of the given length. The length must be such that
 * an IPv6 address can be made.
 *
 * @param length
 */
export function generateIPv6OfLength(length: number) {
	// How many segments the IPv6 address should have
	// If this is less than 8, we're using the double colon syntax
	const should_use_double_colon = ipv6ShouldUseDoubleColon(length);
	const num_segments = choseNumberOfIPv6Segments(
		length,
		should_use_double_colon
	);

	if (!should_use_double_colon) {
		const lengthWithoutColons = length - 7;
		const segment_lengths = partition(lengthWithoutColons, num_segments, 1, 4);
		const segments = segment_lengths.map((length) =>
			generateIPv6Segment(length)
		);
		return segments.join(":");
	}

	// With double colon
	const lengthWithoutColons = length - (num_segments - 1) - 2; // -2 for double colon at the start
	const segment_lengths = partition(lengthWithoutColons, num_segments, 1, 4);
	const segments = segment_lengths.map((length) => generateIPv6Segment(length));

	// TODO: Support the :: in positions other than the first

	return "::" + segments.join(":");
}

/**
 * Generates an IPv4 segment (0-255) of the given length
 * @param length How many characters the segment should be. Between 1 and 3
 * @returns An IPv4 segment
 * @throws TypeError if the length is invalid
 */
function generateIPv4Segment(length: number) {
	if (length < 1 || length > 3 || !Number.isInteger(length))
		throw new TypeError(
			"IPv4 segments must be between 1 and 3 characters long"
		);

	switch (length) {
		case 1:
			return faker.number.int({ min: 0, max: 9 }).toString();
		case 2:
			return faker.number.int({ min: 10, max: 99 }).toString();
		case 3:
		default:
			return faker.number.int({ min: 100, max: 255 }).toString();
	}
}

/**
 * Generates a random IPv6 segment (0-ffff) of the given length
 * @param length How many characters the segment should be. Between 1 and 4
 * @returns An IPv6 segment
 * @throws TypeError if the length is invalid
 */
function generateIPv6Segment(length: number) {
	if (length < 1 || length > 4 || !Number.isInteger(length))
		throw new TypeError(
			"IPv6 segments must be between 1 and 4 characters long"
		);

	return faker.string.hexadecimal({ length, prefix: "", casing: "lower" });
}

/**
 * Returns true/false if the IPv6 of the given length should use double colons
 * - If it's forced it will always use double colons
 * - If it can't use the double colon, it will not
 * - Otherwise, random
 *
 * @param length The length of the IPv6 address.
 */
function ipv6ShouldUseDoubleColon(length: number): boolean {
	if (
		length < IPV6_MIN_LENGTH ||
		length > IPV6_MAX_LENGTH ||
		!Number.isInteger(length)
	)
		throw new TypeError(
			`Pv6 addresses must be between ${IPV6_MIN_LENGTH} and ${IPV6_MAX_LENGTH} characters long, ${length} given`
		);

	if (length < IPV6_MIN_LENGTH_WITHOUT_DOUBLE_COLON) return true;
	if (length > IPV6_MAX_LENGTH_WITH_DOUBLE_COLON) return false;
	return faker.datatype.boolean();
}

/**
 * Determine the number of segments in the generated IPv6 address.
 * If the target length is really short, we might only be able to have 1 segment
 * If the target length is really long, we might be forced to have all 8 segments
 *
 * @param length
 */
function choseNumberOfIPv6Segments(
	length: number,
	shouldUseDoubleColon: boolean
): number {
	if (shouldUseDoubleColon == false) return 8;

	// The maximum number of segments we have space for with the remaining characters
	let max_segments = Math.min(Math.floor((length - 1) / 2), 7);

	// the minimum number of segments we have space for with the remaining characterss
	const min_segments = Math.max(Math.ceil((length - 1) / 5), 1);

	return faker.number.int({ min: min_segments, max: max_segments });
}

/**
 * Partitions a total number into a specified number of partitions,
 * ensuring each partition has a value between min_partition_size and max_partition_size
 *
 * @param total The total number to partition.
 * @param num_partitions The number of partitions to create.
 *
 * @param min_partition_size The minimum size of a partition.
 * @param max_partition_size The maximum size of a partition.
 * @returns An array of partition sizes.
 * @throws Error if it's not possible to partition the total into the given constraints.
 */
function partition(
	total: number,
	num_partitions: number,
	min_partition_size: number,
	max_partition_size: number
): number[] {
	if (
		total < num_partitions * min_partition_size ||
		total > num_partitions * max_partition_size
	) {
		throw new Error(
			`Cannot partition ${total} into ${num_partitions} Partitions, where each partition must be between ${min_partition_size} and ${max_partition_size}.`
		);
	}

	let remaining = total;
	const partitions = Array(num_partitions).fill(min_partition_size); // Start with the minimum value for each partition
	remaining -= num_partitions * min_partition_size; // Subtract the minimum values from the total

	// while remaining > 0, pich a random partition to increase
	while (remaining > 0) {
		const partition_index = faker.number.int({
			min: 0,
			max: num_partitions - 1
		});
		if (partitions[partition_index] >= max_partition_size) continue;

		partitions[partition_index]++;
		remaining--;
	}

	return partitions;
}
