import { AST } from "ast.js";

/**
 * Yields all nodes in the syntax tree in bottom-up order. It starts at the leaves and works its way up to the start-node.
 * 
 * @param node The Node to start from (usually the root-node)
 * @yields The nodes in bottom-up order
 */
export function* bottomUpTraversal(node: AST.Node): Generator<AST.Node> {
    switch (node.type) {
        case AST.Types.OPTIONAL: { yield* bottomUpTraversal(node.value); break; }
        case AST.Types.KLEENE_STAR: { yield* bottomUpTraversal(node.value); break; }
        case AST.Types.ALTERNATION: {
            for (const option of node.options) {
                yield* bottomUpTraversal(option);
            }
            break;
        }
        case AST.Types.CONCATENATION: {
            for (const value of node.values) {
                yield* bottomUpTraversal(value);
            }
            break;
        }
    }

    yield node;
}

/**
 * Traverses through the syntax tree from the top. 
 * @param node The Node to start from (usually the root-node)
 * @yields The nodes in top-down order
 */
export function* topDownTraversal(node: AST.Node): Generator<AST.Node> {
    yield node;
    switch (node.type) {
        case AST.Types.OPTIONAL: { yield* bottomUpTraversal(node.value); break; }
        case AST.Types.KLEENE_STAR: { yield* bottomUpTraversal(node.value); break; }
        case AST.Types.ALTERNATION: {
            for (const option of node.options) {
                yield* bottomUpTraversal(option);
            }
            break;
        }
        case AST.Types.CONCATENATION: {
            for (const value of node.values) {
                yield* bottomUpTraversal(value);
            }
            break;
        }
    }
}