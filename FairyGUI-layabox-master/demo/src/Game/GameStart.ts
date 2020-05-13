
enum chessType {
    red = 0,
    green,
    bule,
    yellow,
    purple,
    orange
}
enum direction {
    Left,
    Right,
    Up,
    Down
}
export default class GameStart {
    /** Twenn函数 */
    private Tween = Laya.Tween;
    /** 当前场景 */
    private _view: fgui.GComponent;
    /** 棋盘数组 */
    private ListChess = [];
    /** 当前拖动的对象图片 */
    private currentdraggableBtn = null;
    /** 被放入的对象 */
    private dropBtn = null;
    /** 是否正在拖动 */
    private boolDrop = false;
    /** 开始游戏按钮 */
    private btnStartGame: fairygui.GButton;
    /** 是否开始游戏 */
    private boolStartGame = false;
    /** 存放可以被消除的棋子数组 */
    private ListChessClear = [];
    /** 存放暂时满足条件的棋子数组 */
    protected ListChessMaybeClear = [];
    /** 游戏分数显示 */
    private ComGameCount: fairygui.GComponent;
    /** 游戏分数文本 */
    private TxtGameCount: fairygui.GTextField;
    /** 没消除一个格子得分数 */
    private chessCount = 100;
    /** 游戏的初始分数 */
    private startValue = 0;
    /** 计算分数 */
    private _endValue = 0;
    /** 游戏剩余时间 */
    private txtGameTimeLast: fairygui.GTextField;
    /** 提示文字按钮 */
    private btnTips: fairygui.GButton;
    /** 游戏剩余时间 */
    private txtGameLastTime: fairygui.GTextField;
    /** 重制棋盘按钮 */
    private btnUpdataChess: fairygui.GButton;
    constructor() {
        fairygui.UIConfig.packageFileExtension = 'atlas';
        fgui.UIPackage.loadPackage("res/UI/Game", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("Game", "GameView").asCom;
        fgui.GRoot.inst.addChild(this._view);
        this._view.on(Laya.Event.MOUSE_DOWN, this, () => { })

        this.btnStartGame = this._view.getChild("btnStartGame").asButton;
        this.btnStartGame.onClick(this, this.chessDefaultClear);

        // this.ComGameCount = this._view.getChild("comGameCount").asCom;
        this.TxtGameCount = this._view.getChild("txtGameCount").asTextField;

        this.btnTips = this._view.getChild("btnTips").asButton;

        this.btnUpdataChess = this._view.getChild("btnUpdataChess").asButton;
        this.btnUpdataChess.onClick(this, this.UpdataChess);

        this.txtGameLastTime = this._view.getChild("txtLastTime").asTextField;
        this.txtGameLastTime.text = "00:10:00";

        this.Setupchessboard();
    }
    /** 加载棋盘 */
    private Setupchessboard() {
        this.ListChess = [];
        this.TxtGameCount.text = "0";
        for (let chess = 0; chess < 30; chess++) {
            const random = Math.floor(Math.random() * 6)
            const btn = fgui.UIPackage.createObject("Game", "btn_" + random).asButton;
            fgui.GRoot.inst.addChild(btn);
            const GGraph = this._view.getChild("G" + chess);
            btn.x = GGraph.x + 10;
            btn.y = GGraph.y + 10;
            btn["pos"] = chess;
            btn["color"] = random;
            this.ListChess.push(btn);
            btn.onClick(this, () => { console.log(btn["color"]) })
        }
        //  点击开始游戏按钮开始初始检测游戏棋盘是否有能够消除的棋子

    }
    onDragStart(evt: laya.events.Event) {
        // 拖动开始
        this.boolDrop = true;
        if (this.boolStartGame) {
            var btn: fgui.GButton = <fgui.GButton>fgui.GObject.cast(evt.currentTarget);
            this.currentdraggableBtn = btn;
            btn.stopDrag();//取消对原目标的拖动，换成一个替代品
            fgui.DragDropManager.inst.startDrag(btn, btn.icon, btn.icon);
        }


    }

    onDrop(data: any, evt: laya.events.Event) {
        var btn: fgui.GButton = <fgui.GButton>fgui.GObject.cast(evt.currentTarget);
        this.dropBtn = btn;

        // const x = this.currentdraggableBtn.x;
        // const y = this.currentdraggableBtn.y;
        // this.Tween.to(this.currentdraggableBtn, { x: this.dropBtn.x, y: this.dropBtn.y }, 500);
        // this.Tween.to(this.dropBtn, { x: x, y: y }, 500);

        // UI数据转换 
        const icon = this.currentdraggableBtn.icon;
        const title = this.currentdraggableBtn.title;
        const pos = this.currentdraggableBtn.pos;

        this.currentdraggableBtn.icon = btn.icon;
        btn.icon = icon;

        // 棋盘数组数据转换
        const color = this.currentdraggableBtn.color;
        this.ListChess[this.currentdraggableBtn.pos].color = this.ListChess[btn["pos"]].color;
        this.ListChess[btn["pos"]].color = color

        // 以放下的棋子位置找出此次能否消除棋子
        for (let index = 0; index < 4; index++) {
            if (index == 0) {
                this.chessLandReturn(this.ListChess[btn["pos"]], direction.Left)
            }
            else if (index == 1) {
                this.chessLandReturn(this.ListChess[btn["pos"]], direction.Right)
            }
            else if (index == 2) {
                this.chessLandReturn(this.ListChess[btn["pos"]], direction.Up)
            }
            else if (index == 3) {
                this.chessLandReturn(this.ListChess[btn["pos"]], direction.Down)
            }
        }
        this.chessTesting();
    }
    /**
     *  创建棋盘后检测
     */
    chessDefaultClear() {
        this.ListChessClear = [];
        this.boolStartGame = true;
        for (let i = 0; i < this.ListChess.length; i++) {
            this.ListChess[i].draggable = true;
            this.ListChess[i].on(fairygui.Events.DRAG_START, this, this.onDragStart);
            this.ListChess[i].on(fairygui.Events.DROP, this, this.onDrop);
        }
        this.chessTesting();
    }
    /**
     *  棋子检测
     */
    chessTesting() {
        for (let i = 0; i < this.ListChess.length; i++) {
            console.log(i);
            for (let index = 0; index < 4; index++) {
                if (index == 0) {
                    this.chessLandReturn(this.ListChess[i], direction.Left)
                }
                else if (index == 1) {
                    this.chessLandReturn(this.ListChess[i], direction.Right)
                }
                else if (index == 2) {
                    this.chessLandReturn(this.ListChess[i], direction.Up)
                }
                else if (index == 3) {
                    this.chessLandReturn(this.ListChess[i], direction.Down)
                }
            }
        }
        var array = []
        for (let i = 0; i < this.ListChessClear.length; i++) {
            const a = array.indexOf(this.ListChessClear[i]);
            if (a == -1) {
                array.push(this.ListChessClear[i]);
            }
        }
        this.ListChessClear = array
        this.ListChessClear.sort(function (a, b) { return b - a })
        //console.log(this.ListChessClear);
        this.clearChess();
    }
    /** 棋子地归检测 */
    chessLandReturn(chess: fairygui.GButton, pos) {
        switch (pos) {
            case direction.Left:
                // 左边棋子 
                if (chess["pos"] - 1 < 0 || chess["pos"] - 1 == 4 || chess["pos"] - 1 == 9 || chess["pos"] - 1 == 14 || chess["pos"] - 1 == 19 || chess["pos"] - 1 == 24) {
                    this.ListChessMaybeClear = [];
                    return;
                }
                if (this.ListChess[chess["pos"] - 1]["color"] === chess["color"]) {
                    // 暂时放入可消除的棋子数组
                    const a = this.ListChessMaybeClear.indexOf(this.ListChess[chess["pos"] - 1]["pos"]);
                    const b = this.ListChessMaybeClear.indexOf(chess["pos"]);
                    if (a == -1) {
                        this.ListChessMaybeClear.push(this.ListChess[chess["pos"] - 1]["pos"]);
                    }
                    if (b == -1) {
                        this.ListChessMaybeClear.push(chess["pos"])
                    }
                    this.chessLandReturn(this.ListChess[chess["pos"] - 1], direction.Left);
                } else {
                    if (this.ListChessMaybeClear.length >= 3) {
                        this.ListChessClear = this.ListChessClear.concat(this.ListChessMaybeClear);
                        this.ListChessMaybeClear = [];
                    } else {
                        this.ListChessMaybeClear = [];
                    }
                    return;
                }
                break;
            case direction.Right:
                // 右边棋子 
                if (chess["pos"] + 1 >= this.ListChess.length || chess["pos"] + 1 == 5 || chess["pos"] + 1 == 10 || chess["pos"] + 1 == 15 || chess["pos"] + 1 == 20 || chess["pos"] + 1 == 25) {
                    this.ListChessMaybeClear = [];
                    return;
                }
                if (this.ListChess[chess["pos"] + 1]["color"] === chess["color"]) {
                    // 暂时放入可消除的棋子数组
                    const a = this.ListChessMaybeClear.indexOf(this.ListChess[chess["pos"] + 1]["pos"]);
                    const b = this.ListChessMaybeClear.indexOf(chess["pos"]);
                    if (a == -1) {
                        this.ListChessMaybeClear.push(this.ListChess[chess["pos"] + 1]["pos"]);
                    }
                    if (b == -1) {
                        this.ListChessMaybeClear.push(chess["pos"])
                    }
                    this.chessLandReturn(this.ListChess[chess["pos"] + 1], direction.Right);
                } else {
                    if (this.ListChessMaybeClear.length >= 3) {
                        this.ListChessClear = this.ListChessClear.concat(this.ListChessMaybeClear);
                        this.ListChessMaybeClear = [];

                    } else {
                        this.ListChessMaybeClear = [];
                    }
                    return;
                }
                break;
            case direction.Up:
                // 上边棋子 
                if (chess["pos"] - 5 > 0 && this.ListChess[chess["pos"] - 5]["color"] === chess["color"]) {
                    // 暂时放入可消除的棋子数组
                    const a = this.ListChessMaybeClear.indexOf(this.ListChess[chess["pos"] - 5]["pos"]);
                    const b = this.ListChessMaybeClear.indexOf(chess["pos"]);
                    if (a == -1) {
                        this.ListChessMaybeClear.push(this.ListChess[chess["pos"] - 5]["pos"]);
                    }
                    if (b == -1) {
                        this.ListChessMaybeClear.push(chess["pos"])
                    }
                    this.chessLandReturn(this.ListChess[chess["pos"] - 5], direction.Up);
                } else {
                    if (this.ListChessMaybeClear.length >= 3) {
                        this.ListChessClear = this.ListChessClear.concat(this.ListChessMaybeClear);
                        this.ListChessMaybeClear = [];

                    } else {
                        this.ListChessMaybeClear = [];
                    }
                    return;
                }
                break;
            case direction.Down:
                // 下边棋子 
                if (chess["pos"] + 5 < this.ListChess.length && this.ListChess[chess["pos"] + 5]["color"] === chess["color"]) {
                    // 暂时放入可消除的棋子数组
                    const a = this.ListChessMaybeClear.indexOf(this.ListChess[chess["pos"] + 5]["pos"]);
                    const b = this.ListChessMaybeClear.indexOf(chess["pos"]);
                    if (a == -1) {
                        this.ListChessMaybeClear.push(this.ListChess[chess["pos"] + 5]["pos"]);
                    }
                    if (b == -1) {
                        this.ListChessMaybeClear.push(chess["pos"])
                    }
                    this.chessLandReturn(this.ListChess[chess["pos"] + 5], direction.Down);
                } else {
                    if (this.ListChessMaybeClear.length >= 3) {
                        this.ListChessClear = this.ListChessClear.concat(this.ListChessMaybeClear);
                        this.ListChessMaybeClear = [];

                    } else {
                        this.ListChessMaybeClear = [];
                    }
                    return;
                }
                break;
        }
    }
    /** 相处当前可以消除的棋子 */
    clearChess() {
        // 表示玩家拖动了棋子
        if (this.boolDrop) {
            if (this.ListChessClear.length < 3) {
                console.log("此次拖动没有造成棋子消除,返回原状态");
                // UI数据转换 
                const currentIcon = this.currentdraggableBtn.icon;
                const currentPos = this.currentdraggableBtn.pos;
                const currentcolor = this.currentdraggableBtn.color

                const dropIcon = this.dropBtn.icon;
                const dropPos = this.dropBtn.pos;
                const dropcolor = this.dropBtn.color

                // 棋盘数组数据转换
                this.ListChess[currentPos].icon = dropIcon;
                this.ListChess[currentPos].color = dropcolor;

                this.ListChess[dropPos].icon = currentIcon;
                this.ListChess[dropPos].color = currentcolor;

                // const start = this._view.getChild("G" + currentPos).asGraph;
                // const end = this._view.getChild("G" + dropPos).asGraph;
                // this.Tween.to(this.currentdraggableBtn, { x: end.x + 10, y: end.y + 10 }, 500);
                // this.Tween.to(this.dropBtn, { x: start.x + 10, y: start.y + 10 }, 500);
            }
        }
        // 计数
        var count = 0;
        // this.ListChessClear 存放的是可以消除的棋子索引
        if (this.ListChessClear.length >= 3) {
            this.ListChessClear.sort(function (a, b) { return b - a })
            // 计算分数 并根据一次消除的棋子 弹出鼓励提示框
            this.CountClearChessCount(this.ListChessClear.length);
            for (let index = 0; index < this.ListChessClear.length; index++) {
                // 找到棋盘数组中的棋子 播放销毁动销 并摧毁
                const btn = this.ListChess[this.ListChessClear[index]] as fairygui.GButton;
                btn.getTransition("t0").play(Laya.Handler.create(this, () => {
                    count++;
                    // 销毁棋子
                    btn.displayObject.destroy();
                    // 摧毁完成需要重新生成棋子
                    const random = Math.floor(Math.random() * 6)
                    const Newbtn = fgui.UIPackage.createObject("Game", "btn_" + random).asButton;
                    Newbtn["pos"] = btn["pos"];
                    Newbtn["color"] = random;
                    fgui.GRoot.inst.addChild(Newbtn)
                    // 新创建棋子加上拖动监听
                    Newbtn.draggable = true;
                    Newbtn.on(fairygui.Events.DRAG_START, this, this.onDragStart);
                    Newbtn.on(fairygui.Events.DROP, this, this.onDrop);
                    // 重新给当前位置btn复制
                    this.ListChess[this.ListChessClear[index]] = Newbtn;
                    // 找到当前应该生成的初始位置 SGGraph 初始站位图形
                    const num = this.FindChessPos(this.ListChess[this.ListChessClear[index]])
                    const SGGraph = this._view.getChild("T" + num);
                    Newbtn.x = SGGraph.x + 10;
                    Newbtn.y = SGGraph.y + 10;
                    // Tween函数移动到当前btn销毁的位置 EGGraph 结束站位图形
                    const EGGraph = this._view.getChild("G" + this.ListChess[this.ListChessClear[index]].pos);
                    this.Tween.to(Newbtn, { x: EGGraph.x + 10, y: EGGraph.y + 10 }, 1000);
                    if (count == this.ListChessClear.length) {
                        if (this.ListChessClear.length >= 3) {
                            // 此时要清空可消除数组 不然死循环！！！！！！！！！
                            console.log(count + "当前棋盘有可以消除的棋子 棋盘检测消除")
                            this.ListChessClear = [];
                            this.chessTesting();
                        } else {
                            console.log("当前棋盘没有可清除的棋子  请手动操作")
                        }
                        // 拖动结束 
                        this.boolDrop = false;
                    }
                }), null, 1)
            }
        }
    }
    /** 算出当前棋子在那一竖列 */
    FindChessPos(btn: fairygui.GButton) {
        var num = btn["pos"]
        while (num > 4) {
            num -= 5;
        }
        return num;
    }
    /** 算出当前消除棋子的分数 */
    CountClearChessCount(num) {
        const GameCount = parseInt(this.TxtGameCount.text, 10) + num * this.chessCount;
        this.TxtGameCount.text = GameCount.toString();
        this._view.getTransition("t0").play();
        if (num == 3) {
            this.btnTips.title = "Good";
        }
        else if (num == 4) {
            this.btnTips.title = "Nice";
        }
        else if (num >= 5) {
            this.btnTips.title = "Perfect";
        }

        // this.startValue = parseInt(this.ComGameCount.getChild("value").asTextField.text);
        // this.startValue = 0;
        // var add: number = num * this.chessCount;
        // this._endValue = this.startValue + add;
        // this.ComGameCount.getChild("value").text = "" + this.startValue;
        // this.ComGameCount.getChild("add_value").text = "+" + add;

        // fgui.GTween.to(this.startValue, this._endValue, 0.3)
        //     .setEase(fgui.EaseType.Linear)
        //     .onUpdate(function (tweener): void {
        //         this.ComGameCount.getChild("value").text = "" + Math.floor(tweener.value.x);
        //     }, this);

    }
    /** 重制棋盘 */
    UpdataChess() {
        for (let index = 0; index < this.ListChess.length; index++) {
            this.ListChess[index].displayObject.destroy();
        }
        this.ListChess = [];
        this.TxtGameCount.text = "0";
        for (let chess = 0; chess < 30; chess++) {
            const random = Math.floor(Math.random() * 6)
            const btn = fgui.UIPackage.createObject("Game", "btn_" + random).asButton;
            fgui.GRoot.inst.addChild(btn);
            const GGraph = this._view.getChild("G" + chess);
            btn.x = GGraph.x + 10;
            btn.y = GGraph.y + 10;
            btn["pos"] = chess;
            btn["color"] = random;
            this.ListChess.push(btn);
            btn.onClick(this, () => { console.log(btn["color"]) })
        }
        //  点击开始游戏按钮开始初始检测游戏棋盘是否有能够消除的棋子
    }
    /** 用于更新游戏倒计时 */
    private OnePackageTime() {
        Laya.timer.loop(1000, this, this.setGameLastTime);
    }
    /** 取消游戏倒计时 */
    private ClearPackageTime() {
        Laya.timer.clear(this, this.setGameLastTime);
    }
    /** 设置游戏时间 */
    private setGameLastTime() {

    }
}
