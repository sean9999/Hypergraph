import { newUniqueId, uniqueId } from "./uitls";

import {
	VertexRef,
	EdgeRef,
	EdgeMap,
	EdgeQuery,
	VertexQuery,
	SubgraphQuey,
	Graph
} from "./graph";

interface BagOfProps {
	id: string;
	from?: BagOfProps | VertexRef;
	to?: BagOfProps | VertexRef;
	[k: string]: unknown
}

type PropsStore = Map<VertexRef | EdgeRef, Map<string, any>>

class Hypergraph extends EventTarget implements Graph {

	public vertices: Set<VertexRef>;
	public edges: EdgeMap;
	public props: PropsStore;
	public id: uniqueId;

	constructor() {
		super();
		this.vertices = new Set();
		this.edges = new Map();
		this.props = new Map();
		this.id = newUniqueId("hypergraph/id");
	}
	toString(): string {

		const nodes : object[] = [];

		/*
		const lines : object[] = [];
		for (const kv: EdgeMap of this.edges) {
			const line = this.getProps();

		}
		*/

		for (const vert of this.vertices) {
			nodes.push(
				this.getProps(vert, this.props, false)
			);
		}
		return JSON.stringify(nodes, null, "\t");
	}
	getProps(ref: VertexRef | EdgeRef, propStore: WeakMap<VertexRef | EdgeRef, any>, recursively: boolean = false): object {
		const propsMap : Map<string, any> = propStore.get(ref);
		const props = {};
		propsMap.forEach((v, k) => {
			if (recursively) {
				switch (k) {
					case "from":
					case "to":
						props[k] = this.getProps(v, propStore, recursively);
						break;
					default:
						props[k] = v;
				}
			} else {
				props[k] = v;
			}
		});
		return props;
	}

	getSubgraph(fn: SubgraphQuey): Graph {
		return fn(this);
	}
	getEdgesWhere(fn: EdgeQuery): Set<EdgeRef> {
		const safeObj: Graph = {
			vertices: new Set(this.vertices),
			edges: new Map(this.edges),
			props: this.props
		};
		return fn(safeObj);
	}
	getVerticesWhere(fn: VertexQuery): Set<VertexRef> {
		return fn(this);
	}

	getSourceVertex(ref: EdgeRef): VertexRef | undefined {
		return this.edges.get(ref)?.from;
	}

	getTargetVertex(ref: EdgeRef): VertexRef | undefined {
		return this.edges.get(ref)?.to;
	}

	getOutgoingEdges(v: VertexRef): Set<EdgeRef> {
		const fn: EdgeQuery = (graph: Graph) => {
			const relevantEdges: Set<EdgeRef> = new Set();
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
	getIncomingEdges(v: VertexRef): Set<EdgeRef> {
		const fn: EdgeQuery = (graph: Graph) => {
			const relevantEdges: Set<EdgeRef> = new Set();
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
	getAllEdges(v: VertexRef): Set<EdgeRef> {
		const fn: VertexQuery = (graph: Graph) => {
			const relevantEdges: Set<EdgeRef> = new Set();
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

	createVertex(props: Map<string, any>): VertexRef {
		const id = newUniqueId("hypergraph/vertex");
		const v = Symbol(id);
		props.set("_id", id);
		this.vertices.add(v);
		this.props.set(v, props);
		this.trigger("addedVertex", v);
		return v;
	}
	createEdge(from: VertexRef, to: VertexRef, props: Map<string, any>): EdgeRef {
		const id = newUniqueId("hypergraph/edge");
		const e = Symbol(id);
		props.set("_id", id);
		this.edges.set(e, { from, to });
		this.props.set(e, props);
		this.trigger("addedEdge", e);
		return e;
	}
	removeEdge(e: EdgeRef) {
		this.trigger("removedEdge", e);
		this.edges.delete(e);
	}
	removeVertex(v: VertexRef): boolean {
		const has = this.vertices.has(v);
		if (has) {
			this.trigger("removedVertex", v, { has });
		} else {
			this.trigger("didNotRemoveVertex", v, { has });
		}
		return this.vertices.delete(v);
	}
	trigger(eventType: string, ref: VertexRef | EdgeRef, extra?: any): boolean {
		const eventId = newUniqueId("hypergraph/event/" + eventType);
		const props = this.getProps(ref, this.props);
		const detail = { eventType, subject: { ref, props }, eventId, extra };
		const ev = new CustomEvent("hypergraph", { detail });
		return this.dispatchEvent(ev);
	}
}

export { Hypergraph }