import EngineBridgeI from "./interface";

export default class EngineBridgeRegistry {
    engines: Array<EngineBridgeI> = [];

    addEngineBridge(engineBridge: EngineBridgeI): void {
        this.engines.push(engineBridge);
    }

    getEngineBridge(engineName: string): EngineBridgeI {
        return this.engines.filter(engine => engine.engineName == engineName)[0];
    }
}
