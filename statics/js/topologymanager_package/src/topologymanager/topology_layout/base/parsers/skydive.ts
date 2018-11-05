import DataManager from '../data_manager';
import NodeManager from '../nodemanager';
import { Node } from '../node/index';
import { Group } from '../group/index';
import { Edge } from '../edge/index'
import EdgeManager from '../edgemanager';


function proceedNewEdge(dataManager: DataManager, e: Edge) {
    e.source.edges.addEdge(e);
    e.target.edges.addEdge(e);
    if (e.Metadata.RelationType == "ownership" || e.Metadata.Type === "vlan") {
        let group = dataManager.groupManager.groups.getGroupByOwner(e.source);
        if (!group) {
            const groupType = "ownership";
            group = dataManager.groupManager.groups.addGroupFromData(
                e.source,
                groupType
            );
            if (e.source.group) {
                e.source.group.delMember(e.source);
                group.setParent(e.source.group);
            }
            e.source.group = group;
            group.addMember(e.source);
        }
        const tg = dataManager.groupManager.groups.getGroupByOwner(e.target);
        if (tg) {
            if (!tg.parent) {
                group.delMember(e.target);
                tg.setParent(group);
            } else if (!tg.parent.isEqualTo(group)) {
                group.delMember(e.target);
                tg.setParent(group);
            }
        }
        if (!e.target.isGroupOwner()) {
            e.target.group = group;
            group.addMember(e.target);
        }
    }
}

export default function parseSkydiveData(dataManager: DataManager, data: any): void {
    dataManager.removeOldData();
    console.log('Parse skydive data', data);
    data.Obj.Nodes.forEach((node: any) => {
        dataManager.nodeManager.nodes.addNodeFromData(
            node.ID, node.Metadata.Name, node.Host, node.Metadata
        );
    });
    data.Obj.Edges.forEach((edge: any) => {
        dataManager.edgeManager.edges.addEdgeFromData(
            edge.ID, edge.Host, edge.Metadata, dataManager.nodeManager.nodes.getNodeById(edge.Parent), dataManager.nodeManager.nodes.getNodeById(edge.Child)
        );
    });
    const ownershipEdges = dataManager.edgeManager.edges.getEdgesWithRelationType("ownership");
    ownershipEdges.forEach((e: Edge) => {
        proceedNewEdge(dataManager, e);
    });
    const layer2Edges = dataManager.edgeManager.edges.getEdgesWithRelationType("layer2");
    layer2Edges.forEach((e: Edge) => {
        proceedNewEdge(dataManager, e);
    });
    dataManager.groupManager.groups.groups.forEach((g: Group) => {
        if (!g.parent) {
            return;
        }
        g.parent.children.addGroup(g);
    });
    dataManager.groupManager.groups.updateLevelAndDepth(
        dataManager.layoutContext.collapseLevel,
        dataManager.layoutContext.isAutoExpand()
    );
    const hostToNode: any = dataManager.nodeManager.nodes.nodes.reduce((accum: any, n: Node) => {
        if (!n.hasType("host")) {
            return accum;
        }
        accum[n.Name] = n;
        return accum;
    }, {});
    // normalize hosts, it always should be kind of group
    dataManager.nodeManager.nodes.nodes.forEach((n: Node) => {
        if (!n.hasType("host")) {
            if (!n.group) {
                const hostNode = hostToNode[n.Host];
                hostNode.group.addMember(n);
            }
            return;
        }
        if (n.group) {
            return;
        }
        const groupType = "ownership";
        const group = dataManager.groupManager.groups.addGroupFromData(
            n,
            groupType
        );
        n.group = group;
        group.addMember(n);
    });
}

export function parseSkydiveMessageWithOneNode(dataManager: DataManager, data: any): void {
    console.log('Parse skydive message with one node', data);
    dataManager.nodeManager.nodes.addNodeFromData(data.Obj.ID, data.Obj.Metadata.Name, data.Obj.Host, data.Obj.Metadata);
}

export function getNodeIDFromSkydiveMessageWithOneNode(data: any): string {
    return data.Obj.ID;
}

export function parseSkydiveMessageWithOneNodeAndUpdateNode(node: Node, data: any) {
    node.Name = data.Obj.Name;
    node.Host = data.Obj.Host;
    node.Metadata = data.Obj.Metadata;
}

export function getHostFromSkydiveMessageWithOneNode(data: any): string {
    return data.Obj;
}
