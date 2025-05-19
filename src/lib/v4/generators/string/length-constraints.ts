import * as z from "zod/v4/core";
import { InvalidSchemaException } from "../../exceptions.js";

export type LengthConstraints = {
	/** The minimum number of characters the string should have. Defaults to zero */
	min: number;
	/** The maximum number of characters the string should have. Defaults to Infinity*/
	max: number;

	/** The exact number of characters the string should have, if specified. Defaults to null. */
	exact: number | null;
};

/**
 * Returns the length constraints that apply for a given schema. If multiple constraints
 * are specified (eg. multiple min-lengths), the most restrictive is applied
 *
 * @param string_schema The schema to get length constraints for
 * @returns The length constraints
 * @throws InvalidSchemaException if the length constraints are impossible to satisfy (eg: min > max)
 */
export function getLengthConstraints(
	string_schema: z.$ZodType
): LengthConstraints {
	const min_length_checks =
		string_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckMinLength
		) ?? [];
	const max_length_checks =
		string_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckMaxLength
		) ?? [];
	const exact_length_checks =
		string_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckLengthEquals
		) ?? [];

	const min_length = min_length_checks.reduce((acc, check) => {
		const value = check._zod.def.minimum;
		return value > acc ? value : acc;
	}, 0);

	const max_length = max_length_checks.reduce((acc, check) => {
		const value = check._zod.def.maximum;
		return value < acc ? value : acc;
	}, Infinity);

	// Make sure min & max don't conflict
	if (min_length > max_length)
		throw new InvalidSchemaException("min length is greater than max length");

	// if there are multiple
	let exact_length = null;
	for (const exact_length_check of exact_length_checks) {
		const suggested_length = exact_length_check._zod.def.length;
		if (exact_length == null) exact_length = suggested_length;
		else if (suggested_length != exact_length)
			throw new InvalidSchemaException(
				"Cannot generate a string with conflictung exact length constraints"
			);
	}

	// If there is an exact length constraint, make sure it doesn't conflict with min/max length constraints
	if (exact_length !== null) {
		if (min_length > exact_length)
			throw new InvalidSchemaException(
				"min length is greater than exact length"
			);
		if (max_length < exact_length)
			throw new InvalidSchemaException("max length is less than exact length");
	}

	return {
		min: min_length,
		max: max_length,
		exact: exact_length
	};
}
