import DataSourceI from "./interface";
import * as events from 'events';

export default class InfraTopologyDataSource implements DataSourceI {
    sourceType: string = "skydive";
    dataSourceName: string = "infra_topology";
    e: events.EventEmitter = new events.EventEmitter();
    subscribable: boolean = true;
    time: any;
    filterQuery: string = "G.V().Has('Type', 'host')";

    constructor() {
        this.onConnected = this.onConnected.bind(this);
        this.processMessage = this.processMessage.bind(this);
    }

    subscribe() {
        window.websocketHandler.disconnect();
        window.websocketHandler.removeMsgHandler('Graph', this.processMessage);
        window.websocketHandler.addMsgHandler('Graph', this.processMessage);
        window.websocketHandler.addConnectHandler(this.onConnected, true);
    }

    unsubscribe() {
        this.e.removeAllListeners();
        window.websocketHandler.removeMsgHandler('Graph', this.processMessage);
        window.websocketHandler.disconnect();
    }

    onConnected() {
        console.log('Send sync request');
        const obj: any = {};
        if (this.time) {
            obj.Time = this.time;
        }

        obj.GremlinFilter = this.filterQuery + ".SubGraph()";
        const msg = { "Namespace": "Graph", "Type": "SyncRequest", "Obj": obj };
        window.websocketHandler.send(msg);
    }

    processMessage(msg: any) {
        console.log('Got message from websocket', msg);
        this.e.emit('broadcastMessage', msg.Type, msg)
    }

}
