import * as ret from "ret";

// I don't want to reimplement regex parsing, so we use `ret` as a starting point.
// Ret's AST is not a good fit for our purposes, because it uses arbitrary Repetition & Position nodes,
// so we can't just use it directly.

/**
 * Contains the Types & Values for the Syntax Tree of a Regular Expression
 */
export namespace AST {
    /** Represents any Node in the Syntax Tree */
    export type Node = Concatenation | Alternation | KleeneStar | Literal | Anchor | Optional;

    // Namespaces like this are better for bundling than an enum
    export namespace Types {
        // TODO: Change these to numbers for production
        export const LITERAL = "literal";
        export const CONCATENATION = "concat";
        export const ALTERNATION = "alternation";
        export const KLEENE_STAR = "kleen-star";
        export const ANCHOR = "achor";
        export const OPTIONAL = "optional";

        export type LITERAL = typeof LITERAL;
        export type CONCATENATION = typeof CONCATENATION;
        export type ALTERNATION = typeof ALTERNATION;
        export type KLEENE_STAR = typeof KLEENE_STAR;
        export type ANCHOR = typeof ANCHOR;
        export type OPTIONAL = typeof OPTIONAL;
    }

    /**
     * Represents a Concatenation (eg `abc`)
     */
    export type Concatenation = {
        type: Types.CONCATENATION;
        /** Two or more nodes */
        values: Node[];
    }

    /**
     * Represents an Alternation (eg `a|b`)
     */
    export type Alternation = {
        type: Types.ALTERNATION;
        /** Two or more options */
        options: Node[];
    }

    /**
     * Represents a Kleene Star (eg `a*`)
     */
    export type KleeneStar = {
        type: Types.KLEENE_STAR;
        value: Node;
    }

    /**
     * Represents a Literal (eg `a`, `[a-z]`, `\S`).
     * The Literal may be given as a char, a set, or a range of chars, but it always matches a single character
     */
    export type Literal = {
        type: Types.LITERAL;
        value: ret.Char | ret.Range | ret.Set;
    }

    /**
     * Represents an zero-wiedth Positional Anchor (eg `^`, `$`)
     */
    export type Anchor = {
        type: Types.ANCHOR;
        value: "^" | "$";
    }

    /**
     * Represents an _Optional_ (eg `(a)?`)
     */
    export type Optional = {
        type: Types.OPTIONAL;
        value: Node;
    }
}

/**
 * Parses a regular expression into an AST.
 * 
 * @param regex A regular expression. Must not have flags or forward references
 * @returns The AST
 * 
 * @throws {SyntaxError|Error} If the regex is invalid
 * @throws {TypeError} If an unsupported feature is used
 */
export function parse(regex: RegExp): AST.Node {
    if (regex.flags != "") throw new TypeError("Regex flags not yet supported");

    const ret_ast = ret.default(regex.source);
    const raw_ast = toKleeneAST(ret_ast);
    return preprocessAST(raw_ast);
}

/**
 * Stringifies the AST into a regular expression.
 */
export function stringify(node: AST.Node) : string {
    switch (node.type) {
        case AST.Types.LITERAL:
            return ret.reconstruct(node.value);
        case AST.Types.ALTERNATION:
            return `(${node.options.map(option => stringify(option)).join("|")})`;
        case AST.Types.CONCATENATION:
            return node.values.map(value => stringify(value)).join("");
        case AST.Types.KLEENE_STAR:
            return `${stringify(node.value)}*`;
        case AST.Types.ANCHOR:
            return node.value;
        case AST.Types.OPTIONAL:
            return `${stringify(node.value)}?`;
    }
}

/**
 * Turns `ret`s AST into our AST
 * @param ret_node 
 */
