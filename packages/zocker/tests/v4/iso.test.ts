import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const iso_schemas = {
	"iso date": z.iso.date(),
	"iso datetime": z.iso.datetime(),
	"iso time": z.iso.time(),
	"iso duration": z.iso.duration(),

	"iso datetime with offset": z.iso.datetime({ offset: true }),
	"iso datetime with precision": z.iso.datetime({ precision: 2 }),
	"iso datetime with precision 0": z.iso.datetime({ precision: 0 }),
	"iso datetime with precision and offset": z.iso.datetime({ precision: 2, offset: true })
};

describe("ISO generation", () => {
	test_schema_generation(iso_schemas);
});
