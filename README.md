# Zocker

> :warning: **This library is still in development - Expect breaking changes**

Writing Mock data is the worst. It's tedious, and it always gets out of sync with your actual system.
Zocker is a library that automatically generates reasonable mock data from your Zod schemas. That way your mock data is always up to date, and you can focus on what's important.

## Installation

```bash
npm install --save-dev zocker
```

## Usage

Wrapping your zod-schema in `zocker()` will return mock data that matches your schema.

```typescript
import { z } from "zod";
import { zocker } from "zocker";

const person_schema = z.object({
	name: z.string(),
	age: z.number(),
	emails: z.array(z.string().email()),
	children: z.array(z.lazy(() => person_schema))
});

const mockData = zocker(person_schema);
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

### Features & Limitations
`zocker` is still in early development, but it already is the most feature-complete library of its kind. It's easier to list the limitations than the features. All these limitations can be worked around by providing your own generator (see below).

1. `z.preprocess` and `z.refine` are not supported out of the box (and probably never will be)
2. `toUpperCase`, `toLowerCase` and `trim` only work if they are the last operation in the chain
3. `z.function` is not supported
4. `z.Intersection` is not supported
4. `z.transform` is only supported if it's the last operation in the chain
5. `z.regex` can be used at most once per string
6. The generation-customization options are very limited (ideas are welcome)

### Providing a custom generator

You can override any part of the Generation Process by providing your own generator. This allows you to bypass all limitation listed above.

To register a custom-generator, you must provide two things:

1. A function that generates data
2. A way to instruct zocker when to use this generator

Let's learn by example:

```typescript
import { z } from "zod";
import { zocker } from "zocker";

const name_schema = z.string().refine((name) => name.length > 5);

const schema = z.object({
	name: name_schema,
	age: z.number()
});

const generators = [
	{
		//The function that returns data
		generator: () => "John Doe", 

		//The matching-configuration
		match: "reference",	
		schema: name_schema
	}
];

const data = zocker(schema, { generators });
```
Here we've told zocker to always generate the name "John Doe" for the `name_schema`. We check equality for the name schema by using the `match: "reference"` configuration. This means that we check if the schema is the same object as the one we provided. 

Alternatively, you can also use `match: "instanceof"` to match based on the type of the schema. This is useful for overriding the default generator for a specific type. Eg. `z.number()`.

Generator functions always recive two arguments:

1. The schema that they are generating data for
2. A context object that contains information about the current generation process. This one is rarely used.

### Customizing the generation process

The main way to customize the generation process is to override the built-in generators. But this doesn't mean that you have to write your own generators from scratch. All built-in generators have factory-functions that generate a configuration for you, with the behavior you want. For example, you could have a number generator that always generates the most extreme values possible.

```typescript
import { z } from "zod";
import { zocker, NumberGenerator } from "zocker";

const generators = [
	NumberGenerator({
		extreme_value_chance: 1 //Set the chance of generating an extreme value to 100%
	})
];

const data = zocker(my_schema, { generators });
```

Notice that you can pass the return-value directly into the `generators` field, as it comes included with the matching-configuration. This is the case for all built-in generators. If you only want the function, you can just access the `generator` field of the return-value.

### Repeatability

You can specify a seed to make the generation process repeatable. This ensures that your test are never flaky.

```typescript
test("my repeatable test", () => {
	const data = zocker(schema, { seed: 23 }); // always the same
});
```

We guarantee that the same seed will always produce the same data, with the same schema and the same generator configuration. Different generator configurations might produce different data, even if the differences are never actually called.

## Examples

### Cyclic JSON

Since `zocker` supports `z.lazy`, you can use it to generate cyclic data.

```typescript
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const jsonSchema = z.lazy(() =>
	z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

const data = zocker(jsonSchema, {
	recursion_limit: 5 // default value
});
```

### Regular Expressions

Zocker supports `z.string().regex()` out of the box, thanks to the amazing [randexp](https://npmjs.com/package/randexp) library. It doesn't play very well with other string validators though (e.g `min`, `length` and other formats), so try to encode as much as possible in the regex itself. If you need to, you can always override the generator for a specific schema.

```typescript
const regex_schema = z.string().regex(/^[a-z0-9]{5,10}$/);
const data = zocker(regex_schema);
```


## The Future
I intend to continue expanding the number of built-in generators, and make the generation process more customizable. If you have any ideas, please open an issue or a pull request - I'd love to hear your thoughts. 

Good APIs usually take a lot of iterations to get right, ideas are always welcome.