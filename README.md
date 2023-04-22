# Zocker

There are currently two main ways developers get value from `zod`. Type-Guarantees and Type-Coersion. I see the potential for a third way, which is to generate random test data from schemas.

This would allow developers to write tests that are more robust, and more likely to catch edge-cases. The `zocker` project aims to provide this functionality.

I just started this project, so there is a lot of work to be done. Feel free to contribute any ideas, as I am still figuring this out.

## Minimum Viable Package

A list of features that I think are required to make this a releasable package. (might publish before this is done to reserve the name)

- [x] Generate data for all reasonable Zod-primitives
- [x] Make tests repeatable, so that developers can reproduce bugs.
- [x] Generate cyclic schemas
- [x] Generate "any" schemas
- [x] Provide escape hatches for developers to define custom generators for specific types - Including ones that `zocker` can't support itself
- [ ] Define an API that gives developers control over the generation process. Eg force edge-cases to happen in specific tests, and avoid them in others.
- [ ] Generate semantically meaningful data, Eg. the `name` field on an object should actually be a name. This is doable using `faker`. It should also be possible to side-step this, and just generate random data (as a torture test).
- [ ] Force Developers to provide custom generators for types that `zocker` can't support, ideally using just TypeScript.
- [ ] Documentation

## Thoughts on the API

There should be two main configuration points for the generation process.
One for Schema configuration, where you can define custom generators for specific types/paths, and one for each generation process, where you can request edge-cases, or force specific values.

Tests are usually named, so being able to configure the generation process to generate meaningful data for a specific test is important.

## Vision

```ts
import { my_function } from './my_function';
import { my_schema } from './schema';
import { zocker } from 'zocker';

//Ideally you only have to configure this once
const generate = zocker(my_schema, schema_options_tbd? );

it('should do something', () => {
  const data = generate(generation_options_tbd? );
  expect(my_function(data)).to("work");	 //Test your code with the generated data
});
```
