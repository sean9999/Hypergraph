import { Vertex, VertexRef, Vertices } from "./vertex"
import { EdgeRef, Edge, Edges, EdgeConstructor } from "./edge"
import { Query, Mutation, Result } from "./query"

/**
 * a Graph has 1 or more Vertices and 0 or more Edges connecting them.
 * You can query a Graph for Vertices, Edges, or a Subgraph.
 * @property state.vertices is a Map<VertexRef, Vertex>
 * @property state.edges is a Map<EdgeRef, Edge>
 * @method Edges returns Edges
 * @method Subgraph returns a Subgraph
 * @method Mutate modifies the Graph in place, returning the number of Entities affected
 */
export interface ReadableGraph<V extends object, E extends object> {
	Edges() : Edges<E>
	Vertices() : Vertices<V>
	Query<ReturnType>(q : Query<V, E>) : Result<ReturnType>
	Order() : number
	Size() : number
	getVertex(ref : VertexRef) : Vertex<V>
	getEdge(ref : EdgeRef) : Edge<E>
	//Density() : Result<number>
	//Isomorphic(otherGraph : ReadableGraph) : Result<boolean>
	//Diameter() : Result<number>
	//Connectedness() : Result<ConnectednessValue>
	//Strength() : Result<number>
	//Regularity() : Result<boolean>
}

/**
 * A Graph is a ReadableGraph that can be mutated
 */
export interface Graph<V extends object, E extends object> extends ReadableGraph<V, E> {
	Mutate<ReturnType>(m : Mutation<V,E>) : Result<ReturnType>
	deleteVertex(ref : VertexRef) : void
	deleteEdge(ref : EdgeRef) : void
	insertVertex(props : V) : VertexRef
	insertEdge(from : VertexRef, to: VertexRef, props : E) : EdgeRef
	updateVertex(ref : VertexRef, props : V) : void
	updateEdge(ref : EdgeRef, props : E) : void
}
 
/**
 * a Subgraph is just a Graph
 */
export type Subgraph<V extends object, E extends object> = ReadableGraph<V, E>

/**
 * a Graph's connectedness can only be one of these 4 values
 */
export enum ConnectednessValue {
	Disconnected,
	WeaklyConnected,
	SemiConnected,
	StronglyConnected
}