const { z } = require("zod");
const { zocker } = require("zocker");

const schema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	age: z.number().int().min(0).max(120),
	email: z.string().email(),
	isActive: z.boolean().optional()
});

const data = zocker(schema).generate();
if (!data) throw new Error("Data generation failed");
console.log("Zod3 CJS Generated Data:", data);
