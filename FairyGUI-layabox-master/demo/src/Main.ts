import GameConfig from "./GameConfig";
import GameStart from "./Game/GameStart";
import { LoadManager } from "./GameManager/LoadManager";
import { ResGroupMgr } from "./GameManager/resGroupMgr";
import { UIManager } from "./GameManager/UiManager";
import { ViewNameType } from "./GameManager/Viewname";
import GameLogin from "./Game/GameLogin";

class Main {
	private _view: any;
	constructor() {
		//根据IDE设置初始化引擎		
		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
		//Laya.stage.screenMode = GameConfig.screenMode;
		Laya.stage.alignV = Laya.Stage.ALIGN_CENTER;
		Laya.stage.alignH = Laya.Stage.ALIGN_MIDDLE;
		Laya.stage.bgColor = "#333333";
		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		if (GameConfig.stat) Laya.Stat.show();
		Laya.alertGlobalError = true;
		fairygui.UIConfig.packageFileExtension = 'txt';
		// 加载版本信息文件
		//const versionName = 'version' + document.getElementsByTagName('meta')['version'].content + ".json";
		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
	}

	onVersionLoaded(): void {
		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
		//Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
		const GameLoginRes = ['res/UI/GameLogin_atlas0.png', 'res/UI/GameLogin.txt'];
		LoadManager.Instance().loadAssets(GameLoginRes, Laya.Handler.create(this, this.onConfigLoaded));
	}

	onConfigLoaded(): void {
		//加载IDE指定的场景
		//GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
		Laya.stage.addChild(fgui.GRoot.inst.displayObject);
		const packageStr = ['res/UI/GameLogin'];
		const packageRes = ['res/UI/GameLogin.txt'];
		// fgui.UIPackage.loadPackage("res/UI/Game", Laya.Handler.create(this, this.onUILoaded));
		LoadManager.Instance().addPackage(packageStr, packageRes);
		const GameLoginView = UIManager.Instance().openView(ViewNameType.GameLogin, GameLogin);
		GameLoginView.init();
	}
}
//激活启动类
new Main();
