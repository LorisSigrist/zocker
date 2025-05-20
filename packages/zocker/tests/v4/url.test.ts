import { describe } from "vitest";
import { z } from "zod/v4";
import { test_schema_generation } from "./utils";

const url_schemas = {
	"plain url": z.url(),
	"url with hostname": z.url({ hostname: /^example.com$/ }),
	"url with schema": z.url({ protocol: /^https$/ }),
	"url with hostname & schema": z.url({
		protocol: /^https$/,
		hostname: /^example.com$/
	})
};

describe("URL generation", () => {
	test_schema_generation(url_schemas);
});
