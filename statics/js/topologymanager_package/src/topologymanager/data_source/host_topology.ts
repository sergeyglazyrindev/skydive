import DataSourceI from "./interface";
import * as events from 'events';

export default class HostTopologyDataSource implements DataSourceI {
    sourceType: string = "skydive";
    dataSourceName: string = "infra_topology";
    e: events.EventEmitter = new events.EventEmitter();
    subscribable: boolean = true;
    time: any;
    filterQuery: string = "";

    constructor(host: string) {
        this.filterQuery = "G.V().Has('Host', '" + host + "')";
        this.onConnected = this.onConnected.bind(this);
        this.processMessage = this.processMessage.bind(this);
    }

    subscribe() {
        window.websocketHandler.removeMsgHandler('Graph', this.processMessage);
        window.websocketHandler.addMsgHandler('Graph', this.processMessage);
        window.websocketHandler.addConnectHandler(this.onConnected, true);
    }

    unsubscribe() {
        this.e.removeAllListeners();
        window.websocketHandler.removeMsgHandler('Graph', this.processMessage);
    }

    onConnected() {
        console.log('Send sync request');
        const obj: any = {};
        if (this.time) {
            obj.Time = this.time;
        }

        obj.GremlinFilter = this.filterQuery + ".SubGraph()";
        const msg = { "Namespace": "Graph", "Type": "SyncRequest", "Obj": obj };
        console.log('send msg', msg);
        window.websocketHandler.send(msg);
    }

    processMessage(msg: any) {
        console.log('Got message from websocket', msg);
        this.e.emit('broadcastMessage', msg.Type, msg)
    }

}
