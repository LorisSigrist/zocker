const { z } = require("zod/v4");
const { zocker } = require("zocker");

const schema = z.object({
    id: z.uuid(),
	name: z.string(),
	age: z.number().int().min(0).max(120),
	email: z.email(),
	isActive: z.boolean().optional()
});

const data = zocker(schema).generate();
console.log("CJS Generated Data:", data);