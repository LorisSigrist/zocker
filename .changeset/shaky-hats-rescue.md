---
"zocker": major
---

Adds support for `zod/v4` and `@zod/mini` schemas. Zod 3 schemas are still supported & will continue to be supported as long as they are in the main `zod` package.

The new minimum required version of zod is `zod@3.25.3`.

BREAKING: The `generate` function is no longer public. It caused issues when trying to support both v3 and v4 schemas. 
