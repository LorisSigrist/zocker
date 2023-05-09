---
"zocker": major
---

Replaced old Generator-based configuration API with fluent-API

This breaks all existing zocker-setups, including the ones with no custom generators.

This was done to make zocker more user-friendly going forward, as the new API is signifficantly more intuitive to use, and requires less understanding of zod's internals.

Consult the README for the new API documentation.