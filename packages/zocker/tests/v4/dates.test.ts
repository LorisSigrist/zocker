import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const date_schemas = {
	"plain date": z.date(),
	"date with min": z.date().min(new Date("2055-01-01")),
	"date with max": z.date().max(new Date("2021-01-01")),
	"date with min and max": z
		.date()
		.min(new Date("2021-01-01"))
		.max(new Date("2021-12-31"))
} as const;

describe("Date generation", () => {
	test_schema_generation(date_schemas);
});
