import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const ipv4_schemas = {
	"plain ipv4": z.ipv4(),
	"ipv4 with min-length": z.ipv4().min(9),
	"ipv4 with max-length": z.ipv4().max(9),
	"ipv4 with exact-length": z.ipv4().length(9)
};

const ipv6_schemas = {
	"plain ipv6": z.ipv6(),
	"ipv6 with maximal min-length": z.ipv6().min(39), // all 8 segments are 4 characters long
	"ipv6 with min-length": z.ipv6().min(20),
	"ipv6 with minimal max-length": z.ipv6().max(3), // 1 segment with 1 char
	"ipv6 with max-length": z.ipv6().max(20),
	"ipv6 with exact-length": z.ipv6().length(30)
};

describe("IPv4 generation", () => {
	test_schema_generation(ipv4_schemas);
});

describe("IPv6 generation", () => {
	test_schema_generation(ipv6_schemas);
});
