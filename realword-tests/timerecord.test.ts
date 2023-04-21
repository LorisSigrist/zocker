import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../src";

const repeats = 10;

//This is a real schema from a real project

const string_id = z.number({ coerce: true }).int().positive().transform(x => x.toString())
const yyyy_mm_dd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const hh_mm = z.string().regex(/^\d{2}:\d{2}$/)

const IndicatorValueSchema = z.object({
    indicator_id: string_id,
    value: z.number({ coerce: true })
})

type IndicatorValue = z.infer<typeof IndicatorValueSchema>

const TimerecordCreateData = z.object({
    location_id: string_id,
    action_field_id: string_id,

    day: yyyy_mm_dd,
    annotation: z.string().max(1000).nullable().default(null),

    indicator_values: z.array(IndicatorValueSchema).default([]).transform(filter_duplicate_ids),

    hours: z.number({ coerce: true }).max(24).positive(),
    start_time: hh_mm.nullable().default(null),
    end_time: hh_mm.nullable().default(null),
});

const generate = zocker(TimerecordCreateData);

function filter_duplicate_ids(array: IndicatorValue[]) : IndicatorValue[] {
    const seen = new Set();
    return array.filter(x => {
        const id = x.indicator_id;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    })
}

describe("Realworld TimerecordCreateData Schema", () => {

    it("reliably generates valid timerecords", () => {
        for (let i = 0; i < repeats; i++) {
            const data = generate();
            expect(() => TimerecordCreateData.parse(data)).not.toThrow();
        }
    });
});