/**
* UI界面管理类
*
*/
export class UIManager {
    private static myselfs = null;
    private uiShowList: any;        // 保存当前已经打开的UI
    private uiHideList: any;        // 保存之前打开，现在被隐藏起来的UI

    /** 当前打开的弹框UI对象 */
    private curOpenWidnowObj: any = null;
    /** 当前打开的全屏UI对象 */
    private curOpenFullScreenObj: any = null;

    constructor() {
        this.uiShowList = [];
        this.uiHideList = [];
    }

    public static Instance(): UIManager {
        if (this.myselfs == null) {
            this.myselfs = new UIManager();
        }
        return this.myselfs;
    }

    /**
    * 获取UI类对象
    * @param viewName UI名称 （包名+com名称）
    */
    public getView(viewName: any): any {
        const showData = this.getViewInShowList(viewName);
        const hideData = this.getViewInHideList(viewName);
        if (hideData) {
            return hideData['useClass'] ? hideData['useClass'] : hideData['view'];
        } else {
            return showData ? (showData['useClass'] ? showData['useClass'] : showData['view']) : null;
        }
    }


    /**
    * 打开UI界面，如果类名不为空返回类的对象 类名为空返回UI的对象
    * @param viewName UI名称 （包名+com名称）
    * @param useClass UI类名
    * @param arg UI类构造函数参数列表
    * @param parentObj UI得父节点对象
    * @param multiple 是否可以同事在界面上显示过个，默认只会有一个存在界面上
    * @param zIndex UI的zOrder值 默认为0
    * @param posX UI的 X坐标 默认为0
    * @param posY UI的 Y坐标 默认为0
    * @param width UI的 宽  默认为fairygui.GRoot.inst.width
    * @param height UI的 高 默认为fairygui.GRoot.inst.height
    */
    public openView(viewName: any, useClass?: any, arg?: any[], parentObj?: any, multiple?: boolean,
        zIndex?: number, posX?: number, posY?: number, width?: number, height?: number) {
        // 判断当前UI是否已经显示，如果已经打开并且只能同时显示一个就直接返回UI对象
        const argList = arg ? (arg.length > 0 ? arg : null) : null;
        let viewObj = null;
        let claseObj = null;
        let uiData = null;
        uiData = this.getViewInShowList(viewName);
        if (uiData && !multiple) {
            return uiData.useClass ? uiData.useClass : uiData.view;
        }


        // 当前UI没有显示，判断是否被隐藏
        uiData = this.getViewInHideList(viewName);
        if (!uiData) {
            // 如果没有被隐藏说明没有这个UI对象，需要创建，然后缓存到显示列表中
            const tempStrList = viewName.split('+');
            const _pkgName = tempStrList[0];
            const _resName = tempStrList[1];
            viewObj = fairygui.UIPackage.createObject(_pkgName, _resName);
            viewObj.setSize(width ? width : fairygui.GRoot.inst.width, height ? height : fairygui.GRoot.inst.height);
            viewObj._name = '' + _resName;
            claseObj = useClass ? new useClass(viewObj, arg) : null;
        } else {
            // 如果当前被隐藏的，从隐藏的UI数组中取出来显示
            viewObj = uiData.view;
            const index = this.getViewIndex(viewName, this.uiHideList);
            claseObj = uiData.useClass;
            if (index !== -1) {
                this.uiHideList.splice(index, 1);
            } else {
                console.error('隐藏的UI数组越界....');
            }
            claseObj && claseObj.onShow && claseObj.onShow();
        }
        // 添加到舞台中显示
        this.setViewCache(viewName, viewObj, claseObj);
        if (parentObj) {
            parentObj.addChild(viewObj);
        } else {
            fairygui.GRoot.inst.addChild(viewObj);
        }

        viewObj.displayObject.zOrder = zIndex ? zIndex : 0;
        viewObj.x = posX ? posX : 0;
        viewObj.y = posY ? posY : 0;
        viewObj.visible = true;
        return claseObj ? claseObj : viewObj;
    }

    /**
     * 关闭界面
     * @param uiName 需要关闭的UI名称（包名+com名）
     */
    public closeView(uiName: any): void {
        const v = this.getViewInShowList(uiName);                        // 获取已经缓存的UI界面的实例
        const index: number = this.getViewIndex(uiName, this.uiShowList);       // 获取UI界面的实例在数组中的下标
        if (v) {
            // 将界面从舞台上移除，然后从显示列表中移除，并添加到隐藏列表中
            v['view']._parent.removeChild(v['view'], false);
            this.uiShowList.splice(index, 1);
            const uiData = v;
            this.uiHideList.push(uiData);
            v['useClass'] && v['useClass'].onHide && v['useClass'].onHide();
        }
    }

    /**
     * 缓存已经打开过的UI
     * @param uiName        ui名称
     * @param view          ui对象
     * @param multiple      是否可以显示多个
     */
    private setViewCache(uiName: any, view: Laya.Node, claseObj: any, multiple?: boolean): void {
        // 如果UI没有缓存，push到数组中缓存下来
        const v: any = this.getViewInShowList(uiName);
        if (!v || multiple) {
            const uiData = { uiName: uiName, view: view, useClass: claseObj };
            this.uiShowList.push(uiData);
        }
    }



    // 判断UI是否在本地缓存过，没有=》创建=》缓存
    private getViewInShowList(uiName: any): fairygui.GObject {
        for (let i = 0; i < this.uiShowList.length; i++) {
            const uiData = this.uiShowList[i];
            if (uiData.uiName === uiName) {
                return uiData;
            }
        }
        return null;
    }

    // 判断当前需要打开的UI是否在隐藏的UI数组中
    private getViewInHideList(uiName: any) {
        for (let i = 0; i < this.uiHideList.length; i++) {
            const uiData = this.uiHideList[i];
            if (uiData.uiName === uiName) {
                return uiData;
            }
        }
        return null;
    }

    // 获取UI界面的实例在数组中的下标（可以是隐藏的UI数组）
    private getViewIndex(uiName: any, listObj: any): number {
        for (let i = 0; i < listObj.length; i++) {
            const uiData = listObj[i];
            if (uiData.uiName === uiName) {
                return i;
            }
        }
        return -1;
    }
}

