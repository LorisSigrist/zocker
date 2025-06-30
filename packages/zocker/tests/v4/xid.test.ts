import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const xid_schemas = {
	"z.xid": z.xid(),
	"xid with pattern": z.xid({ pattern: z.regexes.xid })
};

describe("XID generation", () => {
	test_schema_generation(xid_schemas);
});
