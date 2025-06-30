import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const formatted_string_schemas = {
	"string.date": z.string().date(),
	"string.datetime": z.string().datetime({ offset: false }),
	"string.datetime with offset": z.string().datetime({ offset: true }),
	"string.duration": z.string().duration(),
	"string.time": z.string().time(),

	"string.email": z.string().email(),
	"string.guid": z.string().guid(),
	"string.uuid": z.string().uuid(),
	"string.uuidv4": z.string().uuidv4(),
	"string.uuidv6": z.string().uuidv6(),
	"string.uuidv7": z.string().uuidv7(),
	"string.url": z.string().url(),
	"string.cuid": z.string().cuid(),
	"string.cuid2": z.string().cuid2(),
	"string.ulid": z.string().ulid(),
	"string.emoji": z.string().emoji(),
	"string.xid": z.string().xid(),
	"string.nanoid": z.string().nanoid(),
	"string.ksuid": z.string().ksuid(),
	"string.ipv6": z.string().ipv6(),
	"string.ipv4": z.string().ipv4(),
	"string.e164": z.string().e164(),
	"string.cidrv4": z.string().cidrv4(),
	"string.cidrv6": z.string().cidrv6(),
	"string.base64url": z.string().base64url(),
	"string.base64": z.string().base64()
	//  "string.jwt": z.string().jwt(),
} as const;

describe("Deprecated string formats", () => {
	test_schema_generation(formatted_string_schemas);
});
