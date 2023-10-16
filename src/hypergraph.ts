
export type uniqueId = string;
const newUniqueId = (prefix: string): uniqueId => {
	const hexes = self.crypto.randomUUID().split('-');
	hexes.pop();
	hexes.pop();
	hexes[0] = prefix;
	return hexes.join('-');
}

export type Vertex = Symbol;
export type Edge = Symbol;
type EdgeMap = Map<Edge, {from: Vertex, to: Vertex}>;
type EdgeQuery = (me: Hypergraph) => Set<Edge>;
type VertexQuery = (me: Hypergraph) => Set<Vertex>;
type SubgraphQuey = (me: Hypergraph) => Hypergraph;

class Hypergraph extends EventTarget {

	vertices: Set<Vertex>;
	edges: EdgeMap;
	props: WeakMap<Vertex | Edge, any>;

	constructor(){
		super();
		this.vertices = new Set();
		this.edges = new Map();
		this.props = new WeakMap();
	}
	getProps(ref: Vertex | Edge, recursively: boolean = false) : any {
		const props = this.props.get(ref);
		if (props !== null && recursively && "from" in props && typeof props.from === "symbol") {
			props.from = this.getProps(props.from);
			props.to = this.getProps(props.to);
		}
		return props;
	}

	getSubgraph(fn: SubgraphQuey) : Hypergraph {
		return fn(this);
	}
	getEdgesWhere(fn: EdgeQuery) : Set<Edge> {
		return fn(this);
	}
	getVerticesWhere(fn: VertexQuery) : Set<Vertex> {
		return fn(this);
	}

	getSourceVertex(ref : Edge) : Vertex | undefined {
		return this.edges.get(ref)?.from;
	}

	getTargetVertex(ref : Edge) : Vertex | undefined {
		return this.edges.get(ref)?.to;
	}

	getOutgoingEdges(v : Vertex) : Set<Edge> {
		const fn : EdgeQuery = (graph: Hypergraph) => {
			const relevantEdges : Set<Edge> = new Set();
			const iter = graph.edges.entries();
			let result = iter.next();
			while (!result.done) {
				const [edgeRef, object] = result.value;
				if (object.from === v) {
					relevantEdges.add(edgeRef);
				}
			}
			return relevantEdges;
		};
		return this.getEdgesWhere(fn);
	}
	getIncomingEdges(v : Vertex) : Set<Edge> {
		const fn : EdgeQuery = (graph: Hypergraph) => {
			const relevantEdges : Set<Edge> = new Set();
			const iter = graph.edges.entries();
			let result = iter.next();
			while (!result.done) {
				const [edgeRef, object] = result.value;
				if (object.to === v) {
					relevantEdges.add(edgeRef);
				}
			}
			return relevantEdges;
		};
		return this.getEdgesWhere(fn);
	}
	getAllEdges(v : Vertex) : Set<Edge> {
		const fn : VertexQuery = (graph: Hypergraph) => {
			const relevantEdges : Set<Edge> = new Set();
			const iter = graph.edges.entries();
			let result = iter.next();
			while (!result.done) {
				const [edgeRef, object] = result.value;
				if (object.to === v || object.from === v) {
					relevantEdges.add(edgeRef);
				}
			}
			return relevantEdges;
		};
		return this.getEdgesWhere(fn);
	}


	addVertex(props: any) : Vertex {
		const id = newUniqueId("hypergraph/vertex");
		const v = Symbol(id);
		this.vertices.add(v);
		this.props.set(v, props);
		this.trigger("addedVertex", v);
		return v;
	}
	addEdge(from: Vertex, to: Vertex, props: any) : Edge {
		const id = newUniqueId("hypergraph/edge");
		const e = Symbol(id);
		this.edges.set(e, {from, to});
		this.props.set(e, props);
		this.trigger("addedEdge", e);
		return e;
	}
	removeEdge(e :Edge) {
		this.trigger("removedEdge", e);
		this.edges.delete(e);
	}
	removeVertex(v: Vertex) : boolean {
		const has = this.vertices.has(v);
		if (has) {
			this.trigger("removedVertex", v, {has});
		} else {
			this.trigger("didNotRemoveVertex", v, {has});
		}
		return this.vertices.delete(v);
	}
	trigger(eventType: string, ref: Vertex | Edge, extra?: any) : boolean {
		const eventId = newUniqueId("hypergraph/event/" + eventType);
		const props = this.getProps(ref, true);
		const detail = { eventType, subject: {ref, props}, eventId, extra };
		const ev = new CustomEvent("hypergraph", {detail});
		return this.dispatchEvent(ev);
	}
}

export {Hypergraph, newUniqueId }