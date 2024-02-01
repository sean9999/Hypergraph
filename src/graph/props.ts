import { EntityRef } from "./entity"

/**
 * a PropertyBag is a collection of key-value pairs.
 * There should be at most one per Entity
 */
export class PropertyBag<KV extends object> extends Map<string, any>{
    toObject(): object {
        const obj: { [key: string]: any } = {};
        for (const [key, value] of this) {
            obj[key] = value;
        }
        return obj as KV;
    }
    save(props : object) : void {
        for (let [k,v] of Object.entries(props)) {
            this.set(k, v);
        }
    }
}

/**
 * a PropertyBagStore maps an entity (an Edge or Vertex) to a PropertyBag.
 * There should be one per Graph.
 */
export type PropertyBagStore<V extends object, E extends object> = Map<EntityRef, PropertyBag<V | E>>
