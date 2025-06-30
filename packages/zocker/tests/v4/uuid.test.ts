import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const uuid_schemas = {
	"plain uuid": z.uuid()
};

const uuidv4_schemas = {
	"plain uuidv4": z.uuidv4()
};

const uuidv6_schemas = {
	"plain uuidv6": z.uuidv6()
};

const uuidv7_schemas = {
	"plain uuidv7": z.uuidv7()
};

const guid_schemas = {
	"plain guid": z.guid()
};

describe("UUID generation", () => {
	test_schema_generation(uuid_schemas);
});

describe("UUIDv4 generation", () => {
	test_schema_generation(uuidv4_schemas);
});

describe("UUIDv6 generation", () => {
	test_schema_generation(uuidv6_schemas);
});

describe("UUIDv7 generation", () => {
	test_schema_generation(uuidv7_schemas);
});

describe("GUID generation", () => {
	test_schema_generation(guid_schemas);
});
