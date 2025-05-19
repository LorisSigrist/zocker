// There are some exceptions that can occur during the generation process.
// Since some of these are recoverable, we have a standard way of handling them.
export class RecursionLimitReachedException extends Error {}
export class NoGeneratorException extends Error {}
export class InvalidSchemaException extends Error {}
