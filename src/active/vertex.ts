import { Edges } from "../graph/edge";
import { ReadableGraph } from "../graph/graph";
import { Path } from "../graph/path";
import { Vertex, VertexRef } from "../graph/vertex";
import { newUniqueId } from "../graph/util";
import { ActiveGraph } from "./graph";
import { ActivePropertyBag } from "./props";

/**
 * an ActiveVertex holds its properties in an ActivedPropertyBag,
 * which despatches mutation events to the parent Graph.
 */
export class ActiveVertex<V extends object> implements Vertex<V>  {
    graph: ActiveGraph<V, any>;
    ref: VertexRef;
    props : ActivePropertyBag<V>;
    constructor(graph : ActiveGraph<V, any>, bag : V) {
        const id = newUniqueId("vertex");
        this.ref = Symbol(id);
        this.graph = graph;
        this.props = new ActivePropertyBag<V>(graph, "vertex");
        this.props.save(bag);
        this.props.set("id", id);
    }
    Export() : V {
        return this.props.toObject() as V;
    }
    Edges(): { incoming: Edges<any>; outgoing: Edges<any>; } {
        const incoming : Edges<any> = new Map();
        const outgoing : Edges<any> = new Map();
        this.graph.Edges().forEach((edge, edgeRef) => {
            if (edge.from === this.ref) {
                outgoing.set(edgeRef, edge);
            }
            if (edge.to === this.ref) {
                incoming.set(edgeRef, edge);
            }
        });
        return {incoming, outgoing};
    }
    IsAdjascentTo(ref: VertexRef): boolean {
        const edges = this.Edges();
        edges.incoming.forEach(edge => {
            if (edge.from === ref) {
                return true;
            }
        });
        edges.outgoing.forEach(edge => {
            if (edge.to === ref) {
                return true;
            }
        });
        return false;
    }
    DistanceTo(ref: Symbol): number {
        throw Error("not implemented");
    }
    Neighbourhood(): ReadableGraph<V, any> {
        throw Error("Not implemented");
    }
    Degree(): number {
        throw Error("not implemented");
    }
    Centrality(): number {
        throw Error("not implemented");
    }
    Eccentricity(): boolean {
        throw Error("not implemented");
    }
    Betweenness(): number {
        throw Error("not implemeneted");
    }
    Reciprocity(): number {
        throw Error("not implemented");
    }
    PathTo(otherVertex: Symbol): Path {
        throw Error("not implemented");
    }

}

/**
 * Vertices is the plural of [Vertex]
 */
export type ActiveVertices<V extends object> = Map<VertexRef, ActiveVertex<V>>
