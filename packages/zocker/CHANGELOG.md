# zocker

## 2.2.0

### Minor Changes

- b30503c: add support for zod ^4.0.0 - Closes [#60](https://github.com/LorisSigrist/zocker/issues/60)

## 2.1.3

### Patch Changes

- 62988dc: `.override()` now accepts zod core-schemas as arguments. This closes a longstanding known issue. Fix implemented by [@ikoamu](https://github.com/ikoamu) 👏

## 2.1.2

### Patch Changes

- 8181d12: fix types being incorrectly generated

## 2.1.1

### Patch Changes

- 5942247: Correctly handle `multipleOf` constraints on numbers with non-integer multiples- Closes [#50](https://github.com/LorisSigrist/zocker/issues/50)

## 2.1.0

### Minor Changes

- c716f28: Zocker now distributes both ESM and CJS builds - Closes [#46](https://github.com/LorisSigrist/zocker/issues/46)

## 2.0.4

### Patch Changes

- f58e1ac: Fix [#42](https://github.com/LorisSigrist/zocker/issues/42) - `z.uuid()` no longer generates `00000000-0000-0000-0000-000000000000` as often

## 2.0.3

### Patch Changes

- 7a97a5a: Change `z.date` generation so that more reasonable values are generated
- 08d099a: Implement Generator for the undocumented `z.xid()` schema

## 2.0.2

### Patch Changes

- c3c2496: Implemet `z.ksuid()` generator
- f69fd6d: Fix incorrect format when generating values for `z.iso.datetime({ offset: true })`
- 0101584: fix: Legacy string formats, such as `z.string().email()` are supported again. However, you should still upgrade to the dedicated schemas, such as `z.email()` as soon as possible.
- 2994db4: Implement `z.guid` generator

## 2.0.1

### Patch Changes

- 3e12c19: Update `@faker-js/faker` dependency to version `9.8.0`

## 2.0.0

### Major Changes

Adds support for `zod/v4` and `zod/v4-mini` schemas. Zod 3 schemas are still supported & will continue to be supported as long as they are in the main `zod` package.

The new minimum required version of zod is `zod@3.25.3`.

BREAKING: The `generate` function is no longer public. It caused issues when trying to support both v3 and v4 schemas.

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
