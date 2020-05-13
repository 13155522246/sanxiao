import { BaseObject } from "../BaseObject";

export default class GameLogin extends BaseObject {
    /** 当前场景 */
    private view: fairygui.GComponent;
    /** 游戏公告按钮 */
    private btnNotice: fairygui.GButton;
    /** 游戏名字 */
    private txtGameName: fairygui.GTextField;
    /** 加载进度条 */
    private proGame: fairygui.GProgressBar;
    /** 开始游戏按钮 */
    private btnGoGame: fairygui.GButton;
    constructor(com_Login) {
        super(com_Login);


        this.init();
        this.btnNotice = this.getChild("btnNotice").asButton;

        this.txtGameName = this.getChild("txtGameNameF").asTextField;

        this.proGame = this.getChild("proGameF").asProgress;
        this.proGame.value = 0;

        this.btnGoGame = this.getChild("btnGoGame").asButton;
        this.btnGoGame.visible = false;

    }
    init() {
        console.log('消除小游戏登录界面');

    }
}