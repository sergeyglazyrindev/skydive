import { DataSourceI, DataSourceRegistry } from "../../data_source/index";
import { TopologyLayoutI } from "../index";
import LayoutConfig from '../config';
import * as events from 'events';
import { DataManager } from '../base/index';
import { LayoutBridgeUI, LayoutBridgeUII } from '../base/ui/index';

export default class SkydiveHiearchiedLayout implements TopologyLayoutI {
    uiBridge: LayoutBridgeUII;
    dataManager: DataManager = new DataManager();
    e: events.EventEmitter = new events.EventEmitter();
    alias: string = "skydive_hierarchied";
    active: boolean = false;
    config: LayoutConfig;
    dataSources: DataSourceRegistry = new DataSourceRegistry();
    selector: string;
    constructor(selector: string) {
        this.selector = selector;
        this.uiBridge = new LayoutBridgeUI(selector);
        this.uiBridge.useEventEmitter(this.e);
    }
    initializer() {
        console.log("Try to initialize topology " + this.alias);
        this.active = true;
    }
    useConfig(config: LayoutConfig) {
        this.config = config;
    }
    remove() {

    }
    addDataSource(dataSource: DataSourceI, defaultSource?: boolean) {
        this.dataSources.addSource(dataSource, !!defaultSource);
    }
    reactToDataSourceEvent(dataSource: DataSourceI, eventName: string, ...args: Array<any>) {

    }

    reactToTheUiEvent(eventName: string, ...args: Array<any>) {

    }

}
