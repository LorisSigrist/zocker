import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const iso_datetime_schemas = {
	"iso datetime": z.iso.datetime(),
	"iso datetime with offset": z.iso.datetime({ offset: true }),
	"iso datetime with precision": z.iso.datetime({ precision: 2 }),
	"iso datetime with precision 0": z.iso.datetime({ precision: 0 }),
	"iso datetime with precision and offset": z.iso.datetime({
		precision: 2,
		offset: true
	})
};

const iso_date_schemas = {
	"iso date": z.iso.date()
};

const iso_time_schemas = {
	"iso time": z.iso.time(),
	"iso time with precision": z.iso.time({ precision: 7 }),
	"iso time with precision 0": z.iso.time({ precision: 0 })
};

const iso_duration_schemas = {
	"iso duration": z.iso.duration(),
	"iso duration with pattern": z.iso.duration({ pattern: z.regexes.duration })
};

describe("ISO Datetime generation", () => {
	test_schema_generation(iso_datetime_schemas);
});

describe("ISO Date generation", () => {
	test_schema_generation(iso_date_schemas);
});

describe("ISO Time generation", () => {
	test_schema_generation(iso_time_schemas);
});

describe("ISO Duration generation", () => {
	test_schema_generation(iso_duration_schemas);
});
