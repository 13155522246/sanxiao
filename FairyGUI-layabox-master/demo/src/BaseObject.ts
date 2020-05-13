
import FGCom = fairygui.GComponent;
import FUI = fairygui.UIPackage;
import FGObj = fairygui.GObject
export class BaseObject extends FGCom {
    constructor(com?: FGObj, cfg?: { pkgName: string, resName: string }) {
        super();
        if (!com) {
            com = FUI.createObject(cfg.pkgName, cfg.resName).asCom;
        }
        Object.getOwnPropertyNames(com).forEach(name => { this[name] = com[name]; });
    }
    protected event(event: string, data: any) {
        this.displayObject.event(event, data);
    }

    /** 页面打开时由UIManager中触发，需要监听的页面自行重载 */
    protected onShow() { }

    protected onHide() { }
}
