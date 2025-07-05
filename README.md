# Zocker

Zocker is a library that automatically generates valid data from your Zod schemas. `zod`, `zod/v4` and `zod/v4-mini` schemas are supported.

[Try it on Stackblitz](https://stackblitz.com/github/LorisSigrist/zocker/tree/main/packages/example?file=src%2Fmain.ts)

```typescript
import { z } from "zod/v4";
import { zocker } from "zocker";

const person_schema = z.object({
	name: z.string(),
	age: z.number(),
	emails: z.array(z.email()),
	children: z.array(z.lazy(() => person_schema))
});

const mockData = zocker(person_schema).generate();

/*
mockData = {
	name: "John Doe",
	age: 42,
	emails: ["john.doe@gmail.com"],
	children: [
		{
			name: "Jane Doe",
			age: 12,
			emails: [...]
			children: [...]
		},
		...
	]
}
*/
```

## Installation

```bash
npm install --save-dev zocker
```

## Features & Limitations

The vast majority of Zod schemas just work. It's quicker to list the ones with limitations. Everything not listed here should just work.

1. `z.preprocess` and `z.refine` are ignored
2. `toUpperCase`, `toLowerCase` and `trim` only work if they are the last operation on a string
3. `z.function` is not supported
4. `z.intersection` is only partially supported
5. `z.transform` is only supported if it's the last operation on a schema
6. `z.string` supports at most one format (e.g regex, cuid, ip) at a time

All these limitations can be worked around by [supplying custom values](#supply-your-own-value) for the affected sub-schema.

## Usage

Wrap your schema in `zocker`, and then call `generate()` on it to generate some data.

```typescript
import { z } from "zod/v4";
import { zocker } from "zocker";

const person_schema = z.object({
	name: z.string(),
	age: z.number(),
	emails: z.array(z.string().email()),
	children: z.array(z.lazy(() => person_schema))
});

const mockData = zocker(person_schema).generate();
/*
{
	name: "John Doe",
	age: 42,
	emails: ["john.doe@gmail.com"],
	children: [
		{
			name: "Jane Doe",
			age: 12,
			emails: [...]
			children: [...]
		},
		...
	]
}
*/
```

### Supply your own value

If you have a value that you would like to set explicitly, you can `.supply` your own value. `.supply` takes two arguments;

1. A reference to the sub-schema you want to match. You can get it on `schema.shape`.
2. The value you want to return.

```typescript
const schema = z.object({
	name: z.string(),
	age: z.number()
});

const data = zocker(schema)
	.supply(schema.shape.name, "Jonathan") // the `name` will always be "Jonathan"
	.generate();
```

> Note: Zocker will not enforce that the supplied value is valid

### Customizing the generation process

#### Providing Options to Built-Ins

You can customize the behaviour of many built-in generators by passing options to their corresponding method on `zocker`. The methods have the same name as the datatype.

You can mostly autocomplete your way through these.

```typescript
const data = zocker(my_schema)
		.set({ min: 2, max: 20 }) //How many items should be in a set
		.number({ extreme_value_chance: 0.3 }) //The probability that the most extreme value allowed will be generated
		...
		.generate()
```

#### Overriding Built-ins

If you want to outright override one of the built-in generators (E.g `z.$ZodNumber`), then you can use the `override` method. Pass it a schema and a value / function that generates a value, and it will be used whenever a schema is encountered that is an instance of the schema you provided.

Let's override the number generation to only return `Infinity`, regardless of anything.

```typescript
const data = zocker(my_schema).override(z.ZodNumber, Infinity).generate();
```

In practice you would probably want to return different values based on the exact number-schema we are working on.
To do that, you can provide a function to the override. It will recieve two arguments, first the schema that we are working on, and second, a generation-context. You usually only utilize the first one.

```typescript
const data = zocker(my_schema)
	.override(z.ZodNumber, (schema, _ctx) => {
		//Example: Return 0 if there is a minimum specified, and 1 if there isn't
		if (schema._def.checks.some((check) => check.kind == "min")) return 0;
		return 1;
	})
	.generate();
```

### Code Reuse

When writing unit-tests, you often end up with many slightly different `zocker` setups. The might only differ in one `supply` call to force a specific edge case.

To make this easier to deal with, each step in `zocker`'s API is immutable at each step, so you can reuse most of your configuration for many slight variations.

E.g

```typescript
const zock = zocker(my_schema).supply(...)...setSeed(0); //Do a bunch of customization

test("test 1" , ()=>{
	const data = zock
		.supply(my_sub_schema, 0); //Extra-customization - Does not affect `zock`
		.generate()
	...
})

test("test 2", ()=> {
	const data = zock
		.supply(my_sub_schema, 1); //Extra-customization - Does not affect `zock`
		.generate()
	...
})
```

### Repeatability

You can specify a seed to make the generation process repeatable. This ensures that your test are never flaky.

```typescript
test("my repeatable test", () => {
	const data = zocker(schema).setSeed(123).generate(); // always the same
});
```

We guarantee that the same seed will always produce the same data, with the same schema, same options and same version.

## Examples

### Cyclic Types

Zocker supports `z.lazy`. You can use it to generate cyclic data.like normal

```typescript
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const jsonSchema = z.lazy(() =>
	z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

const data = zocker(jsonSchema).setDepthLimit(5).generate(); //defaults to 5
```

### Regular Expressions

Zocker supports `z.string().regex()` out of the box, thanks to the amazing [randexp](https://npmjs.com/package/randexp) library. It doesn't play very well with other string validators though (e.g `min`, `length` and other formats), so try to encode as much as possible in the regex itself. If you need to, you can always supply your own generator.

```typescript
const regex_schema = z.string().regex(/^[a-z0-9]{5,10}$/);
const data = zocker(regex_schema); // 1b3d5
```

## API

When you use the `zocker(schema)` function you get back an object with the following methods:

### `.supply`

Supply a concrete value for a specific schema. This is useful for testing edge-cases.

```typescript
const data = zocker(my_schema).supply(my_sub_schema, 0).generate();
```

The supplied value will be used if during the generation process a schema is encoutered, that matches the supplied `sub_schema` by _reference_.

You can also supply a function that returns a value. The function must follow the `Generator` type.

### `.override`

Overrides the generator for an entire category of schemas. This is useful if you want to override the generation of `z.ZodNumber` for example.

```typescript
const data = zocker(my_schema).override(z.$ZodNumber, 0).generate();
```

The supplied value will be used if during the generation process a schema is encoutered, that is an _instance_ of the supplied `schema`. Alternatively, you can also provide the name of the datatype you want to override as a string. (e.g `"number"`). Intellisense will help you out here.

You can also supply a function that returns a value. The function must follow the `Generator` type.

### `.setDepthLimit`

Set the maximum depth of cyclic data. Defaults to 5.

### `.setSeed`

Set the seed for the random number generator. This ensures that the generation process is repeatable. If you don't set a seed, a random one will be chosen.

### `.generate`

Executes the generation process. Returns the generated data that matches the schema provided to `zocker`.

### `.set`

Options for the built-in `z.ZodSet` generator.

```typescript
{
	max: 10,
	min: 0
}
```

### `.array`

Options for the built-in `z.ZodArray` generator.

```typescript
{
	max: 10,
	min: 0
}
```

### `.map`

Options for the built-in `z.ZodMap` generator.

```typescript
{
	max: 10,
	min: 0
}
```

### `.record`

Options for the built-in `z.ZodRecord` generator.

```typescript
{
	max: 10,
	min: 0
}
```

### `.object`

Options for the built-in `z.ZodObject` generator.

```typescript
{
	generate_extra_keys: true; //extra keys will be generated if allowed by the schema
}
```

### `.any` / `.unknown`

Options for the built-in `z.ZodAny` and `z.ZodUnknown` generators.

```typescript
{
	strategy: "true-any" | "json-compatible" | "fast";
}
```

### `.optional`

Options for the built-in `z.ZodOptional` generator.

```typescript
{
	undefined_chance: 0.3;
}
```

### `.nullable`

Options for the built-in `z.ZodNullable` generator.

```typescript
{
	null_chance: 0.3;
}
```

### `.default`

Options for the built-in `z.ZodDefault` generator.

```typescript
{
	default_chance: 0.3;
}
```

### `.number`

Options for the built-in `z.ZodNumber` generator.

```typescript
{
	extreme_value_chance: 0.3;
}
```
