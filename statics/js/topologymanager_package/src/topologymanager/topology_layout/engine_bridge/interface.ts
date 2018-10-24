export default interface EngineBridgeI {
    readonly engineName: string;
    register(componentName: string, handler: any): void;
}
