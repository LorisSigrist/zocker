//import { z } from "zod";
import { z } from "zod/v4";
import { zocker } from "zocker";

const schema = z.object({
	name: z.string(),
	age: z.number().min(0).max(100),
	gender: z.string().optional()
});

const data = zocker(schema).generate();

document.getElementById("output")!.innerHTML = JSON.stringify(data, null, 2);
