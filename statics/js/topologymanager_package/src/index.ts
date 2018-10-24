import { TopologyManager } from "./topologymanager/index";
import { InfraTopologyDataSource, HostTopologyDataSource } from "./topologymanager/data_source/index";
import { SkydiveInfraLayout, SkydiveHiearchiedLayout, SkydiveDefaultLayout, LayoutConfig } from "./topologymanager/topology_layout/index";
import * as events from 'events';

declare let window: any;
declare global {
    interface Window {
        d3: any;
        TopologyManager: any;
        TopologyORegistry: any;
        Vue: any;
        websocketHandler: any;
        $: any;
        detailedTopology: any;
        apiMixin: any;
    }
}
window.TopologyManager = TopologyManager;
window.TopologyORegistry = {
    dataSources: {
        infraTopology: InfraTopologyDataSource,
        hostTopology: HostTopologyDataSource
    },
    layouts: {
        skydive_default: SkydiveDefaultLayout,
        skydive_hierarchied: SkydiveHiearchiedLayout,
        infra: SkydiveInfraLayout
    },
    config: LayoutConfig,
    eventEmitter: events.EventEmitter
};
