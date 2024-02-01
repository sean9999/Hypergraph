import { EdgeRef } from "./edge"
import { VertexRef } from "./vertex"

interface step {
	me: VertexRef | EdgeRef
	to: VertexRef | EdgeRef | null      //  null indicates last vertex  ( tailVert )
	from: VertexRef | EdgeRef | null    //  null indicates first vertex ( headVert )
	Valid() : boolean
}

export type Path = step[]