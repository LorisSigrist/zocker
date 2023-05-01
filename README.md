# Zocker

Writing Mock data is the worst. It's tedious, and it always gets out of sync with your actual system.
Zocker is a library that automatically generates reasonable mock data from your Zod schemas. That way your mock data is always up to date, and you can focus on what's important.

## Minimum Viable Package

A list of features that I think are required to make this a releasable package. (might publish before this is done to reserve the name)

- [x] Generate data for all reasonable Zod-primitives
- [x] Make tests repeatable, so that developers can reproduce bugs.
- [x] Generate cyclic schemas
- [x] Generate "any" schemas
- [x] Provide escape hatches for developers to define custom generators for specific types - Including ones that `zocker` can't support itself
- [x] Define an API that gives developers control over the generation process. Eg force edge-cases to happen in specific tests, and avoid them in others.
- [ ] Generate semantically meaningful data, Eg. the `name` field on an object should actually be a name. This is doable using `faker`.
- [ ] Documentation

## Installation

```bash
npm install --save-dev zocker
```

## Usage
Wrapping your zod-schema in `zocker` will give you a function that you can use to generate mock data.

```typescript
import { z } from "zod";
import { zocker } from "zocker";

const schema = z.object({
	name: z.string(),
	age: z.number()
});

const generate = zocker(schema);
const mockData = generate();
```

Having this two-step process makes it a lot easier to customize the generation process later on.

### Limitations & How to work around them

Zocker attempts to generate data that would pass validation for the given schema. But some schemas are not practically reversable. It isn't possible to generate a valid string for a schema using `refine` or `preprocess`. At least not out of the box.

You can however provide your own generator for a sub-schema. This allows you to bypass this limitation.

```typescript
import { z } from 'zod';
import { zocker } from 'zocker';

const name_schema = z.string().refine(
    (name) => name.length > 5, 
);

const schema = z.object({
  name: name_schema,
  age: z.number(),
});

const generate = zocker(schema, {
    generators: [
        {
            generator: () => 'John Doe',
            match: "reference",
            schema: name_schema
        }
    ]
});
```

To register a custom-generator, you must provide two things:
1. A function that generates data
2. A way to instruct zocker when to use this generator

Here we've told zocker to use the generator every time it encounters a schema with reference equality to `name_schema`. 

Alternatively, you can also use `match: "instanceof"` to match based on the type of the schema. This is useful for overriding the default generator for a specific type. Eg. `z.number()`.

Generator functions recive two arguments:
1. The schema that they are generating data for
2. A context object that contains information about the current generation process. This one is rarely used.

