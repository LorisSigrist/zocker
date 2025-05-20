import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import { getLengthConstraints } from "./length-constraints.js";
import { InvalidSchemaException } from "../../exceptions.js";
import { generateIPv4OfLength, generateIPv6OfLength } from "./ip.js";

const CIDR_V4_MIN_LENGTH = 9; // 1.1.1.1/0
const CIDR_V4_MAX_LENGTH = 18; // 255.255.255.255/32

const CIDR_V6_MIN_LENGTH = 5; // ::1/0
const CIDR_V6_MAX_LENGTH = 43; // 1111:2222:3333:4444:5555:6666:7777:8888/128

const cidrv4_generator: Generator<z.$ZodCIDRv4> = (schema, ctx) => {
	const length_constraints = getLengthConstraints(schema);

	const max_length_too_short = length_constraints.max < CIDR_V4_MIN_LENGTH;
	const min_length_too_long = length_constraints.min > CIDR_V4_MAX_LENGTH;
	const exact_length_too_short =
		length_constraints.exact && length_constraints.exact < CIDR_V4_MIN_LENGTH;
	const exact_length_too_long =
		length_constraints.exact && length_constraints.exact > CIDR_V4_MAX_LENGTH;

	if (
		max_length_too_short ||
		exact_length_too_short ||
		min_length_too_long ||
		exact_length_too_long
	) {
		throw new InvalidSchemaException(
			`CIDRv4 must be between ${CIDR_V4_MIN_LENGTH} and ${CIDR_V4_MAX_LENGTH} characters long`
		);
	}

	const length =
		length_constraints.exact ??
		faker.number.int({
			min: Math.max(length_constraints.min, CIDR_V4_MIN_LENGTH),
			max: Math.min(length_constraints.max, CIDR_V4_MAX_LENGTH)
		});

	// Chose a mask length
	// If the length is so short that the result MUST have a single digit mask. Eg /1
	const must_have_single_digit_mask = length == CIDR_V4_MIN_LENGTH;
	const must_have_double_digit_mask = length == CIDR_V4_MAX_LENGTH;

	let mask_length: 1 | 2;
	if (must_have_single_digit_mask) mask_length = 1;
	else if (must_have_double_digit_mask) mask_length = 2;
	else mask_length = faker.number.int({ min: 1, max: 2 }) as 1 | 2;

	const mask: number =
		mask_length == 1
			? faker.number.int({ min: 0, max: 9 })
			: faker.number.int({ min: 10, max: 32 });
	const ipv4_length = length - mask_length - 1;
	const ipv4_address = generateIPv4OfLength(ipv4_length);

	return `${ipv4_address}/${mask}`;
};

const cidrv6_generator: Generator<z.$ZodCIDRv6> = (schema, ctx) => {
	const length_constraints = getLengthConstraints(schema);

	const max_length_too_short = length_constraints.max < CIDR_V6_MIN_LENGTH;
	const min_length_too_long = length_constraints.min > CIDR_V6_MAX_LENGTH;
	const exact_length_too_short =
		length_constraints.exact && length_constraints.exact < CIDR_V6_MIN_LENGTH;
	const exact_length_too_long =
		length_constraints.exact && length_constraints.exact > CIDR_V6_MAX_LENGTH;

	if (
		max_length_too_short ||
		exact_length_too_short ||
		min_length_too_long ||
		exact_length_too_long
	) {
		throw new InvalidSchemaException(
			`CIDRv6 must be between ${CIDR_V6_MIN_LENGTH} and ${CIDR_V6_MAX_LENGTH} characters long`
		);
	}

	const length =
		length_constraints.exact ??
		faker.number.int({
			min: Math.max(length_constraints.min, CIDR_V6_MIN_LENGTH),
			max: Math.min(length_constraints.max, CIDR_V6_MAX_LENGTH)
		});

	// Chose a mask length
	// If the length is so short that the result MUST have a single digit mask. Eg /1
	const must_have_single_digit_mask = length == CIDR_V6_MIN_LENGTH;
	const cannot_have_triple_digit_mask = length <= CIDR_V4_MIN_LENGTH + 1;
	const cannot_have_single_digit_mask = length >= CIDR_V4_MAX_LENGTH - 1;
	const must_have_triple_digit_mask = length == CIDR_V6_MAX_LENGTH;

	let mask_length: 1 | 2 | 3;
	if (must_have_single_digit_mask) mask_length = 1;
	else if (must_have_triple_digit_mask) mask_length = 3;
	else mask_length = faker.number.int({ min: 1, max: 3 }) as 1 | 2 | 3;
	if (mask_length == 3 && cannot_have_triple_digit_mask) mask_length = 2;
	if (mask_length == 1 && cannot_have_single_digit_mask) mask_length = 2;

	const mask: number =
		mask_length == 1
			? faker.number.int({ min: 0, max: 9 })
			: mask_length == 2
			? faker.number.int({ min: 10, max: 99 })
			: faker.number.int({ min: 100, max: 128 });

	const ipv6_length = length - mask_length - 1;
	const ipv6_address = generateIPv6OfLength(ipv6_length);

	return `${ipv6_address}/${mask}`;
};

export const CIDRv4Generator: InstanceofGeneratorDefinition<z.$ZodCIDRv4> = {
	match: "instanceof",
	schema: z.$ZodCIDRv4 as any,
	generator: cidrv4_generator
};

export const CIDRv6Generator: InstanceofGeneratorDefinition<z.$ZodCIDRv6> = {
	match: "instanceof",
	schema: z.$ZodCIDRv6 as any,
	generator: cidrv6_generator
};
