# Zocker

Writing Mock data is the worst. It's tedious, and it always gets out of sync with your actual system.
Zocker is a library that automatically generates reasonable mock data from your Zod schemas. That way your mock data is always up to date, and you can focus on what's important.

## Installation

```bash
npm install --save-dev zocker
```

## Usage
Wrapping your zod-schema in `zocker()` will give you a function that you can use to generate mock data.

```typescript
import { z } from "zod";
import { zocker } from "zocker";

const schema = z.object({
	name: z.string(),
	age: z.number()
});

const generate = zocker(schema);
const mockData_1 = generate();
const mockData_2 = generate();
//...
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

### Customizing the generation process
The way to customize the generation process is to override the built-in generators. But this doesn't mean that you have to write your own generators from scratch. All built-in generators have factory-functions that generate a generator for you, with the behavior you want. For example, you could have a number generator that always generates the most extreme values possible.

```typescript
import { z } from 'zod';
import { zocker, NumberGenerator } from 'zocker';

const generate = zocker(my_schema)
const data = generate({
    generators: [
        NumberGenerator({
            always: "max"
        })
    ]
})
```

Notice that you can pass the return-value directly into the `generators` field, as it comes included with the matching-configuration. This is the case for all built-in generators. 

You will be able to achieve most of the customization you need by using the built-in generators. But if you need to, you can also write your own generators as described above.

### Repeatability
You can specify a seed to make the generation process repeatable. This ensures that your test are never flaky.
    
```typescript
    const generate = zocker(schema);

    test("my test" , ()=>{
        const data = generate({ seed: 23 }); // always the same
    })
```

We guarantee that the same seed will always produce the same data, with the same schema and the same generator configuration. Different generator configurations may produce different data, even if the differences are never actually called.