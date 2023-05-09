# Zocker

Writing Mock data is the worst. It's tedious, and it always gets out of sync with your actual system.
Zocker is a library that automatically generates reasonable mock data from your Zod schemas. That way your mock data is always up to date, and you can focus on what's important.

## Installation

```bash
npm install --save-dev zocker
```

## Features & Limitations

`zocker` is still in development, but it already is the most feature-complete library of its kind. It's easier to list the limitations than the features. All these limitations can be worked around by customizing the generation process (see below).

1. `z.preprocess` and `z.refine` are not supported out of the box (and probably never will be)
2. `toUpperCase`, `toLowerCase` and `trim` only work if they are the last operation on a string
3. `z.function` is not supported
4. `z.Intersection` is not supported (yet)
5. `z.transform` is only supported if it's the last operation on a schema
6. `z.string` supports at most one format (e.g regex, cuid, ip) at a time
7. The customization for the built-in generators is still limited, but expanding rapidly (suggestions welcome)

## Usage

Like `zod`, we use a fluent API to make customization easy. Get started by wrapping your schema in `zocker`, and then call `generate()` on it to generate some data.

```typescript
import { z } from "zod";
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

If you have a value that you would like to control explicitly, you can supply your own.
Let's learn by example:

```typescript
const name_schema = z.string().refine((name) => name.length > 5);

const schema = z.object({
	name: name_schema,
	age: z.number()
});

const data = zocker(schema).supply(name_schema, "Jonathan").generate();
```

The `supply` method allows you to provide a value, or a function that returns a value, for a specific sub-schema.
It will be used whenever a sub-schema is encoutnered, that matches the one you passed into `supply` by reference.

> The supplied value is not enforced to be valid

This is the main way to work around unsupported types.

### Customizing the generation process

#### Providing Options to Built-Ins

You can customize the behaviour of many built-in generators by passing options to their corresponding method on `zocker`. The methods have the same name as the datatype.

You can mostly autocomplete your way through these.

```typescript
const data = zocker(my_schema)
		.set({min: 2, max: 20}) //How many items should be in a set
		.number({ extreme_value_chance: 0.3 }) //The probability that the most extreme value allowed will be generated
		...
		.generate()
```

#### Overriding Built-ins

If you want to outright override one of the built-in generators (E.g `z.ZodNumber`), then you can use the `override` method. Pass it a schema and a value / function that generates a value, and it will be used whenever a schema is encountered that is an instance of the schema you provided.

Let's override the number generation to only return `Infinity`, regardless of anything.

```typescript
const data = zocker(my_schema).override(z.ZodNumber, Infinity).generate();
```

> There is currently an issue, where the types don't play well when passing the classes themselves as arguments. If you get a type-error on `z.ZodNumber`, type-cast it to itself it with `z.ZodNumber as any as z.ZodNumber`. It's silly, I know. If you know how to fix it, contributions are welcome.

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

If you are overriding a schema with children, you might want to re-enter `zocker`'s generation. You could do this by definging a second mock generation inside your override function, but that would loose all the outside-customization you've done. Instead, use the `generate` function that is exported from the `"zocker"` module. Pass it the schema you would like to generate, as well as the generation-context.

```typescript
import { zocker, generate } from "zocker";

const data = zocker(my_schema)
	.override(z.ZodRecord, (schema, ctx) => {
		const keys = ["one", "two", "three"];
		const obj = {};
		for (const key of keys) {
			obj[key] = generate(schema._def.valueType, ctx);
		}
		return obj;
	})
	.generate();
```

`generate` is what zocker's built-in generators use aswell. This is the only point where you need to interact with it.

> The generation-context is passed by reference between different generations, it is not immutable. If you mutate it (which you probably don't need to), make sure to undo the mutation before returning from your function, even if it throws.

### Code Reuse

When writing unit-tests, you often end up with many slightly different `zocker` setups. The might only differ in one `supply` call to force a specific edge case.

To make this easier to deal with, each step in `zocker`'s fluent API is immutable, so you can reuse most of your configuration for many slight variations.

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

We guarantee that the same seed will always produce the same data, with the same schema and same options.

## Examples

### Cyclic JSON

Since `zocker` supports `z.lazy`, you can use it to generate cyclic data.

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
const data = zocker(regex_schema);
```

## API
### `.supply`
Allows you to supply a specific value for a specific schema. This is useful for testing edge-cases.

```typescript
const data = zocker(my_schema).supply(my_sub_schema, 0).generate();
```

The supplied value will be used if during the generation process a schema is encoutered, that matches the supplied `sub_schema` by *reference*.

You can also supply a function that returns a value. The function must follow the `Generator` type.

### `.override`
Allows you to override the generator for an entire category of schemas. This is useful if you want to override the generation of `z.ZodNumber` for example.

```typescript
const data = zocker(my_schema).override(z.ZodNumber, 0).generate();
```

The supplied value will be used if during the generation process a schema is encoutered, that is an *instance* of the supplied `schema`.

You can also supply a function that returns a value. The function must follow the `Generator` type.


### `.setDepthLimit`
Allows you to set the maximum depth of cyclic data. Defaults to 5.

### `.setSeed`
Allows you to set the seed for the random number generator. This ensures that the generation process is repeatable. If you don't set a seed, a random one will be chosen.

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
	generate_extra_keys: true //extra keys will be generated if allowed by the schema
}
```

### `.any` / `.unknown`
Options for the built-in `z.ZodAny` and `z.ZodUnknown` generators.

```typescript
{
	strategy: "true-any" | "json-compatible" | "fast"
}
```

### `.optional`
Options for the built-in `z.ZodOptional` generator.

```typescript
{
	undefined_chance: 0.3
}
```

### `.nullable`
Options for the built-in `z.ZodNullable` generator.

```typescript
{
	null_chance: 0.3
}
```

### `.default`
Options for the built-in `z.ZodDefault` generator.

```typescript
{
	default_chance: 0.3
}
```

### `.number`
Options for the built-in `z.ZodNumber` generator.

```typescript
{
	extreme_value_chance: 0.3
}
```


## `type Generator`
A generator is a function that takes a schema and a generation-context, and returns a value that matches the schema.

```typescript
type Generator<Z extends z.ZodTypeAny> = (schema: Z, ctx: GenerationContext) => z.infer<Z>;
```

## The Future

I intend to continue expanding the number of built-in generators, and make the generation process more customizable. If you have any ideas, please open an issue or a pull request - I'd love to hear your thoughts.

Good APIs usually take a lot of iterations to get right, ideas are always welcome.
