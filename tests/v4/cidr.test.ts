import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const cidrv4_schemas = {
	"plain cidrv4": z.cidrv4(),
	"cidrv4 with shortest maxlength": z.cidrv4().max(9),
	"cidrv4 with longest minlength": z.cidrv4().min(18),
	"cidrv4 with exact lenth": z.cidrv4().length(14)
};

const cidrv6_schemas = {
	"plain cidrv6": z.cidrv6(),
	"cidrv6 with shortest maxlength": z.cidrv6().max(5),
	"cidrv6 with longest minlength": z.cidrv6().min(43),
	"cidrv6 with exact lenth": z.cidrv6().length(20)
};

describe("CUID generation", () => {
	test_schema_generation(cidrv4_schemas);
});

describe("CUID2 generation", () => {
	test_schema_generation(cidrv6_schemas);
});
