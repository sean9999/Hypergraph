import { PropertyBag } from "./props"
import { Vertices } from "./vertex"
import { Edges } from "./edge"
import { Graph } from "./graph"

/**
 * An Entity is a member of a [Graph], so either an [Edge] or a [Vertex].
 * @property [ref] is a pointer. A way to refer to this object.
 * @property [props] is a [PropertyBag], which is a loose collection of key-value pairs
 */
export interface Entity<T extends object> {
	ref: EntityRef
	props: PropertyBag<T>
	graph: Graph<T | any, any | T>
	Export() : T
}

// export interface EntityConstructor<T>{
// 	new(g : Graph<T | any, any | T>) : Entity<T>
// }

/**
 * Entities holds all the Vertices and Edges of a Graph.
 * It can also hold anything else to make queries more performant or expressive
 */
export interface Entities<V extends object, E extends object> {
	vertices : Vertices<V>
	edges : Edges<E>
	[k : string] : any
}


/**
 * An EntityRef is a pointer to (ie: a reference to) an [Entity].
 * So in practice a pointer to either an Edge or a Vertex.
 */
export type EntityRef = Symbol