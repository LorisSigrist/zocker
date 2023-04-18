# Zocker
> :warning: **This is a work in progress. Don't use in production** :warning:

Generate realistic test-data from your Zod-Schemas.

This is currently still a dream in my head, but I'm working on it. Having a solid mock-data
generation library would be a huge boost for the value Zod provides to developers. I've missed
this in my own projects, so I got started building it.


## Installation

```bash
npm install zocker
```

## Usage

```ts
import { z } from "zod";
import { zocker } from "zocker";

const schema = z.object({
	name: z.string(),
	age: z.number(),
	isAdult: z.boolean(),
	hobbies: z.array(z.string())
});

const generate = zocker(schema); //Return a function
const fake_data = generate(); //Generate data
```