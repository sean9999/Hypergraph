import { Color, NodeShapeType, Orb } from '@memgraph/orb';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { Hypergraph, HypergraphEvent } from './hyper/graph';
import { Vertex, VertexRef, Vertices } from './graph/vertex';
import { EdgeRef } from './graph/edge';
import { PropertyBagStore } from './graph/props';
import { HyperVertex } from './hyper/vertex';
import { HyperEdge } from './hyper/edge';
import { UniqueId, newUniqueId } from './graph/util';

const randomName = (): string => {
	const customConfig: Config = {
		dictionaries: [adjectives, colors, animals],
		separator: ' ',
		length: 2,
	};
	return uniqueNamesGenerator(customConfig);
};

const hg = new Hypergraph();

const container: HTMLElement = document.getElementById('graph')!;

interface PolityNode {
	id: UniqueId;
	label: string;
	color: string;
	shape: string;
	size: number;
	[k : string] : any
}

interface PolityEdge {
	id: UniqueId;
	label: string;
	color: string;
	start: UniqueId;
	end: UniqueId;
}

let nodes: PolityNode[] = [];
let edges: PolityEdge[] = [];

const mapToObject = (map : Map<string, any>) : object => {
	const obj = {};
    for (let [key, value] of map) {
        obj[key] = value;
    }
    return obj;
};

const hyperVertexToPolityNode = (h: HyperVertex): PolityNode => {
	const id = h.props.get("id");
	const label = h.props.get("label");
	const color = h.props.get("color");
	const shape = h.props.get("shape");
	const size = h.props.get("size");
	return { id, label, color, shape, size };
}

const hyperEdgeToPolityEdge = (edge: HyperEdge, store: PropertyBagStore): PolityEdge => {
	const id = edge.props.get("id");
	const label = edge.props.get("label");
	const color = edge.props.get("color");
	const start = store.get(edge.from)?.get("id");
	const end = store.get(edge.to)?.get("id");
	return { id, label, start, end, color };
};

hg.state.vertices.forEach((vert) => {
	if (vert.props.get("label") === "root") {
		vert.props.set("id", newUniqueId("vertex/id"));
		vert.props.set("color", "#00DD33");
		vert.props.set("shape", "star");
		vert.props.set("size", 1);
	} else {
		nodes.push(hyperVertexToPolityNode(vert));
	}
});

hg.state.edges.forEach((edge) => {
	edges.push(hyperEdgeToPolityEdge(edge, hg.state.entityProps));
});


const orb = new Orb<PolityNode, PolityEdge>(container);

orb.view.setSettings({ simulation: { isPhysicsEnabled: true } });

// Initialize nodes and edges
orb.data.setup({ nodes, edges });

// Render and recenter the view
orb.view.render(() => {
	orb.view.recenter();
});

const styleThisVertex = (vert : Vertex) : object => {

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
		borderWidth: 0.5,
		borderColor: '#666666'
	}
}

const styleThisLink = (edge : HyperEdge) : object => {
	return {
		color: new Color(edge.props.get("color")).getDarkerColor(0.75),
		label: edge.props.get("label"),
	}
}

hg.addEventListener("hypergraph", (ev) => {
	const hyperEvent = ev as HypergraphEvent;
	switch (hyperEvent.detail.eventType) {
		case "vertex/add":
			const vertex = hyperEvent.detail.payload;
			nodes.push(hyperVertexToPolityNode(vertex));
			orb.data.merge({ nodes, edges });
			let thisNode = orb.data.getNodeById(vertex.props.get("id"));
			if (thisNode) {
				thisNode.style = styleThisVertex(vertex);
			}
			orb.view.render(() => {
				orb.view.recenter();
			});
		break;
		case "edge/add":
			const hyperEdge = hyperEvent.detail.payload;
			edges.push(hyperEdgeToPolityEdge(hyperEdge, hg.state.entityProps));
			orb.data.merge({ nodes, edges });
			let thisEdge = orb.data.getNodeById(hyperEdge.props.get("id"));
			if (thisEdge) {
				thisEdge.style = styleThisLink(hyperEdge);
			}
			orb.view.render(() => {
				orb.view.recenter();
			});
		break;
		case "vertex/delete":
			{
				const ref : VertexRef = <VertexRef>hyperEvent.detail.payload;
				const id = hg.state.vertices.get(ref)?.props.get("id");
				nodes = nodes.filter(node => (node.id !== id));
				orb.data.merge({ nodes, edges });
				orb.view.render(() => {
					orb.view.recenter();
				});
			}
		break;
		case "edge/delete":
			{
				const ref = <EdgeRef>hyperEvent.detail.payload;
				const id = hg.state.edges.get(ref)?.props.get("id");
				edges = edges.filter(edge => (id !== edge.id));
				orb.data.merge({ nodes, edges });
				orb.view.render(() => {
					orb.view.recenter();
				});
			}
		default:
			console.log("unhandled eventType " + hyperEvent.detail.eventType, hyperEvent.detail.payload);
	}
});

const randomColor = () => {
		const hexChars = '0123456789ABCDEF';
		let color = '#';
		for (let i = 0; i < 6; i++) {
			color += hexChars[Math.floor(Math.random() * 16)];
		}
		return color;
};

const randomShape = () => {
	const shapes = [
		"circle",
		"square",
		"hexagon",
		"triangle",
		"star",
		"diamond",
		"dot",
		"triangle_down"
	];
	const i = Math.floor( Math.random() * shapes.length );
	return shapes[i];
};

const addNode = (e: Event) => {
	const rname = randomName();
	const newHyperNode = new HyperVertex(hg, {
		"label": rname,
		"color": randomColor(),
		"shape": randomShape(),
		"size": Math.random() * 3
	});
	hg.insertVertex(newHyperNode);
};

const randomNumberBetweenThatsNot = (start : number = 0, end : number = 1000, omitList : number[] = []) : number => {
	const range = end - start;
	const rand = Math.floor(Math.random() * range) + start;
	if (omitList.includes(rand)) {
		return randomNumberBetweenThatsNot(start, end, omitList);
	} else {
		return rand;
	}
}

const randomlyConnectTwoNodes = async (e: Event) => {
	const i = randomNumberBetweenThatsNot(0, hg.state.vertexRefs.size);
	const j = randomNumberBetweenThatsNot(0, hg.state.vertexRefs.size, [i]);
	const from : VertexRef = [...hg.state.vertexRefs][i];
	const to : VertexRef = [...hg.state.vertexRefs][j];

	console.log({i,j,from,to});

	const hyperEdge: HyperEdge = new HyperEdge(from, to, {
		label: randomName(),
		color: randomColor()
	});
	hg.insertEdge(hyperEdge);
};

document.getElementById('randconnect')?.addEventListener('click', randomlyConnectTwoNodes);

document.getElementById('addnode')?.addEventListener('click', addNode);
