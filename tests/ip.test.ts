import { describe } from "vitest";
import { z } from "zod";
import { test_schema_generation } from "./utils";


const ipv4_schemas = {
    "plain ipv4": z.ipv4(),
    "ipv4 with min-length": z.ipv4().min(9),
    "ipv4 with max-length": z.ipv4().max(9),
    "ipv4 with exact-length": z.ipv4().length(9),
}

describe("IPv4 generation", ()=> {
    test_schema_generation(ipv4_schemas);
})