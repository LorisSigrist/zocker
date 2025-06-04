import { AST, stringifyWithHighlight } from "./ast.js";
import { bottomUpTraversal, topDownTraversal } from "ast-traversal.js";

/**
 * This function takes in a regex and returns an equivalent Deterministic Finite Automaton
 * @param regex A regular expression
 * @returns A Deterministic Finite Automaton
 */
export function toDFA(ast: AST.Node) {
    // We're using the algorithms from section 3.9 of the Dragon Book
    // to turn regexes into DFAs directly, without going through an NFA first.
    //
    // There are four steps
    // 1. Compute nullable, firstpos, and lastpos for each node in the syntax tree
    // 2. Compute follow-pos for each node in the syntax tree
    // 3. Use the follow-pos to construct the DFA

    const metadata = generateASTMetadata(ast);
    const followpos = getFollowPos(ast, metadata);
    const dfa = constructDFAFromFollowPos(ast, metadata, followpos);
    return dfa;
}

type DFA = {
    states: Map<bigint, DFAState>, // Maps state id to DFAState
    startState: bigint, // The id of the start state
}

type DFAState = {
    /** 
     * A bitmask representing the set of leaf nodes in this state.
     * @exampel nodes: [a, b, c] -> a.id | b.id | c.id
     */
    id: bigint,

    /**
     * If this state is an accepting state.
     * An accepting state is a state that can appear as the last state in a successful match.
     */
    accepting: boolean,

    /**
     * The transitions from this state to other states.
     * The key is the character that triggers the transition, and the value is the id of the target state.
     */
    transitions: Map<string, bigint>,
}

/**
 * Constructs a DFA from the followpos map.
 */
function constructDFAFromFollowPos(
    syntax_tree: AST.Node,
    metadata: Map<AST.Node, NodeMetadata>,
    followpos: FollowPosMap,
): void {
    // A node is reachable from the start state if it is in the firstpos of the root node.
    // A node is accepting if it is in the lastpos of the root node.

    const start_state = {
        id: 0n, // The start state represents no nodes, so its id is 0
        accepting: metadata.get(syntax_tree)!.lastpos.size > 0,
        transitions: new Map<string, bigint>(),
    }

    const states = new Map<bigint, DFAState>();
    states.set(start_state.id, start_state);

    // for each node that is reachable, explore it
    console.assert(metadata.has(syntax_tree), "Metadata for the root node is missing");
    const reachableNodes = metadata.get(syntax_tree)!.firstpos;

    const alphabet = new Set<number>();
    for (const node of reachableNodes) {
        console.log(node);
    }

    for (const node of reachableNodes) {
        switch (node.type) {
            case AST.Types.LITERAL: {

            }
            case AST.Types.ANCHOR: {
            }
        }
    }
}

type FollowPosMap = Map<AST.LeafNode, Set<AST.LeafNode>>

/**
 * Given a syntax tree + first/lastpos metadata, compute followpos for each literal in the regex.
 * 
 * @param syntax_tree 
 * @param metadata 
 */
