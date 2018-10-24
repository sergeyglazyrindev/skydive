import EngineBridgeRegistry from "./registry";
import VueEngineBridge from "./vue";

export const engineRegistry = new EngineBridgeRegistry();
engineRegistry.addEngineBridge(new VueEngineBridge());
