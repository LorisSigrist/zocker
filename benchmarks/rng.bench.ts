import { describe, bench } from "vitest";
import { faker } from "@faker-js/faker";

describe("rng", () => {
    bench("Math.random", () => {
        Math.random();
    });

    bench("faker", () => {
        faker.datatype.number();
    });

    bench("faker (min: 0, max: 1)", () => {
        faker.datatype.number({ min: 0, max: 1 });
    });
});