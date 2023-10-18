import { text } from "d3";
import { Hypergraph } from "./hypergraph";

const textarea = document.querySelector("textarea");

const h = new Hypergraph();

h.addEventListener("hypergraph",ev => {
    console.log(ev);
});

const node1 = new Map();
node1.set("label", "Charlie");
node1.set("type", "citizen");
node1.set("genres", [ "country", "rap" ]);
node1.set("weigth", 100);

const v1 = h.createVertex(node1);

const node2 = new Map(node1);
node2.set("label", "Bob");
node2.set("weight", 300);

const v2 = h.createVertex(node2);

const node3 = new Map(node2);
node3.set("label", "Alice");
node3.set("genres", [ "jazz", "world", "rock", "downtempo" ]);

const v3 = h.createVertex(node3);

const relationship = new Map();
relationship.set("type", "likes");

const e1 = h.createEdge(v1, v2, relationship);
const e2 = h.createEdge(v2, v3, relationship);
const e3 = h.createEdge(v3, v1, relationship);
const e4 = h.createEdge(v3, v2, relationship);

if (textarea) {
    textarea.value = h.toString();
}

console.log(h.toString());


//  @ts-ignore
window.h = h;
