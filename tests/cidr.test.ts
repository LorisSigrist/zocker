import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";

const cidrv4_schemas = {
    "plain cidrv4": z.cidrv4(),
    "cidrv4 with shortest maxlength" : z.cidrv4().max(9),
    "cidrv4 with longest minlength": z.cidrv4().min(18),
    "cidrv4 with exact lenth": z.cidrv4().length(14)
    }

const cidrv6_schemas = {
    "plain cidrv6": z.cidrv6(),
}

describe("CUID generation", ()=> {
    test_schema_generation(cidrv4_schemas);
})
describe("CUID2 generation", ()=> {
    test_schema_generation(cidrv6_schemas);
})