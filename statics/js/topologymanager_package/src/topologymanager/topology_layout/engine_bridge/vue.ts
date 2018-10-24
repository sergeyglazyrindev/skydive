import EngineBridgeI from "./interface";

export default class VueEngineBridge {
    readonly engineName: string = "vue";
    register(componentName: string, handler: any) {
        console.log("Register component: component name - " + componentName);
        window.Vue.component(componentName, handler);
    }
}
