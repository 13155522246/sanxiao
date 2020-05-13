(function () {
    'use strict';

    class GameConfig {
        constructor() {
        }
        static init() {
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1334;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class HashMap {
        constructor() {
            this._keyList = [];
            this.clear();
        }
        add(key, value) {
            const data = { key: key, value: value };
            const index = this.getIndexByKey(key);
            if (index !== -1) {
                this._list[index] = data;
            }
            else {
                this._list.push(data);
                this.addKey(key);
            }
        }
        unshift(key, value) {
            const data = { key: key, value: value };
            const index = this.getIndexByKey(key);
            if (index !== -1) {
                this._list[index] = data;
            }
            else {
                this._list.unshift(data);
                this.addKey(key, false);
            }
        }
        addKey(key, push = true) {
            if (this._keyList.indexOf(key) < 0) {
                if (push) {
                    this._keyList.push(key);
                }
                else {
                    this._keyList.unshift(key);
                }
            }
        }
        remove(key) {
            const index = this.getIndexByKey(key);
            if (index !== -1) {
                const data = this._list[index];
                this._list.splice(index, 1);
                this.removeKey(key);
                return data;
            }
            return null;
        }
        removeKey(key) {
            const index = this._keyList.indexOf(key);
            if (index >= 0) {
                this._keyList.splice(index, 1);
            }
        }
        has(key) {
            const index = this.getIndexByKey(key);
            return index !== -1;
        }
        get(key) {
            const index = this.getIndexByKey(key);
            if (index !== -1) {
                const data = this._list[index];
                return data.value;
            }
            return null;
        }
        getValueList() {
            const valueList = [];
            this.forEach(function (key, value) {
                valueList.push(value);
            });
            return valueList;
        }
        getVlaueByProperty(propetyList) {
            const valueList = [];
            this.forEach(function (key, value, obj) {
                if (obj.judgeObjectProperty(value, propetyList)) {
                    valueList.push(value);
                }
            }, this);
            return valueList;
        }
        judgeObjectProperty(obj, propetyList) {
            const propetyNames = Object.getOwnPropertyNames(propetyList);
            for (let index = 0; index < propetyNames.length; index++) {
                const propName = propetyNames[index];
                if (!this.judgeSingleProperty(obj, propName, propetyList[propName])) {
                    return false;
                }
            }
            return true;
        }
        judgeSingleProperty(obj, proName, proValue) {
            if (!obj.hasOwnProperty(proName) || obj[proName] !== proValue) {
                return false;
            }
            else {
                return true;
            }
        }
        get length() {
            return this._list.length;
        }
        forEach(f, any) {
            const count = this._list.length;
            for (let index = count - 1; index >= 0; index--) {
                const element = this._list[index];
                f(element.key, element.value, any);
            }
        }
        getIndexByKey(key) {
            const count = this._keyList.indexOf(key);
            return count;
        }
        clear() {
            this._list = [];
            this._keyList = [];
        }
    }

    class WebpRes {
        constructor() {
            if (WebpRes.canWebp == undefined) {
                WebpRes.canWebp = this.judgeSupportWebp();
            }
        }
        static Instance() {
            if (this.myselfs == null) {
                this.myselfs = new WebpRes();
            }
            return this.myselfs;
        }
        static getImageSuffix(suffixName) {
            return WebpRes.canWebp ? ".webp" : (suffixName ? suffixName : ".png");
        }
        static get canWebp() {
            return WebpRes._canWebp;
        }
        static set canWebp(isCan) {
            WebpRes._canWebp = isCan;
        }
        judgeSupportWebp() {
            const canvas = Laya.Browser.window.document.createElement('canvas');
            canvas['width'] = 2;
            canvas['height'] = 2;
            canvas['style'].width = 2 + "px";
            canvas['style'].height = 2 + "px";
            return false;
        }
        backToResList(resList, isClearRes) {
            if (!WebpRes.canWebp) {
                return resList;
            }
            else if (isClearRes) {
                resList.forEach((e, i) => {
                    if (this.filterFolder(e)) {
                        if (e.indexOf(".png") > -1) {
                            resList[i] = e.replace(".png", ".webp");
                        }
                        else if (e.indexOf(".jpg") > -1) {
                            resList[i] = e.replace(".jpg", ".webp");
                        }
                        else if (e.indexOf(".atlas") > -1) {
                            const tempList = e.split('/');
                            resList[i].url = e.replace(tempList[tempList.length - 1], '_webp_' + tempList[tempList.length - 1]);
                        }
                    }
                });
                return resList;
            }
            else {
                resList.forEach((e, i) => {
                    if (this.filterFolder(e.url)) {
                        if (e.url.indexOf(".jpg") > -1) {
                            resList[i].url = e.url.replace(".jpg", ".webp");
                        }
                        else if (e.url.indexOf(".png") > -1) {
                            resList[i].url = e.url.replace(".png", ".webp");
                        }
                        else if (e.url.indexOf(".atlas") > -1) {
                            const tempList = e.url.split('/');
                            resList[i].url = e.url.replace(tempList[tempList.length - 1], '_webp_' + tempList[tempList.length - 1]);
                        }
                    }
                });
                return resList;
            }
        }
        filterFolder(filePath) {
            if (filePath.match(/\/tiledmap\//) != null
                || filePath.match(/\/gamebg\//) != null
                || filePath.match(/\/dragonbones\//) != null) {
                return false;
            }
            return true;
        }
    }
    WebpRes.myselfs = null;

    class LoadManager {
        constructor() {
            this.FixedDataTablesDir = `res/data/fixed_tables`;
            this.hashMap = new HashMap();
            this.WebpRes = new WebpRes();
        }
        static Instance() {
            if (this.myselfs == null) {
                this.myselfs = new LoadManager();
            }
            return this.myselfs;
        }
        loadAssets(assetsList, complete, progress) {
            if (!(assetsList instanceof Array)) {
                assetsList = [assetsList];
            }
            let loadList = [];
            assetsList.forEach(element => {
                if (!this.hashMap.has(element)) {
                    const l = element.split('.');
                    const assetsType = this.getAssetsType(l[l.length - 1]);
                    if (!assetsType) {
                        return false;
                    }
                    let data = {};
                    if (assetsType === Laya.Loader.JSON || (assetsType === Laya.Loader.BUFFER && l[l.length - 1] === "zip")) {
                        data = { url: element, type: assetsType };
                    }
                    else {
                        data = { url: element, type: assetsType };
                    }
                    loadList.push(data);
                }
            });
            if (loadList.length <= 0) {
                if (complete) {
                    complete.runWith(true);
                }
                return;
            }
            loadList = WebpRes.Instance().backToResList(loadList);
            Laya.loader.load(loadList, Laya.Handler.create(this, (a, e) => {
                let index = 0;
                assetsList.forEach(element => {
                    this.hashMap.add(element, Laya.loader.getRes(assetsList[index]));
                    index++;
                });
                if (complete) {
                    complete.runWith(e);
                }
            }, [loadList]), progress);
        }
        clearAssets(assetsList) {
            if (!(assetsList instanceof Array)) {
                assetsList = [assetsList];
            }
            const assetsList_bak = this.WebpRes.Instance().backToResList(assetsList, true);
            assetsList_bak.forEach((element, i) => {
                const l = element.split('.');
                const assetsType = this.getAssetsType(l[l.length - 1]);
                if (!assetsType) {
                    return false;
                }
                let dataUrl = '';
                dataUrl = element;
                Laya.loader.clearRes(dataUrl);
                this.hashMap.remove(assetsList[i]);
            });
        }
        clearTextureRes(assetsList) {
            if (!(assetsList instanceof Array)) {
                assetsList = [assetsList];
            }
            const assetsList_bak = this.WebpRes.WebpRes.Instance().backToResList(assetsList, true);
            assetsList_bak.forEach(element => {
                const l = element.split('.');
                const assetsType = this.getAssetsType(l[l.length - 1]);
                if (!assetsType) {
                    return false;
                }
                let dataUrl = '';
                dataUrl = element;
                Laya.loader.clearTextureRes(dataUrl);
            });
        }
        getAssets(url) {
            return this.hashMap.get(url);
        }
        getAssetsType(suffixStr) {
            let assetsType = null;
            switch (suffixStr) {
                case 'jpg':
                case 'png':
                case 'webp':
                    assetsType = Laya.Loader.IMAGE;
                    break;
                case 'fui':
                case 'txt':
                case 'sk':
                    assetsType = Laya.Loader.BUFFER;
                    break;
                case 'json':
                    assetsType = Laya.Loader.JSON;
                    break;
                case 'atlas':
                    assetsType = Laya.Loader.ATLAS;
                    break;
                case 'xml':
                    assetsType = Laya.Loader.XML;
                    break;
                case 'mp3':
                case 'wav':
                    assetsType = Laya.Loader.SOUND;
                    break;
                case 'csv':
                    assetsType = "csv";
                    break;
                case 'zip':
                    assetsType = Laya.Loader.BUFFER;
                    break;
                default:
                    assetsType = null;
                    break;
            }
            return assetsType;
        }
        addPackage(resKey, descData) {
            if (resKey.constructor !== Array) {
                fairygui.UIPackage.addPackage(resKey);
                return;
            }
            for (const key in resKey) {
                const element = resKey[key];
                const element2 = descData[key];
                fairygui.UIPackage.addPackage(element, Laya.loader.getRes(element2));
            }
        }
    }
    LoadManager.myselfs = null;

    class UIManager {
        constructor() {
            this.curOpenWidnowObj = null;
            this.curOpenFullScreenObj = null;
            this.uiShowList = [];
            this.uiHideList = [];
        }
        static Instance() {
            if (this.myselfs == null) {
                this.myselfs = new UIManager();
            }
            return this.myselfs;
        }
        getView(viewName) {
            const showData = this.getViewInShowList(viewName);
            const hideData = this.getViewInHideList(viewName);
            if (hideData) {
                return hideData['useClass'] ? hideData['useClass'] : hideData['view'];
            }
            else {
                return showData ? (showData['useClass'] ? showData['useClass'] : showData['view']) : null;
            }
        }
        openView(viewName, useClass, arg, parentObj, multiple, zIndex, posX, posY, width, height) {
            const argList = arg ? (arg.length > 0 ? arg : null) : null;
            let viewObj = null;
            let claseObj = null;
            let uiData = null;
            uiData = this.getViewInShowList(viewName);
            if (uiData && !multiple) {
                return uiData.useClass ? uiData.useClass : uiData.view;
            }
            uiData = this.getViewInHideList(viewName);
            if (!uiData) {
                const tempStrList = viewName.split('+');
                const _pkgName = tempStrList[0];
                const _resName = tempStrList[1];
                viewObj = fairygui.UIPackage.createObject(_pkgName, _resName);
                viewObj.setSize(width ? width : fairygui.GRoot.inst.width, height ? height : fairygui.GRoot.inst.height);
                viewObj._name = '' + _resName;
                claseObj = useClass ? new useClass(viewObj, arg) : null;
            }
            else {
                viewObj = uiData.view;
                const index = this.getViewIndex(viewName, this.uiHideList);
                claseObj = uiData.useClass;
                if (index !== -1) {
                    this.uiHideList.splice(index, 1);
                }
                else {
                    console.error('隐藏的UI数组越界....');
                }
                claseObj && claseObj.onShow && claseObj.onShow();
            }
            this.setViewCache(viewName, viewObj, claseObj);
            if (parentObj) {
                parentObj.addChild(viewObj);
            }
            else {
                fairygui.GRoot.inst.addChild(viewObj);
            }
            viewObj.displayObject.zOrder = zIndex ? zIndex : 0;
            viewObj.x = posX ? posX : 0;
            viewObj.y = posY ? posY : 0;
            viewObj.visible = true;
            return claseObj ? claseObj : viewObj;
        }
        closeView(uiName) {
            const v = this.getViewInShowList(uiName);
            const index = this.getViewIndex(uiName, this.uiShowList);
            if (v) {
                v['view']._parent.removeChild(v['view'], false);
                this.uiShowList.splice(index, 1);
                const uiData = v;
                this.uiHideList.push(uiData);
                v['useClass'] && v['useClass'].onHide && v['useClass'].onHide();
            }
        }
        setViewCache(uiName, view, claseObj, multiple) {
            const v = this.getViewInShowList(uiName);
            if (!v || multiple) {
                const uiData = { uiName: uiName, view: view, useClass: claseObj };
                this.uiShowList.push(uiData);
            }
        }
        getViewInShowList(uiName) {
            for (let i = 0; i < this.uiShowList.length; i++) {
                const uiData = this.uiShowList[i];
                if (uiData.uiName === uiName) {
                    return uiData;
                }
            }
            return null;
        }
        getViewInHideList(uiName) {
            for (let i = 0; i < this.uiHideList.length; i++) {
                const uiData = this.uiHideList[i];
                if (uiData.uiName === uiName) {
                    return uiData;
                }
            }
            return null;
        }
        getViewIndex(uiName, listObj) {
            for (let i = 0; i < listObj.length; i++) {
                const uiData = listObj[i];
                if (uiData.uiName === uiName) {
                    return i;
                }
            }
            return -1;
        }
    }
    UIManager.myselfs = null;

    const ViewNameType = {
        GameLogin: 'GameLogin+GameLogin',
        GameNotice: 'GameLogin+ComNotice',
        GameView: 'Game+GameView'
    };

    class GameLogin {
        constructor() {
        }
        init() {
            console.log('消除小游戏登录界面');
        }
    }

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
            Laya.stage.alignV = Laya.Stage.ALIGN_CENTER;
            Laya.stage.alignH = Laya.Stage.ALIGN_MIDDLE;
            Laya.stage.bgColor = "#333333";
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
            fairygui.UIConfig.packageFileExtension = 'txt';
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            const GameLoginRes = ['res/UI/GameLogin_atlas0.png', 'res/UI/GameLogin.txt'];
            LoadManager.Instance().loadAssets(GameLoginRes, Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            Laya.stage.addChild(fgui.GRoot.inst.displayObject);
            const packageStr = ['res/UI/GameLogin'];
            const packageRes = ['res/UI/GameLogin.txt'];
            LoadManager.Instance().addPackage(packageStr, packageRes);
            const GameLoginView = UIManager.Instance().openView(ViewNameType.GameLogin, GameLogin);
        }
    }
    new Main();

}());
