import { InvalidSchemaException } from "../../exceptions.js";
import * as z from "zod/v4/core";

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

/**
 * Returns the constraints on the _content_ of a string. These include:
 * - `starts_with`, `ends_with` and `includes`
 *
 * @param string_schema The string schema to get the Content Constarints for.
 * @returns The constaraints on the content of the string.
 */
export function getContentConstraints(
	string_schema: z.$ZodString
): ContentConstraints {
	const starts_with_checks =
		string_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckStartsWith
		) ?? [];
	const ends_with_checks =
		string_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckEndsWith
		) ?? [];
	const includes_checks =
		string_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckIncludes
		) ?? [];

	const starts_with = starts_with_checks.reduce((acc, check) => {
		const suggested_starts_with = check._zod.def.prefix;

		if (
			acc.length == suggested_starts_with.length &&
			acc != suggested_starts_with
		) {
			throw new InvalidSchemaException(
				"startsWith constraints are not compatible - The Schema cannot be satisfied"
			);
		}

		const longer =
			suggested_starts_with.length > acc.length ? suggested_starts_with : acc;
		const shorter =
			suggested_starts_with.length < acc.length ? suggested_starts_with : acc;

		if (!longer.startsWith(shorter)) {
			throw new InvalidSchemaException(
				"startsWith constraints are not compatible - The Schema cannot be satisfied"
			);
		}
		return longer;
	}, "");

	const ends_with = ends_with_checks.reduce((acc, check) => {
		const suggested_ends_with = check._zod.def.suffix;

		if (
			acc.length == suggested_ends_with.length &&
			acc != suggested_ends_with
		) {
			throw new InvalidSchemaException(
				"endsWith constraints are not compatible - The Schema cannot be satisfied"
			);
		}

		const longer =
			suggested_ends_with.length > acc.length ? suggested_ends_with : acc;
		const shorter =
			suggested_ends_with.length < acc.length ? suggested_ends_with : acc;

		if (!longer.endsWith(shorter))
			throw new InvalidSchemaException(
				"endsWith constraints are not compatible - The Schema cannot be satisfied"
			);
		return longer;
	}, "");

	const includes = includes_checks
		.map((c) => c._zod.def.includes)
		.filter((include) => !starts_with.includes(include)) // filter out trivial includes
		.filter((include) => !ends_with.includes(include)); // filter out trivial includes

	return {
		starts_with,
		ends_with,
		includes
	};
}
