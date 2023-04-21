import { GeneratorDefinition } from "./zocker.js";
import { z } from "zod";

import { generate_string } from "./generators/string.js";
import { generate_number } from "./generators/numbers.js";
import { generate_date } from "./generators/dates.js";
import { generate_bigint } from "./generators/bigint.js";
import { generate_object } from "./generators/object.js";
import { generate_array } from "./generators/array.js";
import { generate_effects } from "./generators/effects.js";
import { generate_tuple } from "./generators/tuple.js";
import { generate_map } from "./generators/map.js";
import { generate_record } from "./generators/record.js";
import { generate_set } from "./generators/set.js";
import { generate_union } from "./generators/union.js";
import { generate_discriminated_union } from "./generators/discriminated-union.js";
import { generate_boolean } from "./generators/boolean.js";
import { generate_enum } from "./generators/enum.js";
import { generate_native_enum } from "./generators/native-enum.js";
import { generate_optional } from "./generators/optional.js";
import { generate_nullable } from "./generators/nullable.js";
import { generate_any } from "./generators/any.js";
import { generate_symbol } from "./generators/symbol.js";
import { generate_default } from "./generators/default.js";
import { generate_lazy } from "./generators/lazy.js";
import { generate_branded } from "./generators/branded.js";
import { generate_promise } from "./generators/promise.js";

export const default_generators : GeneratorDefinition<any>[] = [
    {
        schema: z.ZodString,
        generator: generate_string,
        match: "instanceof"
    },
    {
        schema: z.ZodNumber,
        generator: generate_number,
        match: "instanceof"
    },
    {
        schema: z.ZodBigInt,
        generator: generate_bigint,
        match: "instanceof"
    },
    {
        schema: z.ZodBoolean,
        generator: generate_boolean,
        match: "instanceof"
    },
    {
        schema: z.ZodDate,
        generator: generate_date,
        match: "instanceof"
    },
    {
        schema: z.ZodSymbol,
        generator: generate_symbol,
        match: "instanceof"
    },
    {
        schema: z.ZodOptional,
        generator: generate_optional,
        match: "instanceof"
    },
    {
        schema: z.ZodNullable,
        generator: generate_nullable,
        match: "instanceof"
    },
    {
        schema: z.ZodAny,
        generator: generate_any,
        match: "instanceof"
    },
    {
        schema: z.ZodUnknown,
        generator: generate_any,
        match: "instanceof"
    },
    {
        schema: z.ZodVoid,
        generator: () => {},
        match: "instanceof"
    }, 
    {
        schema: z.ZodUndefined,
        generator: () => undefined,
        match: "instanceof"
    },
    {
        schema: z.ZodNull,
        generator: () => null,
        match: "instanceof"
    },
    {
        schema: z.ZodNaN,
        generator: () => NaN,
        match: "instanceof"
    },
    {
        schema: z.ZodLiteral,
        generator: (schema) => schema._def.value,
        match: "instanceof"
    },
    {
        schema: z.ZodEffects,
        generator: generate_effects,
        match: "instanceof"
    },
    {
        schema: z.ZodArray,
        generator: generate_array,
        match: "instanceof"
    },
    {
        schema: z.ZodTuple,
        generator: generate_tuple,
        match: "instanceof"
    },
    {
        schema: z.ZodRecord,
        generator: generate_record,
        match: "instanceof"
    },
    {
        schema: z.ZodMap,
        generator: generate_map,
        match: "instanceof"
    },
    {
        schema: z.ZodSet,
        generator: generate_set,
        match: "instanceof"
    },
    {
        schema: z.ZodObject,
        generator: generate_object,
        match: "instanceof"
    },
    {
        schema: z.ZodUnion,
        generator: generate_union,
        match: "instanceof"
    },
    {
        schema: z.ZodNativeEnum,
        generator: generate_native_enum,
        match: "instanceof"
    },
    {
        schema: z.ZodEnum,
        generator: generate_enum,
        match: "instanceof"
    },
    {
        schema: z.ZodDefault,
        generator: generate_default,
        match: "instanceof"
    },
    {
        schema: z.ZodDiscriminatedUnion,
        generator: generate_discriminated_union,
        match: "instanceof"
    },
    {
        schema: z.ZodPromise,
        generator:generate_promise,
        match: "instanceof"
    },
    {
        schema: z.ZodLazy,
        generator: generate_lazy,
        match: "instanceof"
    },
    {
        schema: z.ZodBranded,
        generator: generate_branded,
        match: "instanceof"
    }
]