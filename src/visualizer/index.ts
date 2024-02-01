import { ActiveEdge } from "../active/edge"
import { ActiveGraph } from "../active/graph"
import { ActiveVertex } from "../active/vertex"

interface GraphVisualizer<VERTEX extends object, EDGE extends object, NODE extends object, LINK extends object>{
    Init(g : ActiveGraph<VERTEX, EDGE>) : Promise<void>
    Render(g : ActiveGraph<VERTEX, EDGE>) : Promise<void>
    VertexToNode(v : ActiveVertex<VERTEX>) : NODE
    EdgeToLink(e : ActiveEdge<EDGE>) : LINK
}

export type { GraphVisualizer }