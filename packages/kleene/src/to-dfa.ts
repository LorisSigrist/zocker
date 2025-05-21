import ret, { type Root, type Tokens, types, reconstruct } from "ret";

/**
 * This function takes in a regex and returns an equivalent Deterministic Finite Automaton
 * @param regex A regular expression
 * @returns A Deterministic Finite Automaton
 */
export function toDFA(regex: RegExp) {
    // We're using the algorithms from section 3.9 of the Dragon Book
    // to turn regexes into DFAs directly, without going through an NFA first.
    //
    // There are four steps
    // 1. Parse the regex into a syntax tree
    // 2. Compute nullable, firstpos, and lastpos for each node in the syntax tree
    // 3. Compute follow-pos for each node in the syntax tree
    // 4. Use the follow-pos to construct the DFA

    // For now we use ret to parse the regex
    const syntax_tree = ret(regex.source);
    //console.log(syntax_tree);
    const metadata = getSyntaxTreeMetadata(syntax_tree);
}

/**
 * Represents Metadata about a Node in the Syntax Tree
 */
type NodeMetadata = {
    /** If this node is _nullable_, meaning it can be satisfied by the empty string */
    nullable: boolean,
    /** The set of literal tokens that may be matched first by this node (assuming the input isn't the empty string) */
    firstpos: Set<Tokens>,
    /** The set of literal tokens that may be matched last by this node (assuming the input isn't the empty string) */
    lastpos: Set<Tokens>
}

/**
 * This function takes in a syntax tree & calculates `nullable`, `firstPos` and `lastPos` for each node in the tree.
 * All three properties can be computed by iterating over the tree bottom-up, so we calculate them together.
 * 
 */
function getSyntaxTreeMetadata(syntax_tree: Root): Map<Tokens, NodeMetadata> {
    const metadata = new Map<Tokens, NodeMetadata>();

    for (const node of bottomUpTraversal(syntax_tree)) {
        const nullable = isNullable(node, metadata);
        const firstpos = firstPos(node, metadata);
        const lastpos = lastPos(node, metadata);
        metadata.set(node, { nullable, firstpos, lastpos });

        console.log("node", reconstruct(node));
        console.debug("nullable", nullable);
        console.debug("firstpos", [...firstpos].map(reconstruct))
        console.debug("lastpos", [...lastpos].map(reconstruct))
        console.debug("\n");
    }

    return metadata;
}

function lastPos(node: Tokens, metadata: Map<Tokens, NodeMetadata>): Set<Tokens> {

    function getLastPosForConcatenation(concatenation: Tokens[], metadata: Map<Tokens, NodeMetadata>): Set<Tokens> {
        let lastPos = new Set<Tokens>();

        for (let i = concatenation.length - 1; i >= 0; i--) {
            const child = concatenation[i];
            const is_nullable = metadata.get(child)!.nullable;
            const child_lastpos = metadata.get(child)!.lastpos;

            if (is_nullable) {
                lastPos = mergeSets(lastPos, child_lastpos);
            } else {
                lastPos = mergeSets(lastPos, child_lastpos);
                break;
            }
        }

        return lastPos;
    }

    switch (node.type) {
        // Literals can only be themselves
        case types.CHAR: return new Set([node]);
        case types.SET: return new Set([node]);
        case types.RANGE: return new Set([node]);

        case types.REPETITION: {
            return metadata.get(node.value)!.lastpos;
        }

        case types.ROOT:
        case types.GROUP: {
            if (node.options) {
                // alternation 
                // firstPos = firstpos(C1) U firstpos(C2) U ...
                return node.options.reduce(
                    (acc, option) => mergeSets(acc, getLastPosForConcatenation(option, metadata)),
                    new Set<Tokens>()
                );
            }
            if (node.stack) {
                // concatenation
                // lastpos = if nullable(c2) then firstPos(c1) U firstPos(c2) else firstPos(c2)
                return getLastPosForConcatenation(node.stack, metadata);
            }
        }
    }

    throw new Error("firstPos not implemented for node type " + node.type);
}

