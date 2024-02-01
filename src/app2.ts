import { Color, NodeShapeType, Orb, OrbEventType } from '@memgraph/orb';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { ActiveEdge } from "./active/edge";
import { ActiveGraph } from "./active/graph";
import { ActiveVertex } from "./active/vertex";
import { UniqueId } from './graph/util';
import { ActiveEvent } from './active/event';
import { VertexRef } from './graph/vertex';
import { EdgeRef } from './graph/edge';

const g = new ActiveGraph();

const node1 = new ActiveVertex(g, {label: "node1"});
const node2 = new ActiveVertex(g, {label: "node2"});

const edge1 = new ActiveEdge(g, node1.ref, node2.ref, {strength: 5, kind: "likes"});

g.insertVertex(node1);
g.insertVertex(node2);
g.insertEdge(edge1);

node1.props.set("drama", "queen");

const container: HTMLElement = document.getElementById('graph')!;

const randomName = (): string => {
	const customConfig: Config = {
		dictionaries: [adjectives, colors, animals],
		separator: ' ',
		length: 2,
	};
	return uniqueNamesGenerator(customConfig);
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

const styleThisLink = (edge : ActiveEdge) : object => {
	return {
		color: new Color(edge.props.get("color")).getDarkerColor(0.75),
		label: edge.props.get("label"),
	}
}

const styleThisVertex = (vert : ActiveVertex) : object => {

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

interface PolityNode {
	id: UniqueId;
	label: string;
	color: string;
	shape: string;
	size: number;
    i: bigint;
	[k : string] : any
}

interface PolityEdge {
	id: UniqueId;
	label: string;
	color: string;
	start: UniqueId;
	end: UniqueId;
    i: bigint
    [k : string] : any
}

let nodes: PolityNode[] = [];
let edges: PolityEdge[] = [];

const activeVertexToPolityNode = (vert: ActiveVertex): PolityNode => {
	const id = vert.props.get("id");
	const label = vert.props.get("label");
	const color = vert.props.get("color");
	const shape = vert.props.get("shape");
	const size = vert.props.get("size");
    const i = vert.props.get("i");
	return { id, label, color, shape, size, i };
}

const activeEdgeToPolityEdge = (edge: ActiveEdge): PolityEdge => {
	const id = edge.props.get("id");
	const label = edge.props.get("label");
	const color = edge.props.get("color");
	const start = edge.From().props.get("id")
	const end = edge.To().props.get("id");
    const i = edge.props.get("i");
	return { id, label, start, end, color, i };
};


g.Vertices().forEach((vert, ref) => {
    nodes.push(activeVertexToPolityNode(vert));
});

g.Edges().forEach((edge, edgeRef) => {
    edges.push(activeEdgeToPolityEdge(edge));
});

const orb = new Orb<PolityNode, PolityEdge>(container);

orb.view.setSettings({ simulation: { isPhysicsEnabled: true } });

orb.data.setup({ nodes, edges });

orb.view.render(() => {
	orb.view.recenter();
});

const output = document.getElementById('output') as HTMLDivElement; 

orb.events.on(OrbEventType.NODE_CLICK, (event) => {
    console.log('Event: node-click', event);
    output.innerHTML = JSON.stringify(event.node.data);
});

g.addEventListener("activegraph", (ev) => {
	const activeEvent = ev as ActiveEvent;
	switch (activeEvent.detail.eventType) {
		case "vertex/insert":

			const vertex = activeEvent.detail.payload.vertex;
			nodes.push(activeVertexToPolityNode(vertex));
			orb.data.merge({ nodes, edges });
			let thisNode = orb.data.getNodeById(vertex.props.get("id"));
			if (thisNode) {
				thisNode.style = styleThisVertex(vertex);
			}
			orb.view.render(() => {
				orb.view.recenter();
			});
		break;
		case "edge/insert":
			const hyperEdge = activeEvent.detail.payload.edge;
			edges.push(activeEdgeToPolityEdge(hyperEdge));
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
				const ref : VertexRef = <VertexRef>activeEvent.detail.payload.ref;
				const id = g.getVertex(ref)?.props.get("id");
				nodes = nodes.filter(node => (node.id !== id));
				orb.data.merge({ nodes, edges });
				orb.view.render(() => {
					orb.view.recenter();
				});
			}
		break;
		case "edge/delete":
			{
				const ref = <EdgeRef>activeEvent.detail.payload.ref;
				const id = g.getEdge(ref).props.get("id");
				edges = edges.filter(edge => (id !== edge.id));
				orb.data.merge({ nodes, edges });
				orb.view.render(() => {
					orb.view.recenter();
				});
			}
		// default:
		// 	console.info(activeEvent.detail.eventType, activeEvent.detail.payload.entity);
	}
});

const addNode = (e: Event) => {
	const newVert = new ActiveVertex(g, {
		"label": randomName(),
		"color": randomColor(),
		"shape": randomShape(),
		"size": Math.random() * 8
	});
	g.insertVertex(newVert);
};

const randomlyConnectTwoNodes = async (e: Event) => {
    const i = randomNumberBetweenThatsNot(0, g.Size());
    const j = randomNumberBetweenThatsNot(0, g.Size(), [i]);
    
    const to = g.getVertexRefByIndex(j);

    const from = g.getVertexRefByIndex(i);

    const activeEdge: ActiveEdge = new ActiveEdge(g, from, to, {
        label: randomName(),
        color: randomColor()
    });
    g.insertEdge(activeEdge);
};

document.getElementById('randconnect')?.addEventListener('click', randomlyConnectTwoNodes);

document.getElementById('addnode')?.addEventListener('click', addNode);
