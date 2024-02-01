import { PropertyBag } from "../graph/props";
import { UniqueId } from "../graph/util";
import { ActiveGraph } from "./graph";

/**
 * an ActivePropertyBag is a Map<string, any> that firss an event whenever a mutation occurs
 * it dispatches those events to its "bubbleTarget" (usually a Vertex, Edge, or Graph)
 * namespace is appended to the event name.
 * @example const bag = new EventedPropertyBag(myVertex, "vertex");
 * @example bag.set("hello", "world");
 * @example fires CustomEvent('hypergraph', { "eventType": "vertex/set", "payload": { "k": "hello", "v": "world" }})
 */
export class ActivePropertyBag<T extends object> extends PropertyBag<T> {
    graph : ActiveGraph<T | any, any | T>
    entityId : UniqueId;
    constructor(eventTarget : ActiveGraph<T | any, any | T>, namespace : string) {
        super();
        this.graph = eventTarget;
        this.entityId = namespace;
    }
    // toObject(): object {
    //     const obj: { [key: string]: any } = {};
    //     for (const [key, value] of this) {
    //       obj[key] = value;
    //     }
    //     return obj;   
    // }
    // static fromObject(obj : Object, bubbleTarget : ActiveGraph<any, any>, namespace : string) {
    //     const bag = new ActivePropertyBag(bubbleTarget, namespace);
    //     for (const key in obj) {
    //         if (obj.hasOwnProperty(key)) {
    //             bag.set(key, obj[key]);
    //         }
    //     }
    //     return bag;
    // }
    set(k: any, v: any) : this {
        super.set(k,v);
        this.broadcast("set", {k, v});
        return this
    }
    delete(k : any) : boolean {
        const somethingHappened = super.delete(k);
        if (somethingHappened) {
            this.broadcast("delete", {k});
        }
        return somethingHappened;
    }
    clear() : void {
        this.broadcast("clear", {numberOfRecords: this.size});
        return super.clear();
    }
    save(kv : T) : void {
        super.save(kv);
        this.broadcast("save", kv);
    }
    replace(kv: T) : void {
        this.clear();
        this.save(kv);
    }
    broadcast(eventType : string, payload : any) {
        eventType = `property/${eventType}`;
        payload = {
            object: payload,
            entity: this.entityId
        }
        this.graph.broadcast(eventType, payload);
    }
}