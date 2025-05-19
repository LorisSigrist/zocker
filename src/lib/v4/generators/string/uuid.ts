import * as z from "zod/v4/core";
import { Generator } from "../../generate.js";
import { InstanceofGeneratorDefinition } from "../../zocker.js";
import { faker } from "@faker-js/faker";
import Randexp from "randexp";

const uuid_generator: Generator<z.$ZodUUID> = (schema, ctx) => {
    const version = Number.parseInt(schema._zod.def.version?.slice(1) ?? "4");
    const pattern = schema._zod.def.pattern ?? z.regexes.uuid(version);

    const randexp = new Randexp(pattern);
    randexp.randInt = (min: number, max: number) =>
        faker.datatype.number({ min, max, precision: 1 });
    return randexp.gen();
};

export const UUIDGenerator: InstanceofGeneratorDefinition<z.$ZodUUID> = {
    match: "instanceof",
    schema: z.$ZodUUID as any,
    generator: uuid_generator
}