import { Orb } from '@memgraph/orb';

const init = () => {

	const container: HTMLElement = document.getElementById('graph')!;

	interface MyNode {
		id: number;
		label: string;
	}
	
	interface MyEdge extends MyNode {
		start: number;
		end: number;
	}
	
	const nodes: MyNode[] = [
		{ id: 1, label: 'Orb' },
		{ id: 2, label: 'Graph' },
		{ id: 3, label: 'Canvas' },
	];
	const edges: MyEdge[] = [
		{ id: 1, start: 1, end: 2, label: 'DRAWS' },
		{ id: 2, start: 2, end: 3, label: 'ON' },
	];
	
	const orb = new Orb<MyNode, MyEdge>(container);

	// Initialize nodes and edges
	orb.data.setup({ nodes, edges });

	// Render and recenter the view
	orb.view.render(() => {
		orb.view.recenter();
	});

};


export { init };