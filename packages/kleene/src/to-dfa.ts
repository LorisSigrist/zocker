import ret, { type Root, type Tokens, types } from "ret";

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
    const metadata = markNullableFirstPosAndLastPos(syntax_tree);
}

type NodeMetadata = {
    nullable: boolean,
    firstpos: number,
    lastpos: number
}

/**
 * This function takes in a syntax tree & calculates `nullable`, `firstPos` and `lastPos` for each node in the tree.
 * All three properties can be computed by iterating over the tree bottom-up, so we calculate them together.
 * 
 */
function markNullableFirstPosAndLastPos(syntax_tree: Root): Map<Tokens, NodeMetadata> {
    const metadata = new Map<Tokens, NodeMetadata>();

    for (const node of bottomUpTraversal(syntax_tree)) {
        const nullable = isNullable(node, metadata);
        metadata.set(node, { nullable, firstpos: 0, lastpos: 0 });
        logToken(node);
        console.log("nullable", nullable);
        console.log("\n");
    }

    return metadata;
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
        case types.ROOT: {
            if (!node.stack || node.stack.length === 0) return true;
            const all_children_nullable = node.stack.every((child) => metadata.get(child)!.nullable);
            return all_children_nullable;
        }

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
        case types.ROOT: {
            if (!node.stack) break;
            for (const child of node.stack) {
                yield* bottomUpTraversal(child);
            }
            break;
        }

        case types.REPETITION: {
            yield* bottomUpTraversal(node.value);
            break;
        }

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