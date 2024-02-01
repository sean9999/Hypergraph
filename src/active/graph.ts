import { Graph } from "../graph/graph";
import { EdgeRef } from "../graph/edge";
import { VertexRef } from "../graph/vertex";
import { Query, Result } from "../graph/query";
import { Entities } from "../graph/entity";
import { ActivePropertyBag } from "./props";
import { VertexRefs } from "../graph/vertex";
import { EdgeRefs } from "../graph/edge";
import { ActiveVertex, ActiveVertices } from "./vertex";
import { ActiveEdge, ActiveEdges } from "./edge";

/**
 * All custom events will have this namespace
 */
const CUSTOM_EVENT_TYPE = "activegraph";

/**
 * Our data structure that will power the [Graph] interface.
 * Vertices and Edges are important. Everything else is for speed
 */
interface ActiveGraphState<V extends object, E extends object> extends Entities<V, E> {
	vertices: ActiveVertices<V>;
	edges: ActiveEdges<E>;
	vertexRefs: VertexRefs;
	edgeRefs: EdgeRefs;
	counter: bigint
}

/**
 * An ActiveGraph issues DOM Events when interesting things happen
 */
class ActiveGraph<V extends object, E extends object> extends EventTarget implements Graph<V,E> {
	private state: ActiveGraphState<V,E>
	constructor() {
		super();
		this.state = {
			vertices: new Map(),
			edges: new Map(),
			vertexRefs: new Set(),
			edgeRefs: new Set(),
			graphProps: new ActivePropertyBag(this, "graph"),
			counter: 0n
		}
	}
	broadcast(eventType: string, payload: any): boolean {
		const detail = { eventType, payload };
		const ev = new CustomEvent(CUSTOM_EVENT_TYPE, { detail });
		return this.dispatchEvent(ev);
	}
	insertVertex(bag: V): VertexRef {
		const vert = new ActiveVertex(this, bag);
		return vert.ref;
	}
	updateVertex(ref: VertexRef, obj: V, replace=true) {
		if (!this.state.vertexRefs.has(ref)) {
			throw Error("vertex doesn't exist");
		} else {
			const vert = this.state.vertices.get(ref)!;
			if (replace) {
				vert.props.clear();
			}
			vert.props.save(obj);
			this.state.vertices.set(vert.ref, vert);
			this.state.entityProps.set(vert.ref, vert.props);
			this.broadcast("vertex/update", {vertex: vert});
		}
	}
	deleteVertex(ref: VertexRef): boolean {
		if (this.state.vertexRefs.has(ref)) {
			//	deleting a vertex automatically deletes attached edges
			this.disconnectVertex(ref);
			this.state.vertexRefs.delete(ref);
			this.state.vertices.delete(ref);
			this.state.entityProps.delete(ref);
			this.broadcast("vertex/delete", { ref });
			return true;
		} else {
			return false;
		}
	}
	getVertex(ref: VertexRef): ActiveVertex<V> {
		return this.state.vertices.get(ref) as ActiveVertex<V>;
	}
	getEdge(ref: EdgeRef): ActiveEdge<E> {
		return this.state.edges.get(ref) as ActiveEdge<E>;
	}
	insertEdge(from: VertexRef, to: VertexRef, bag: E): EdgeRef {
		const edge = new ActiveEdge(this, from, to, bag);
		this.state.edges.set(edge.ref, edge);
		this.state.edgeRefs.add(edge.ref);
		this.broadcast("edge/create", {edge});
		return edge.ref;
	}
	// insertEdge(from : VertexRef, to : VertexRef, props: E) : EdgeRef {
	// 	if (this.state.edges.has(e.ref)) {
	// 		throw Error("edge already exists");
	// 	} else {
	// 		const edge = new ActiveEdge<E>(this, from, to, props);
	// 		edge.props.save(props);
	// 		this.state.edges.set(edge.ref, edge);
	// 		this.state.edgeRefs.add(edge.ref);
	// 		edge.props.set("i", ++this.state.counter);
	// 		this.state.entityProps.set(edge.ref, edge.props);
	// 		this.broadcast("edge/insert", {edge});
	// 		return edge.ref;
	// 	}
	// }
	updateEdge(ref: EdgeRef, props : E) {
		if (!this.state.edges.has(ref)) {
			throw Error("edge does not exist");
		} else {
			const edge = this.state.edges.get(ref)!;
			edge.props.save(props);
			this.state.edges.set(edge.ref, edge);
			this.state.edgeRefs.add(edge.ref);
			this.broadcast("edge/update", {edge});
		}
	}
	deleteEdge(ref: EdgeRef): boolean {
		if (this.state.edgeRefs.has(ref)) {
			this.state.edgeRefs.delete(ref);
			//this.state.edges.get(ref)?.props.clear();
			this.state.edges.delete(ref);
			this.broadcast("edge/delete", { ref });
			return true;
		} else {
			return false;
		}
	}
	disconnectVertex(ref: VertexRef, removeIncoming = true, removeOutgoing = true, loudly = true): number {
		//	remove edges attached to a vertex
		//	returns the number of edges removed
		if (!removeIncoming && !removeOutgoing) {
			//	no op
			return 0
		}
		let n = 0;
		const { incoming, outgoing } = this.getVertex(ref)?.Edges() || { incoming: new Map(), outgoing: new Map() };
		if (removeIncoming) {
			for (ref of incoming.keys()) {
				this.deleteVertex(ref);
			}
			n = n + incoming.size;
		}
		if (removeOutgoing) {
			for (ref of outgoing.keys()) {
				this.deleteVertex(ref);
			}
			n = n + outgoing.size;
		}
		if (n > 0) {
			this.broadcast("vertex/disconnect", { ref });
		}
		return n;
	}
	Edges(): ActiveEdges<E> {
		return this.state.edges;
	}
	Vertices(): ActiveVertices<V> {
		return this.state.vertices;
	}
	getVertexRefByIndex(i: number): VertexRef {
		//	get a vertexRef by index
		return [...this.state.vertexRefs][i];
	}
	getEdgeRefByIndex(i: number): EdgeRef {
		return [...this.state.edgeRefs][i];
	}
	Order(): number {
		return this.Edges().size;
	}
	Size(): number {
		return this.Vertices().size;
	}
	Query<ReturnType>(q: Query<V, E>): Result<ReturnType> {
		return q(this.state);
	}
	Mutate<ReturnType>(m: Query<V, E>): Result<ReturnType> {
		return m(this.state);
	}
}

export { ActiveGraph }