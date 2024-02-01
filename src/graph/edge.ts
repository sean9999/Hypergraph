import { VertexRef } from "./vertex"
import { PropertyBag } from "./props"
import { Graph } from "./graph"

/**
 * an EdgeRef is a pointer (reference) to an Edge
 */
export type EdgeRef = Symbol

export type EdgeRefs = Set<EdgeRef>

/**
 * EdgePropertyBag is a [PropertyBag] that applies specifically to an [Edge]
 */
interface EdgePropertyBag<E extends object> extends PropertyBag<E>{}

export interface EdgeConstructor<V extends object, E extends object> {
	new(g : Graph<V, E>) : Edge<E>
}

/**
 * an Edge connects one [Vertex] to another.
 * It also contains an [EdgePropertyBag] which may hold meaningful data, or be empty.
 */
export interface Edge<E extends object> {
	ref: EdgeRef
	from : VertexRef
	to : VertexRef
	props : EdgePropertyBag<E>
	graph : Graph<any, E>
	Export() : E
}

/**
 * Edges is plural of [Edge].
 */
export type Edges<T extends object> = Map<EdgeRef, Edge<T>>