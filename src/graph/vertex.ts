import { Entity, EntityRef } from "./entity"
import { PropertyBag } from "./props"
import { Graph, Subgraph } from "./graph"
import { Path } from "./path"
import { Edges } from "./edge"


export interface VertexConstructor<V extends object>{
	new(n : Graph<V, any>, props : V) : Vertex<V>
}

/**
 * A Vertex is an [Entity] on the Graph.
 * It can contain properties (via PropertyBag) and be associated to another Vertex via an [Edge]
 */
export interface Vertex<V extends object> extends Entity<V> {
	ref: VertexRef
	props: VertexPropertyBag<V>
	graph : Graph<V, any>
	Export() : V
	Edges() : {incoming: Edges<any>, outgoing: Edges<any>}
	IsAdjascentTo(ref: VertexRef) : boolean
	DistanceTo(ref: VertexRef) : number
	Neighbourhood() : Subgraph<V, any>
	Degree() : number
	Centrality() : number
	Eccentricity() : boolean
	Betweenness() : number
	Reciprocity() : number
	PathTo(otherVertex : VertexRef) : Path
}

/**
 * Vertices is the plural of [Vertex]
 */
export type Vertices<T extends object> = Map<VertexRef, Vertex<T>>

/**
 * a VertexRef is a pointer (reference) to a Vertex
 */
export type VertexRef = EntityRef

/**
 * VertexRefs is a Set of VertexRef
 */
export type VertexRefs = Set<VertexRef>

/**
 * a VertexPropertyBag holds a bunch of data for a [Vertex]
 */
interface VertexPropertyBag<T extends object> extends PropertyBag<T>{}