import NodeManager from './nodemanager';
import EdgeManager from './edgemanager';
import GroupManager from './groupmanager';
import LayoutContext from './ui/layout_context';
import { Node } from './node/index';
import parseData, { parseSkydiveMessageWithOneNodeAndUpdateNode, parseSkydiveMessageWithOneNode, getNodeIDFromSkydiveMessageWithOneNode, getHostFromSkydiveMessageWithOneNode } from './parsers/index';

export default class DataManager {
    nodeManager: NodeManager = new NodeManager();
    edgeManager: EdgeManager = new EdgeManager();
    groupManager: GroupManager = new GroupManager();
    layoutContext: LayoutContext;

    useLayoutContext(layoutContext: LayoutContext) {
        this.layoutContext = layoutContext
    }

    addNodeFromData(dataType: string, data: any) {
        parseSkydiveMessageWithOneNode(this, data);
    }

    removeNodeFromData(dataType: string, data: any) {
        const nodeID = getNodeIDFromSkydiveMessageWithOneNode(data);
        this.nodeManager.nodes.removeNodeByID(nodeID);
    }

    updateNodeFromData(dataType: string, data: any): any {
        const nodeID = getNodeIDFromSkydiveMessageWithOneNode(data);
        const node = this.nodeManager.nodes.getNodeById(nodeID);
        const clonedOldNode = node.clone();
        parseSkydiveMessageWithOneNodeAndUpdateNode(node, data);
        return { oldNode: clonedOldNode, newNode: node };
    }

    removeAllNodesWhichBelongsToHostFromData(dataType: string, data: any): void {
        const nodeHost = getHostFromSkydiveMessageWithOneNode(data);
        this.nodeManager.nodes.removeNodeByHost(nodeHost);
    }

    updateFromData(dataType: string, data: any): void {
        parseData(this, dataType, data);
    }

    removeOldData(): void {
        this.nodeManager.nodes.removeOldData();
        this.edgeManager.edges.removeOldData();
        this.groupManager.groups.removeOldData();
    }
}