function firstPos(node: Tokens, metadata: Map<Tokens, NodeMetadata>): Set<Tokens> {

    function getFirstPosForConcatenation(concatenation: Tokens[], metadata: Map<Tokens, NodeMetadata>): Set<Tokens> {
        let firstPos = new Set<Tokens>();

        for (const child of concatenation) {
            const is_nullable = metadata.get(child)!.nullable;
            const child_firstpos = metadata.get(child)!.firstpos;

            if (is_nullable) {
                firstPos = mergeSets(firstPos, child_firstpos);
            } else {
                firstPos = mergeSets(firstPos, child_firstpos);
                break;
            }
        }

        return firstPos;
    }

    switch (node.type) {
        case types.CHAR: return new Set([node]);
        case types.SET: return new Set([node]);
        case types.RANGE: return new Set([node]);

        case types.REPETITION: {
            return metadata.get(node.value)!.firstpos;
        }

        case types.ROOT:
        case types.GROUP: {
            if (node.options) {
                // alternation 
                // firstPos = firstpos(C1) U firstpos(C2) U ...
                return node.options.reduce(
                    (acc, option) => mergeSets(acc, getFirstPosForConcatenation(option, metadata)),
                    new Set<Tokens>()
                );
            }
            if (node.stack) {
                // concatenation
                // firstPos = if nullable(c1) then firstPos(c1) U firstPos(c2) else firstPos(c1)
                return getFirstPosForConcatenation(node.stack, metadata);
            }
        }
    }

    throw new Error("firstPos not implemented for node type " + node.type);
}

/**
 * A node is nullable if it can match the empty string (it doesnt have to ONLY match the empty string).
 * This function checks if a node is nullable. It assumes that the metadata of the children is already computed.
 */
function isNullable(node: Tokens, metadata: Map<Tokens, NodeMetadata>) {
    switch (node.type) {
        case types.CHAR: return false;
        case types.SET: return false;

        case types.REPETITION: {
            if (node.min === 0) return true;
            const child = metadata.get(node.value);
            if (!child) throw new Error("Child not found");
            return child.nullable;
        }

        case types.ROOT:
        case types.GROUP: {
            if (node.options) {
                const one_option_nullable = node.options.some((option) => option.every((child) => metadata.get(child)!.nullable));
                return one_option_nullable;
            }

            if (node.stack) {
                if (node.stack.length === 0) return true;
                const all_children_nullable = node.stack.every((child) => metadata.get(child)!.nullable);
                return all_children_nullable;
            }
        }
        case types.RANGE: {
            return false;
        }
    }


    // TODO
    return false;
}

function logToken(token: Tokens) {
    let name;
    switch (token.type) {
        case types.CHAR: name = "CHAR"; break;
        case types.SET: name = "SET"; break;
        case types.REPETITION: name = "REPETITION"; break;
        case types.ROOT: name = "ROOT"; break;
        case types.GROUP: name = "GROUP"; break;
        case types.RANGE: name = "RANGE"; break;
        default: name = "UNKNOWN";
    }

    console.log(name, JSON.stringify(token));
}

/**
 * Yields all nodes in the syntax tree in bottom-up order. It starts at the leaves and works its way up to the start-node.
 * @param node The Node to start from (usually the root-node)
 * @yields The nodes in bottom-up order
 */
function* bottomUpTraversal(node: Tokens): Generator<Tokens> {
    switch (node.type) {
        case types.REPETITION: {
            yield* bottomUpTraversal(node.value);
            break;
        }

        case types.ROOT:
        case types.GROUP: {
            if (node.options) {
                for (const option of node.options) {
                    for (const child of option) {
                        yield* bottomUpTraversal(child);
                    }
                }
            }

            if (node.stack) {
                for (const child of node.stack) {
                    yield* bottomUpTraversal(child);
                }
            }
            break;
        }
    }

    yield node;
}

function mergeSets(set1: Set<Tokens>, set2: Set<Tokens>) {
    return new Set([...set1, ...set2]);
}