import { TopologyLayoutI, LayoutRegistry } from "./topology_layout/index";
import * as events from 'events';

export default class TopologyManager {
    e: events.EventEmitter = new events.EventEmitter();
    public layoutRegistry: LayoutRegistry = new LayoutRegistry();
    private static _instance: TopologyManager;

    private constructor() {
    }

    public static getInstance() {
        // Do you need arguments? Make it a regular method instead.
        return this._instance || (this._instance = new this());
    }

    public addTopologyLayout(topologyLayout: TopologyLayoutI, defaultLayout?: boolean): void {
        this.layoutRegistry.addLayout(topologyLayout, defaultLayout);
    }
}
