# zocker

## 1.4.0

### Minor Changes

- 9467b9c: Support zod 3.22 and it's new `readonly` schemas

## 1.3.0

### Minor Changes

- 086fe06: feat: enable using string-names of datatypes in `.override` calls (E.g `"number"` instead if `z.ZodNumber`)

## 1.2.1

### Patch Changes

- d7e9bd0: fix: Fixed wrong type-definitions when using supply or override

## 1.2.0

### Minor Changes

- 797dbc5: feat: added `generateMany` method

## 1.1.0

### Minor Changes

- bb882d3: Added configuration for extra properties on objects
- bb882d3: Added customization options for `any` and `unknown` data-types

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
