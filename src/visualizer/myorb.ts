import { Color, IEdgeBase, INodeBase, Orb, NodeShapeType } from "@memgraph/orb";
import { ActiveGraph } from "../active/graph";
import { ActiveEdge } from "../active/edge";
import { ActiveVertex } from "../active/vertex";
import { OrbVisualizer } from "./orb";

class MyOrbVisualizer<V extends object, E extends object, N extends INodeBase, L extends IEdgeBase> implements OrbVisualizer<V, E, N, L> {
	orb: Orb<N, L>;
	constructor(container: HTMLElement) {
		this.orb = new Orb<N, L>(container);
	}
	Init(g: ActiveGraph<V, E>) {
		return Promise.reject("not implemented");
	}
	Render(g: ActiveGraph<V, E>) {
		return Promise.reject("not implemented");
	}
	VertexToNode(v: ActiveVertex<V>): N {
		throw Error("not implemented");
	}
	EdgeToLink(e: ActiveEdge<E>): L {

		throw Error("not implemented");
	}
	styleLink(edge: ActiveEdge<E>) : object {
		return {
			color: new Color(edge.props.get("color")).getDarkerColor(0.75),
			label: edge.props.get("label"),
		}
	}
	styleNode(vert : ActiveVertex<V>) : object {
		let shape = NodeShapeType.CIRCLE;
		switch (vert.props.get("shape")) {
			case "hexagon":
				shape = NodeShapeType.HEXAGON;
			break;
			case "square":
				shape = NodeShapeType.SQUARE;
			break;
			case "star":
				shape = NodeShapeType.STAR;
			break;
			case "diamond":
				shape = NodeShapeType.DIAMOND;
			break;
			case "triangle":
				shape = NodeShapeType.TRIANGLE;
			break;
			case "triangle_down":
				shape = NodeShapeType.TRIANGLE_DOWN;
			break;
			case "dot":
				shape = NodeShapeType.DOT;
			break;
		}
		return {
			color: new Color(vert.props.get("color")),
			shape,
			size: vert.props.get("size"),
			label: vert.props.get("label"),
			borderWidth: 0.666,
			borderColor: '#333333'
		}
	}
}

export { MyOrbVisualizer };