function getFollowPos(syntax_tree: AST.Node, metadata: Map<AST.Node, NodeMetadata>): FollowPosMap {
    // 1. For each concat node: 
    //   - If i is in the second child's firstpos, then i is in the followpos for each of the first child's lastpos.
    // 2. For each kleene star node:
    //   - If i is in the firstpos of the child, then i is in the followpos for each of the child's lastpos.
    // 3. For Start-Anchors:
    //  - The Start Anchor is never in the followpos of any literal. It is only reachable from the start state of the DFA.
    // 4. For End-Anchors:
    //  - The End Anchor never has a followpos, because it is the end of the regex.

    function addFollowPos(node: AST.LeafNode, newFollowPos: AST.LeafNode) {

        // Start anchors are never in the followpos of any node that isn't itself a start anchor
        if (
            newFollowPos.type === AST.Types.ANCHOR && newFollowPos.value === "^"
            && (node.type !== AST.Types.ANCHOR || node.value !== "^")
        ) return;

        // End anchors never have a followpos, unless it is itself an end anchor
        if (node.type === AST.Types.ANCHOR && node.value === "$") return;


        if (!followpos.has(node)) {
            followpos.set(node, new Set());
        }
        followpos.get(node)!.add(newFollowPos);
    }

    const followpos: FollowPosMap = new Map();
    for (const node of topDownTraversal(syntax_tree)) {
        switch (node.type) {
            case AST.Types.CONCATENATION: {
                // For each child, we add the firstpos of the next non-nullable child, 
                // and the firstpos of all nullable children in between
                // to the followpos of each leaf in the lastpos of the current child.

                for (let i = 0; i < node.values.length; i++) {
                    const child = node.values[i]!;
                    console.assert(child, "Concatenation node has undefined index %d", i);

                    const child_metadata = metadata.get(child)!;
                    console.assert(child_metadata, "Metadata is missing for %s", stringifyWithHighlight(syntax_tree, child));


                    // loop over the following children
                    for (let j = i + 1; j < node.values.length; j++) {
                        const following_child = node.values[j]!;
                        const is_nullable = metadata.get(following_child)!.nullable;
                        // if it is nullable, add the following child's firstpos 
                        // to the followpos of each lastpos of the current child
                        for (const lastpos of child_metadata.lastpos) {
                            for (const firstpos of metadata.get(following_child)!.firstpos) {
                                addFollowPos(lastpos, firstpos);
                            }
                        }

                        if (!is_nullable) {
                            // This was the first non-nullable following child, so we can stop here
                            break;
                        }
                    }

                }

                break;
            }
            case AST.Types.KLEENE_STAR: {

                // add every firstpos of the node to the followpos of each lastpos of the node
                const node_metadata = metadata.get(node.value)!;
                console.assert(node_metadata, "Metadata is missing for %s", stringifyWithHighlight(syntax_tree, node));

                for (const child_lastpos of node_metadata.lastpos) {
                    const child_metadata = metadata.get(node.value)!;
                    console.assert(child_metadata, "Metadata is missing for %s", stringifyWithHighlight(syntax_tree, node.value));

                    for (const firstpos of child_metadata.firstpos) {
                        addFollowPos(child_lastpos, firstpos);
                    }
                }
                break;
            }

            default: continue; // We only care about concatenation and kleene star nodes for followpos
        }
    }

    return followpos;
}

/**
 * Represents Metadata about a Node in the Syntax Tree
 */
type NodeMetadata = {
    /** If this node is _nullable_, meaning it can be satisfied by the empty string */
    nullable: boolean,
    /** The set of literal tokens that may be matched first by this node (assuming the input isn't the empty string) */
    firstpos: Set<AST.Literal | AST.Anchor>,
    /** The set of literal tokens that may be matched last by this node (assuming the input isn't the empty string) */
    lastpos: Set<AST.Literal | AST.Anchor>
}

/**
 * This function takes in a syntax tree & calculates `nullable`, `firstPos` and `lastPos` for each node in the tree.
 * All three properties can be computed by iterating over the tree bottom-up, so we calculate them together.
 * 
 */
function generateASTMetadata(syntax_tree: AST.Node): Map<AST.Node, NodeMetadata> {
    const metadata = new Map<AST.Node, NodeMetadata>();

    for (const node of bottomUpTraversal(syntax_tree)) {
        const nullable = isNullable(node, metadata);
        const firstpos = firstPos(node, metadata);
        const lastpos = lastPos(node, metadata);
        metadata.set(node, { nullable, firstpos, lastpos });
    }

    return metadata;
}

