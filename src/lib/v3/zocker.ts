import { z } from "zod";
import { GenerationContext, generate, Generator } from "./generate.js";
import { faker } from "@faker-js/faker";
import { default_generators } from "./default_generators.js";
import { NumberGeneratorOptions } from "./generators/numbers.js";
import { OptionalOptions } from "./generators/optional.js";
import { NullableOptions } from "./generators/nullable.js";
import { DefaultOptions } from "./generators/default.js";
import { MapOptions } from "./generators/map.js";
import { RecordOptions } from "./generators/record.js";
import { SetOptions } from "./generators/set.js";
import { AnyOptions } from "./generators/any.js";
import { ArrayOptions } from "./generators/array.js";
import { ObjectOptions } from "./generators/object.js";

export type InstanceofGeneratorDefinition<Z extends z.ZodSchema> = {
	schema: Z;
	generator: Generator<Z>;
	/** @deprecated No longer used*/
	match?: "instanceof";
};

export type ReferenceGeneratorDefinition<Z extends z.ZodSchema> = {
	schema: Z;
	generator: Generator<Z>;
	/** @deprecated No longer used*/
	match?: "reference";
};

export function zocker<Z extends z.ZodSchema>(schema: Z) {
	return new Zocker(schema);
}

export class Zocker<Z extends z.ZodSchema> {
	private instanceof_generators: InstanceofGeneratorDefinition<any>[] = [
		...default_generators
	];
	private reference_generators: ReferenceGeneratorDefinition<any>[] = [];
	private seed: number | undefined = undefined;
	private recursion_limit = 5;

	private number_options: NumberGeneratorOptions = {
		extreme_value_chance: 0.3
	};

	private optional_options: OptionalOptions = {
		undefined_chance: 0.3
	};

	private nullable_options: NullableOptions = {
		null_chance: 0.3
	};

	private default_options: DefaultOptions = {
		default_chance: 0.3
	};

	private map_options: MapOptions = {
		max: 10,
		min: 0
	};

	private record_options: RecordOptions = {
		max: 10,
		min: 0
	};

	private set_options: SetOptions = {
		max: 10,
		min: 0
	};

	private any_options: AnyOptions = {
		strategy: "true-any"
	};

	private unknown_options: AnyOptions = {
		strategy: "true-any"
	};

	private array_options: ArrayOptions = {
		min: 0,
		max: 10
	};

	private object_options: ObjectOptions = {
		generate_extra_keys: true
	};

	constructor(public schema: Z) {}

	/**
	 * Supply your own value / function for generating values for a given schema
	 * It will be used whenever the given schema matches an encountered schema by referebce
	 *
	 * @param schema - The schema for which this value will be used
	 * @param generator - A value, or a function that generates a value that matches the schema
	 */
	supply<S extends z.ZodTypeAny>(
		schema: S,
		generator: Generator<S> | z.infer<S>
	) {
		const next = this.clone();

		const generator_function =
			typeof generator === "function" ? generator : () => generator;

		next.reference_generators = [
			{
				schema,
				generator: generator_function,
				match: "reference"
			},
			...next.reference_generators
		];

		return next;
	}

	/**
	 * Override one of the built-in generators using your own.
	 * It will be used whenever an encoutntered Schema matches the one specified by **instance**
	 *
	 * @param schema - Which schema to override. E.g: `z.ZodNumber`.
	 * @param generator - A value, or a function that generates a value that matches the schema
	 */
	override<S extends z.ZodFirstPartySchemaTypes | KNOWN_OVERRIDE_NAMES>(
		schema: S,
		generator:
			| Generator<S extends KNOWN_OVERRIDE_NAMES ? OVERRIDE<S> : S>
			| z.infer<S extends KNOWN_OVERRIDE_NAMES ? OVERRIDE<S> : S>
	) {
		const next = this.clone();
		const generator_function =
			typeof generator === "function" ? generator : () => generator;

		const resolved_schema: z.ZodFirstPartySchemaTypes =
			typeof schema !== "string"
				? schema
				: OVERRIDE_NAMES[schema as KNOWN_OVERRIDE_NAMES]!;
		next.instanceof_generators = [
			{
				schema: resolved_schema,
				generator: generator_function,
				match: "instanceof"
			},
			...next.instanceof_generators
		];

		return next;
	}

	setSeed(seed: number) {
		const next = this.clone();
		next.seed = seed;
		return next;
	}

	setDepthLimit(limit: number) {
		const next = this.clone();
		next.recursion_limit = limit;
		return next;
	}

	number(options: Partial<NumberGeneratorOptions>) {
		const next = this.clone();
		next.number_options = { ...next.number_options, ...options };
		return next;
	}

	optional(options: Partial<OptionalOptions>) {
		const next = this.clone();
		next.optional_options = { ...next.optional_options, ...options };
		return next;
	}

