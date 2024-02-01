import { Entities } from "./entity"

/**
 * a Query is a closure over a [Graph] that operates on that Graph, returning something useful, like a [Subgraph]
 */
export interface Query<V extends object, E extends object> {
	(entities : Entities<V, E>) : Result<any>
}

/**
 * a Mutation is a Query that mutates the Graph in place.
 * It returns something useful, like the number of entities affected.
 * This is how we add, delete, and update [Edges] and [Vertices].
 */
export type Mutation<V extends object,E extends object> = Query<V, E>

/**
 * a Result is the answer to a [Query] or [Mutation]
 * a Result of type T is a Promise that resolves to a value of type T, and some metadata.
 */
export type Result<T> = Promise<[T, any]>