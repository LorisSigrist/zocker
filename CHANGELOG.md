# zocker

## 1.0.0

### Major Changes

- 78ae17f: Replaced old Generator-based configuration API with fluent-API

  This breaks all existing zocker-setups, including the ones with no custom generators.

  This was done to make zocker more user-friendly going forward, as the new API is signifficantly more intuitive to use, and requires less understanding of zod's internals.

  Consult the README for the new API documentation.

## 0.1.3

### Patch Changes

- 96d28b2: Bigints now support multiple min,max and multipleof checks on the same value

## 0.1.2

### Patch Changes

- a16e27c: Throw InvalidSchemaException if a string uses mutliple, incompatible formats
