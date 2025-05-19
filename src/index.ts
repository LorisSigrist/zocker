//This file exists as an import-gateway for the library.
//It is the only file that is exported to the outside world.
//Every publicly exposed export is re-exported from here.

import { zocker as zockerV4, Zocker as ZockerV4 } from "./lib/v4/zocker.js";
import { zocker as zockerV3, Zocker as ZockerV3 } from "./lib/v3/zocker.js";

import * as zCore from "zod/v4/core";
import { z as z3 } from "zod";

export function zocker<Z extends zCore.$ZodType | z3.ZodSchema>(
	schema: Z
): Z extends zCore.$ZodType
	? ZockerV4<Z>
	: Z extends z3.ZodSchema
	? ZockerV3<Z>
	: never {
	if ("_zod" in schema) {
		return zockerV4(schema) as any;
	} else {
		return zockerV3(schema) as any;
	}
}
