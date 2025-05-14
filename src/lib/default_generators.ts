import { InstanceofGeneratorDefinition } from "./zocker.js";
import * as z from "@zod/core"

import {
	StringGenerator,
	NumberGenerator,
	BigintGenerator,
	BooleanGenerator,
	DateGenerator,
	SymbolGenerator,
	OptionalGenerator,
	NullableGenerator,
	AnyGenerator,
	UnknownGenerator,
	EffectsGenerator,
	ArrayGenerator,
	TupleGenerator,
	RecordGenerator,
	MapGenerator,
	SetGenerator,
	ObjectGenerator,
	UnionGenerator,
	NativeEnumGenerator,
	EnumGenerator,
	DefaultGenerator,
	DiscriminatedUnionGenerator,
	PromiseGenerator,
	LazyGenerator,
	IntersectionGenerator,
	ReadonlyGenerator,
	Zod4StringGenerator,
	CUIDGenerator,
	CUID2Generator,
	IPv4Generator,
	IPv6Generator,
	UUIDGenerator,
	E164Generator,
	EmailGenerator,
	ISODateGenerator,
	ISODateTimeGenerator,
	ISOTimeGenerator,
	ISODurationGenerator,
	NanoIDGenerator,
	ULIDGenerator,
	CIDRv4Generator,
	CIDRv6Generator
} from "./generators/index.js";

export const default_generators: InstanceofGeneratorDefinition<any>[] = [
	// StringGenerator,
	CIDRv4Generator,
	CIDRv6Generator,
	ULIDGenerator,
	NanoIDGenerator,
	ISODateGenerator,
	ISODateTimeGenerator,
	ISOTimeGenerator,
	ISODurationGenerator,
	EmailGenerator,
	E164Generator,
	UUIDGenerator,
	IPv4Generator,
	IPv6Generator,
	CUID2Generator,
	CUIDGenerator,
	Zod4StringGenerator,
	NumberGenerator,
	BigintGenerator,
	BooleanGenerator,
	DateGenerator,
	SymbolGenerator,
	OptionalGenerator,
	NullableGenerator,
	AnyGenerator,
	UnknownGenerator,
	// EffectsGenerator, -- TODO: Effects changed in zod 4
	ArrayGenerator,
	TupleGenerator,
	RecordGenerator,
	MapGenerator,
	SetGenerator,
	ObjectGenerator,
	UnionGenerator,
// NativeEnumGenerator, -- removed in zod 4
	EnumGenerator,
	DefaultGenerator,
	DiscriminatedUnionGenerator,
	PromiseGenerator,
	LazyGenerator,
// 	BrandedGenerator, -- Branded is no longer a separate Type in zod's internal data-structure. We don't need to handle branded values separately
	ReadonlyGenerator,
	{
		schema: z.$ZodVoid,
		generator: () => {},
		match: "instanceof"
	},
	{
		schema: z.$ZodUndefined,
		generator: () => undefined,
		match: "instanceof"
	},
	{
		schema: z.$ZodNull,
		generator: () => null,
		match: "instanceof"
	},
	{
		schema: z.$ZodNaN,
		generator: () => NaN,
		match: "instanceof"
	},
	{
		schema: z.$ZodLiteral,
		generator: (schema: z.$ZodLiteral) => schema._zod.def.values[0],
		match: "instanceof"
	},
	IntersectionGenerator
];
