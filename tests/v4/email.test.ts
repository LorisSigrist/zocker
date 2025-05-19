import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const email_schemas = {
	"plain email": z.email(),
	"html5 email": z.email({ pattern: z.regexes.html5Email }),
	"browser email": z.email({ pattern: z.regexes.browserEmail }),
	"unicode email": z.email({ pattern: z.regexes.unicodeEmail }),
	"rfc5322 email": z.email({ pattern: z.regexes.rfc5322Email })
};

describe("Email generation", () => {
	test_schema_generation(email_schemas);
});
