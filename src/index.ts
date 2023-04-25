//This file exists as an import-gateway for the library.
//It is the only file that is exported to the outside world.
//Every publicly exposed export is re-exported from here.

export {
	zocker,
	type ZockerOptions,
	type GeneratorDefinition
} from "./lib/zocker.js";

export * from "./lib/generators/index.js";