namespace DoomShip {
    export class ViewInput extends BaseObject {
        static readonly ServerData = 'ServerData';  // 服务器返回登录状态的事件名称
        private btnLogin: fairygui.GButton;
        private control: fairygui.Controller;
        private txt_username: fairygui.GTextInput;
        private txt_password: fairygui.GTextInput;
        private txt_tips: fairygui.GTextField;
        private choseServer: ViewServer;
        private http: Laya.HttpRequest;
        private playerData;
        private pro: ViewPro;

        private setDebugBtn: fairygui.GButton;
        private clickDebugCount: number; //  点击设置调试模式按钮次数
        constructor(com_login) {
            super(com_login);
            this.btnLogin = this.getChild('btn_login').asButton;
            // this.control = this._parent.getController('loginControl');
            this.txt_password = this.getChild('txt_password').asTextInput;
            this.txt_username = this.getChild('txt_passname').asTextInput;
            this.txt_tips = this.getChild('txt_tips').asTextField;
            // this.txt_username.on(laya.events.Event.INPUT, this, this.userNameChange);
            // this.txt_password.on(laya.events.Event.INPUT, this, this.passWordChange);
            // this.choseServer = new ViewServer(this._parent.getChild('com_chosefwq').asCom); // 实例化选择服务器界面
            // this.pro = new ViewPro(this._parent.getChild('com_pro').asCom);

            this.btnLogin.onClick(this, this.login);
            // const b = laya.net.LocalStorage.getItem('name');
            // const a = laya.net.LocalStorage.getItem('psd');
            if (laya.net.LocalStorage.getItem('namenamename11') !== 'null' && laya.net.LocalStorage.getItem('namenamename11') !== null) {
                this.txt_username.text = laya.net.LocalStorage.getItem('namenamename11');
                this.txt_password.text = laya.net.LocalStorage.getItem('psdpsdpsd11');
            }

            this.clickDebugCount = 0;

            this.setDebugBtn = this.getChild('setDebugBtn').asButton;
            this.setDebugBtn.onClick(this, () => {
                if (!debugUitls.getDebugState()) {
                    debugUitls.setDebugState();     // 关闭调试模式
                    this.clickDebugCount = 0;
                } else {
                    this.clickDebugCount++;
                    if (this.clickDebugCount >= 7) {
                        debugUitls.setDebugState();     // 开启调试模式
                        this.clickDebugCount = 0;
                    }
                }
            });
        }
        private login() {
            // this.control.selectedPage = 'chose';
            if (this.txt_username.text.length > 12) {
                return;
            }
            this.loginRequest();
            this.event('click', 2);
            // 按钮点击之后停止按钮的触摸事件，等登录接口回调回来之后开启，防止玩家连点
            this.btnLogin.touchable = false;
            // this.control.selectedPage = 'chose';
            this.btnLogin.data = {
                user: this.txt_username.text,
                psd: this.txt_password.text
            };
            // this.event('message', this.btnLogin.data);
        }
        private userNameChange() {
            const name = this.txt_username.text;
        }
        private passWordChange() {
            const word = this.txt_password.text;
        }
        loginRequest() {
            DoomShip.LoadingUi.Instance().showLoading();
            this.http = new Laya.HttpRequest();   // new一个HttpRequest类
            this.http.once(Laya.Event.PROGRESS, this, this.onProgress); // 数据传输中
            this.http.once(Laya.Event.COMPLETE, this, this.onComplete); // 数据传输完成后，会返回一个data
            this.http.once(Laya.Event.ERROR, this, this.onError);    // 数据传输失败后返回
            // post数据的写法

            const userName = this.txt_username.text;
            const password = this.txt_password.text;

            const a = 'request={\"msgType\":1010,\"username\":\"' + userName +
                '\",\"password\":\"' + password + '\"}';

            // 修改release值即可
            const urlDara = true;
            let httpAddr = "";
            if (Utils.release) { // 外网
                httpAddr = 'http://212.64.114.11:8081/LoginSvr';
            } else {
                if (urlDara) { // 测试
                    httpAddr = 'http://192.168.1.189:8081/LoginSvr';
                } else {// 联调
                    // httpAddr = 'http://192.168.1.181:8081/LoginSvr';
                    // httpAddr = 'http://192.168.1.198:8081/LoginSvr';
                    httpAddr = 'http://192.168.1.119:8081/LoginSvr';
                }
            }
            LoginDataControll.Instance().HttpAddr = httpAddr;
            LoginDataControll.Instance().UserName = userName;
            LoginDataControll.Instance().UserPassword = password;

            this.http.send(httpAddr, a, 'post', 'text');

            laya.net.LocalStorage.setItem('namenamename11', userName);
            laya.net.LocalStorage.setItem('psdpsdpsd11', password);
        }

        // 数据数据传输中触发的方法
        public onProgress(e: any): void {
            DoomShip.LoadingUi.Instance().hideLoading();
        }

        // 数据传输完成后，会返回一个data
        public onComplete(e: any) {
            DoomShip.LoadingUi.Instance().hideLoading();

            this.btnLogin.touchable = true;
            console.log('onComplete::::' + e);
            // 玩家数据和服务器数据
            this.playerData = JSON.parse(e as string);
            // errCode服务器返回的信息 errDesc是返回的错误信息内容
            if (this.playerData.errCode === 0) {
                LoginDataControll.Instance().PlayerInfo = this.playerData;
                LoginDataControll.Instance().judgeCertification(this.getChild("comLogin"));

            } else {
                this.txt_tips.text = this.playerData.errDesc + ', 请重新输入';
                this.txt_username.text = '';
                this.txt_password.text = '';
            }

        }
        // 数据传输失败后返回
        public onError(e: any): void {
            console.log(e);
            this.btnLogin.touchable = true;
            DoomShip.LoadingUi.Instance().hideLoading();
        }
        // 接收到的玩家所有数据
        public playerMessage(e) {
            console.log(e);
        }

        // 获取url里面的参数
        public GetQueryString(name): any {
            const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
            const r = window.location.search.substr(1).match(reg);
            if (r !== null) {
                return r[2];
            } else {
                return null;
            }
            // 注意这里不能用js里面的unescape方法
        }
    }
}

