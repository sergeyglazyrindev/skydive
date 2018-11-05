import { DataSourceI, DataSourceRegistry } from "../../data_source/index";
import { TopologyLayoutI } from "../index";
import LayoutConfig from '../config';
import * as events from 'events';
import { DataManager } from '../base/index';
import { LayoutBridgeUI, LayoutBridgeUII } from '../base/ui/index';
import { LayoutUI, EdgeUI, NodeUI, GroupUI } from '../base/ui/index';
import { LabelRetrieveInformationStrategy } from '../base/edge/label/index';

export default class SkydiveInfraLayout implements TopologyLayoutI {
    uiBridge: LayoutBridgeUII;
    dataManager: DataManager = new DataManager();
    e: events.EventEmitter = new events.EventEmitter();
    alias: string = "skydive_infra";
    active: boolean = false;
    config: LayoutConfig;
    dataSources: DataSourceRegistry = new DataSourceRegistry();
    selector: string;
    constructor(selector: string) {
        this.selector = selector;
        this.uiBridge = new LayoutBridgeUI(selector);
        this.uiBridge.useEventEmitter(this.e);
        this.uiBridge.useConfig(this.config);
        this.uiBridge.useDataManager(this.dataManager);
        this.uiBridge.useLayoutUI(new LayoutUI(selector));
        this.uiBridge.useNodeUI(new NodeUI());
        this.uiBridge.useEdgeUI(new EdgeUI());
        this.uiBridge.useGroupUI(new GroupUI());
        this.dataManager.useLayoutContext(this.uiBridge.layoutContext);
    }
    initializer() {
        console.log("Try to initialize topology " + this.alias);
        $(this.selector).empty();
        this.active = true;
        this.uiBridge.start();
    }
    useLinkLabelStrategy(linkLabelType: string) {
        const strategy = LabelRetrieveInformationStrategy(linkLabelType);
        strategy.setup(this.config);
        this.uiBridge.useLinkLabelStrategy(strategy);
    }
    useConfig(config: LayoutConfig) {
        this.config = config;
        this.uiBridge.useConfig(this.config);
    }
    remove() {
        this.dataSources.sources.forEach((source: DataSourceI) => {
            source.unsubscribe();
        });
        this.active = false;
        this.uiBridge.remove();
        $(this.selector).empty();
    }
    addDataSource(dataSource: DataSourceI, defaultSource?: boolean) {
        this.dataSources.addSource(dataSource, !!defaultSource);
    }
    reactToDataSourceEvent(dataSource: DataSourceI, eventName: string, ...args: Array<any>) {
        console.log('Infra layout got an event', eventName, args);
        switch (eventName) {
            case "SyncReply":
                this.dataManager.updateFromData(dataSource.sourceType, args[0]);
                console.log('Built dataManager', this.dataManager);
                $(this.selector).empty();
                this.uiBridge.useDataManager(this.dataManager);
                this.e.emit('ui.update');
                break;
            case "NodeAdded":
                this.dataManager.addNodeFromData(dataSource.sourceType, args[0]);
                console.log('Added node', args[0]);
                this.e.emit('ui.update');
                break;
            case "NodeDeleted":
                this.dataManager.removeNodeFromData(dataSource.sourceType, args[0]);
                console.log('Deleted node', args[0]);
                this.e.emit('ui.update');
                break;
            case "NodeUpdated":
                const nodeOldAndNew = this.dataManager.updateNodeFromData(dataSource.sourceType, args[0]);
                console.log('Updated node', args[0]);
                this.e.emit('node.updated', nodeOldAndNew.oldNode, nodeOldAndNew.newNode);
                break;
            case "HostGraphDeleted":
                this.dataManager.removeAllNodesWhichBelongsToHostFromData(dataSource.sourceType, args[0]);
                console.log('Removed host', args[0]);
                this.e.emit('ui.updated');
                break;
        }
    }

    reactToTheUiEvent(eventName: string, ...args: Array<any>) {
        this.e.emit('ui.' + eventName, ...args);
    }

}
