import { engineRegistry } from "./engine_bridge/index";
import TopologyLayoutI from "./interface";

export default class LayoutRegistry {
    layouts: Array<TopologyLayoutI> = [];
    defaultLayout: TopologyLayoutI;

    addLayout(layout: TopologyLayoutI, defaultLayout: boolean): void {
        if (defaultLayout) {
            this.defaultLayout = layout;
        }
        this.layouts.push(layout);
    }

    doesLayoutExist(layoutToFind: TopologyLayoutI): boolean {
        return !!this.layouts.find((layout: TopologyLayoutI) => layout.alias === layoutToFind.alias);
    }

    removeLayout(layoutToRemove: TopologyLayoutI): void {
        this.layouts = this.layouts.filter((layout: TopologyLayoutI) => layout.alias !== layoutToRemove.alias);
    }

    setActive(layoutToActivate: TopologyLayoutI) {
        this.layouts.forEach((layout: TopologyLayoutI) => {
            if (layout.alias == layoutToActivate.alias) {
                layout.initializer();
                console.log("Activate layout " + layout.alias);
                layout.active = true;
                return;
            }
            layout.active = false;
            console.log("Deactivate layout " + layout.alias);
            layout.remove();
        });
    }
    registerInEngine(engineName: string): void {
        this.layouts.forEach(
            (layout: TopologyLayoutI) => engineRegistry.getEngineBridge(engineName).register(
                layout.alias, layout.initializer
            )
        );
    }
}
