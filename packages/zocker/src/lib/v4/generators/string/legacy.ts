import z4 from "zod/v4";
import * as z from "zod/v4/core";
import { generate, GenerationContext } from "../../generate.js";

/**
 * If the schema has checks for a legacy format (eg `z.string().email()` instead of `z.string()`), this will
 * call the apropriate generator. 
 * 
 * @returns The generated string, or `null` if no legacy format was used
 */
export function legacyFormatString(schema: z.$ZodString, ctx: GenerationContext<any>): string | null {
    const checks = schema._zod.def.checks ?? [];
    
    const guid_checks = checks.filter((c) => c instanceof z4.ZodGUID);
    const uuid_checks = checks.filter((c) => c instanceof z4.ZodUUID);

    if (uuid_checks.length > 0) {
        
        const uuid_schema = z4.uuid({ version: uuid_checks[0]!.def.version })
        return generate(uuid_schema, ctx);
    }


	return null;
}