	nullable(options: Partial<NullableOptions>) {
		const next = this.clone();
		next.nullable_options = { ...next.nullable_options, ...options };
		return next;
	}

	default(options: Partial<DefaultOptions>) {
		const next = this.clone();
		next.default_options = { ...next.default_options, ...options };
		return next;
	}

	map(options: Partial<MapOptions>) {
		const next = this.clone();
		next.map_options = { ...next.map_options, ...options };
		return next;
	}

	record(options: Partial<RecordOptions>) {
		const next = this.clone();
		next.record_options = { ...next.record_options, ...options };
		return next;
	}

	set(options: Partial<SetOptions>) {
		const next = this.clone();
		next.set_options = { ...next.set_options, ...options };
		return next;
	}

	any(options: Partial<AnyOptions>) {
		const next = this.clone();
		next.any_options = { ...next.any_options, ...options };
		return next;
	}

	unknown(options: Partial<AnyOptions>) {
		const next = this.clone();
		next.unknown_options = { ...next.unknown_options, ...options };
		return next;
	}

	array(options: Partial<ArrayOptions>) {
		const next = this.clone();
		next.array_options = { ...next.array_options, ...options };
		return next;
	}

	object(options: Partial<ObjectOptions>) {
		const next = this.clone();
		next.object_options = { ...next.object_options, ...options };
		return next;
	}

	generate(): z.infer<Z> {
		const ctx: GenerationContext<Z> = {
			reference_generators: this.reference_generators,
			instanceof_generators: this.instanceof_generators,
			recursion_limit: this.recursion_limit,
			path: [],
			semantic_context: "unspecified",
			parent_schemas: new Map(),
			seed: this.seed ?? Math.random() * 10_000_000,

			number_options: this.number_options,
			optional_options: this.optional_options,
			nullable_options: this.nullable_options,
			default_options: this.default_options,
			map_options: this.map_options,
			record_options: this.record_options,
			set_options: this.set_options,
			any_options: this.any_options,
			unknown_options: this.unknown_options,
			array_options: this.array_options,
			object_options: this.object_options
		};

		faker.seed(ctx.seed);
		return generate(this.schema, ctx);
	}

	generateMany(count: number): z.infer<Z>[] {
		let previous_seed = this.seed;
		const results: z.infer<Z>[] = [];

		for (let i = 0; i < count; i++) {
			if (previous_seed !== undefined) this.seed = previous_seed + i;
			results.push(this.generate());
		}

		this.seed = previous_seed;
		return results;
	}

	private clone(): Zocker<Z> {
		return Object.create(
			Object.getPrototypeOf(this),
			Object.getOwnPropertyDescriptors(this)
		);
	}
}

const OVERRIDE_NAMES = {
	number: z.ZodNumber as any as z.ZodNumber,
	string: z.ZodString as any as z.ZodString,
	boolean: z.ZodBoolean as any as z.ZodBoolean,
	bigint: z.ZodBigInt as any as z.ZodBigInt,
	date: z.ZodDate as any as z.ZodDate,
	undefined: z.ZodUndefined as any as z.ZodUndefined,
	null: z.ZodNull as any as z.ZodNull,
	any: z.ZodAny as any as z.ZodAny,
	unknown: z.ZodUnknown as any as z.ZodUnknown,
	void: z.ZodVoid as any as z.ZodVoid,
	never: z.ZodNever as any as z.ZodNever,
	array: z.ZodArray as any as z.ZodArray<any>,
	object: z.ZodObject as any as z.ZodObject<any>,
	union: z.ZodUnion as any as z.ZodUnion<any>,
	intersection: z.ZodIntersection as any as z.ZodIntersection<any, any>,
	tuple: z.ZodTuple as any as z.ZodTuple<any>,
	record: z.ZodRecord as any as z.ZodRecord<any>,
	map: z.ZodMap as any as z.ZodMap<any, any>,
	set: z.ZodSet as any as z.ZodSet<any>,
	lazy: z.ZodLazy as any as z.ZodLazy<any>,
	literal: z.ZodLiteral as any as z.ZodLiteral<any>,
	enum: z.ZodEnum as any as z.ZodEnum<any>,
	nativeEnum: z.ZodNativeEnum as any as z.ZodNativeEnum<any>,
	promise: z.ZodPromise as any as z.ZodPromise<any>,
	transformer: z.ZodTransformer as any as z.ZodTransformer<any, any>,
	optional: z.ZodOptional as any as z.ZodOptional<any>,
	nullable: z.ZodNullable as any as z.ZodNullable<any>,
	effects: z.ZodEffects as any as z.ZodEffects<any, any>
} as const satisfies {
	[K: string]: z.ZodFirstPartySchemaTypes;
};

type KNOWN_OVERRIDE_NAMES = keyof typeof OVERRIDE_NAMES;
type OVERRIDE<NAME extends KNOWN_OVERRIDE_NAMES> =
	(typeof OVERRIDE_NAMES)[NAME];
