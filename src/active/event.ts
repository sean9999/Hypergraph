export interface ActiveEventData{
    eventType : string;
    payload : any
    [k : string] : any
}

export type ActiveEvent = CustomEvent<ActiveEventData>;