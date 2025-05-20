import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "../utils";

//This is a real schema from a real project

const string_id = z
	.number({ coerce: true })
	.int()
	.positive()
	.transform((x) => x.toString());
const yyyy_mm_dd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const hh_mm = z.string().regex(/^\d{2}:\d{2}$/);

const IndicatorValueSchema = z.object({
	indicator_id: string_id,
	value: z.number({ coerce: true })
});

type IndicatorValue = z.infer<typeof IndicatorValueSchema>;

const TimerecordCreateData = z.object({
	location_id: string_id,
	action_field_id: string_id,

	day: yyyy_mm_dd,
	annotation: z.string().max(1000).nullable().default(null),

	indicator_values: z
		.array(IndicatorValueSchema)
		.default([])
		.transform(filter_duplicate_ids),

	hours: z.number({ coerce: true }).max(24).positive(),
	start_time: hh_mm.nullable().default(null),
	end_time: hh_mm.nullable().default(null)
});

function filter_duplicate_ids(array: IndicatorValue[]): IndicatorValue[] {
	const seen = new Set();
	return array.filter((x) => {
		const id = x.indicator_id;
		if (seen.has(id)) return false;
		seen.add(id);
		return true;
	});
}

const schemas = {
	TimerecordCreateData: TimerecordCreateData,
	IndicatorValueSchema: IndicatorValueSchema
};

describe("Realworld TimerecordCreateData Schema", () => {
	test_schema_generation(schemas, 10);
});