function lastPos(node: AST.Node, metadata: Map<AST.Node, NodeMetadata>): Set<AST.LeafNode> {

    function getLastPosForConcatenation(concatenation: AST.Node[], metadata: Map<AST.Node, NodeMetadata>): Set<AST.LeafNode> {
        let lastPos = new Set<AST.LeafNode>();

        for (let i = concatenation.length - 1; i >= 0; i--) {
            const child = concatenation[i]!;

            const child_metadata = metadata.get(child)!;
            console.assert(child_metadata, "Metadata is missing for %s", stringifyWithHighlight(node, child));

            if (child_metadata.nullable) {
                lastPos = mergeSets(lastPos,  child_metadata.lastpos);
            } else {
                lastPos = mergeSets(lastPos,  child_metadata.lastpos);
                break;
            }
        }

        return lastPos;
    }

    switch (node.type) {
        // Literals can only be themselves
        case AST.Types.LITERAL:
        case AST.Types.ANCHOR: return new Set([node]);

        case AST.Types.OPTIONAL:
        case AST.Types.KLEENE_STAR: {
            const child_metadata = metadata.get(node.value)!;
            console.assert(child_metadata, "Metadata is missing for %s", stringifyWithHighlight(node, node.value));
            return child_metadata.lastpos;
        }

        case AST.Types.ALTERNATION: {
            // The LastPos of an alternation is the union of the LastPos of all its options
            return node.options.map(opt => {
                const option_metadata = metadata.get(opt)!;
                console.assert(option_metadata, "Metadata is missing for %s", stringifyWithHighlight(node, opt));
                return option_metadata;
            }).reduce(
                (acc, option) => mergeSets(acc, option.lastpos),
                new Set<AST.LeafNode>()
            )
        }

        // The LastPos of a concatenation is the LastPos of the last non-nullable child
        // unioned with the LastPos of all nullable children after it.
        case AST.Types.CONCATENATION: return getLastPosForConcatenation(node.values, metadata);
    }
}

function firstPos(node: AST.Node, metadata: Map<AST.Node, NodeMetadata>): Set<AST.Literal | AST.Anchor> {

    function getFirstPosForConcatenation(concatenation: AST.Node[], metadata: Map<AST.Node, NodeMetadata>): Set<AST.Literal | AST.Anchor> {
        let firstPos = new Set<AST.Literal | AST.Anchor>();

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
        case AST.Types.LITERAL:
        case AST.Types.ANCHOR: return new Set([node]);

        case AST.Types.KLEENE_STAR:
        case AST.Types.OPTIONAL: return metadata.get(node.value)!.firstpos;

        case AST.Types.ALTERNATION: {
            // firstPos = firstpos(C1) U firstpos(C2) U ...
            return node.options.reduce(
                (acc, option) => mergeSets(acc, metadata.get(option)!.firstpos),
                new Set<AST.Literal | AST.Anchor>()
            );
        }

        case AST.Types.CONCATENATION: {
            // firstPos = if nullable(c1) then firstPos(c1) U firstPos(c2) else firstPos(c1)
            return getFirstPosForConcatenation(node.values, metadata);
        }

    }
}

/**
 * A node is nullable if it can match the empty string (it doesnt have to ONLY match the empty string).
 * This function checks if a node is nullable. It assumes that the metadata of the children is already computed.
 */
function isNullable(node: AST.Node, metadata: Map<AST.Node, NodeMetadata>): boolean {
    switch (node.type) {
        case AST.Types.LITERAL: return false;  // Literals are never nullable
        case AST.Types.KLEENE_STAR: return true;   // Kleene star is always nullable
        case AST.Types.OPTIONAL: return true; // Optional is always nullable

        case AST.Types.ALTERNATION: {
            // An Alternation is nullable if at least one of its options is nullable
            return node.options.some(option => metadata.get(option)!.nullable);
        }

        case AST.Types.CONCATENATION: {
            // A Concatenation is nullable if all of its children are nullable
            return node.values.every(value => metadata.get(value)!.nullable);
        }

        // Anchors should not be nullable
        case AST.Types.ANCHOR: return false;
    }
}


/**
 * Returns a new set that is the union of the two sets.
 * 
 * @param set1 firstSet
 * @param set2 secondSet
 * @returns firstSet ∪ secondSet
 */
function mergeSets<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    return new Set([...set1, ...set2]);
}

/**
 * Turns a set of leaf nodes into a bitmask.
 * 
 * This lets us use sets as keys in a map, which is useful for the DFA construction.
 * 
 * @param set 
 * @returns 
 */
function leafNodeSetToMask(set: Set<AST.LeafNode>): bigint {
    let mask = BigInt(0);
    for (const node of set) {
        mask |= node.id;
    }
    return mask;
}
