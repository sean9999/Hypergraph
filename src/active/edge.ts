import { Edge, EdgeRef } from "../graph/edge";
import { newUniqueId } from "../graph/util";
import { VertexRef } from "../graph/vertex";
import { ActiveGraph } from "./graph";
import { ActivePropertyBag } from "./props";
import { ActiveVertex } from "./vertex";

/**
 * Edges is the plural of [Edge]
 */
export type ActiveEdges<E extends object> = Map<EdgeRef, ActiveEdge<E>>

/**
 * An ActiveEdge holds an EventedPropertyBag, which contains
 * a reference to the parent Graph, where it will despatch events
 */
export class ActiveEdge<E extends object> implements Edge<E>  {
    ref : EdgeRef;
    from : VertexRef;
    to : VertexRef;
    props : ActivePropertyBag<E>;
    graph : ActiveGraph<any, E>;
    constructor(graph : ActiveGraph<any, E>, from : VertexRef, to : VertexRef, bag : E) {
        const id = newUniqueId("edge");
        this.ref = Symbol(id);
        this.from = from;
        this.to = to;
        this.graph = graph;
        this.props = new ActivePropertyBag<E>(graph, "edge");
        this.props.save(bag);
        this.props.set("id", id);
    }
    Export() : E {
        return this.props.toObject() as E;
    }
    From() : ActiveVertex<any> {
        return this.graph.getVertex(this.from) as ActiveVertex<any>;
    }
    To() : ActiveVertex<any> {
        return this.graph.getVertex(this.to) as ActiveVertex<any>;
    }
}