function toKleeneAST(ret_node: ret.Tokens): AST.Node {
    switch (ret_node.type) {
        case ret.types.SET:
        case ret.types.RANGE:
        case ret.types.CHAR:
            return { type: AST.Types.LITERAL, value: ret_node };

        case ret.types.GROUP:
        case ret.types.ROOT: {
            if (ret_node.options) {
                return {
                    type: AST.Types.ALTERNATION,
                    options: ret_node.options.map(option => ({ type: AST.Types.CONCATENATION, values: option.map(toKleeneAST) }))
                }
            }

            if (ret_node.stack) {
                return {
                    type: AST.Types.CONCATENATION,
                    values: ret_node.stack.map(toKleeneAST)
                }
            }

            throw new Error("Unexpected - Group/Root has no options or stack");
        }

        case ret.types.REPETITION: {
            // four cases
            // 1. min = 0, max = Infinity -> KleeneStar
            // 2. min = 0, max = n -> Concatenation of Optionals
            // 3. min = n, max = Infinity -> Concatenation, then KleeneStar
            // 4. min = n, max = n Concatenation, then Concatenation of Optionals

            if (ret_node.min == 0 && ret_node.max == Infinity) {
                return {
                    type: AST.Types.KLEENE_STAR,
                    value: toKleeneAST(ret_node.value)
                }
            }

            if (ret_node.min == 0 && ret_node.max != Infinity) {
                const value = toKleeneAST(ret_node.value);
                const values = Array(ret_node.max).fill({ type: AST.Types.OPTIONAL, value })

                return {
                    type: AST.Types.CONCATENATION,
                    values
                }
            }

            if (ret_node.min != 0 && ret_node.max == Infinity) {
                const value = toKleeneAST(ret_node.value);
                const values = Array(ret_node.min).fill(value);
                values.push({ type: AST.Types.KLEENE_STAR, value });

                return {
                    type: AST.Types.CONCATENATION,
                    values
                }
            }

            if (ret_node.min != 0 && ret_node.max != Infinity) {
                const value = toKleeneAST(ret_node.value);

                // min Required + (max-min) Optional
                const required_values = Array(ret_node.min).fill(value);
                const optional_values = Array(ret_node.max - ret_node.min).fill({ type: AST.Types.OPTIONAL, value });

                return {
                    type: AST.Types.CONCATENATION,
                    values: [...required_values, ...optional_values]
                }

            }
        }

        case ret.types.POSITION: {
            switch (ret_node.value) {
                case "$":
                case "^":
                    return { type: AST.Types.ANCHOR, value: ret_node.value };
                default:
                    throw new Error(`Unexpected Anchor type - ${ret_node.value}`);
            }
        }

        case ret.types.REFERENCE: {
            throw new Error("Kleene does not support forward references");
        }
    }
}


/**
 * Our AST is suppossed to represent a regex that matches the entire string. However, JS's regex engine 
 * matches any substring. We need to append `.*` at the start and end to make it work in our representation.
 * 
 * @param ast 
 * @returns 
 */
function preprocessAST(ast: AST.Node): AST.Node {

    /** Represents a Wildcard character (eg `.`) */
    const RET_WILDCARD: ret.Set = {
        "type": ret.types.SET,
        "set": [
            { "type": ret.types.CHAR, "value": 10 },
            { "type": ret.types.CHAR, "value": 13 },
            { "type": ret.types.CHAR, "value": 8232 },
            { "type": ret.types.CHAR, "value": 8233 }
        ],
        "not": true
    };

    // Note: If the Regex Has Anchors, like `^` or `$` the added wildcars will be removed 
    // during DFA construction.
    // They are necessary in the general case, and to deal with BS like `/(a$|^b)/`. 

    return {
        type: AST.Types.CONCATENATION,
        values: [
            {
                type: AST.Types.ANCHOR,
                value: "^"
            },
            {
                type: AST.Types.KLEENE_STAR,
                value: {
                    type: AST.Types.LITERAL,
                    value: structuredClone(RET_WILDCARD)
                }
            },
            ast,
            {
                type: AST.Types.KLEENE_STAR,
                value: {
                    type: AST.Types.LITERAL,
                    value: structuredClone(RET_WILDCARD)
                }
            },
            {
                type: AST.Types.ANCHOR,
                value: "$"
            }
        ]
    }
}