

//	.
//	it also contains a bucket for properties (labels, weights, etc)

/**
 * a Graph is a set of vertices, and 0 or more edges connecting those vertices.
 * Each Vertex and Edge can have arbitrarily many props, which can be anything
 * (weights, labels, tags, key-value pairs, etc)
 * @property vertices, edges, props
 */
export interface Graph {
	vertices: Set<VertexRef>,
	edges: EdgeMap,
	props: WeakMap<VertexRef | EdgeRef, any>
	//export(): string
}


/**
 * a VertexRef is a pointer to a Vertex
 */
export type VertexRef = Symbol;
/**
 * an EdgeRef is a pointer to an Edge
 */
export type EdgeRef = Symbol;

/**
 * an EdgeMap connects an EdgeRef to two VertexRefs
 */
export type EdgeMap = Map<EdgeRef, {from: VertexRef, to: VertexRef}>;

/**
 * a Subgraph is just a graph
 * @alias Graph
 */
export type Subgraph = Graph;

//	these are closures that operate on the graph, producing a subGraph
export type EdgeQuery = (me: Graph) => Set<EdgeRef>;
export type VertexQuery = (me: Graph) => Set<VertexRef>;
export type SubgraphQuey = (me: Graph) => Graph;
