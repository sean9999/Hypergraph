import { IEdgeBase, INodeBase } from "@memgraph/orb";
import { ActiveGraph } from "./active/graph";
import { UniqueId } from "./graph/util";
import { VertexRef } from "./graph/vertex";
import { OrbVisualizer } from "./visualizer/orb";
import { MyOrbVisualizer } from "./visualizer/myorb";

interface MyVertex {
    id: UniqueId
    label: string
    color: string
    shape: string
    size: number
    i?: bigint
}

interface MyEdge {
    id: UniqueId
    label: string
    weight?: number
    color: string
    from: VertexRef
    to: VertexRef
}

interface MyNode extends INodeBase {
    id: UniqueId;
    label: string;
    color: string;
    shape: string;
    size: number;
    i: bigint;
    [k: string]: any
}

interface MyLink extends IEdgeBase {
    id: UniqueId;
    label: string;
    color: string;
    start: UniqueId;
    end: UniqueId;
    i: bigint
    [k: string]: any
}

const g = new ActiveGraph<MyVertex, MyEdge>()

const div = document.getElementById('graph')!;

const vis = new MyOrbVisualizer<MyVertex, MyEdge, MyNode, MyLink>(div);
