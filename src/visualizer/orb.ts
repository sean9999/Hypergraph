import { ActiveGraph } from "../active/graph"
import { IEdgeBase, INodeBase, Orb } from "@memgraph/orb";
import { ActiveEdge } from "../active/edge";
import { ActiveVertex } from "../active/vertex";

interface OrbVisualizer<VERTEX extends object, EDGE extends object, NODE extends INodeBase, LINK extends IEdgeBase>{
    orb : Orb
    Init(g : ActiveGraph<VERTEX, EDGE>) : Promise<void>
    Render(g : ActiveGraph<VERTEX, EDGE>) : Promise<void>
    VertexToNode(v : ActiveVertex<VERTEX>) : NODE
    EdgeToLink(e : ActiveEdge<EDGE>) : LINK
}

export type { OrbVisualizer }