import Handler = laya.utils.Handler;
import Loader = laya.net.Loader;
import _Event = Laya.Event;
import Sprite = Laya.Sprite;
namespace DoomShip {
    export class LayaSample {
        private loadList;
        public skl: Laya.Skeleton;
        // private readonly urlSK = 'res/dragonbones/人物.sk'; // 'res/dragonbones/Dragon.sk';
        // private readonly urlSlotHead = 'res/dragonbones/人物.png';
        private _mainView: any;

        private loadCompHand: Handler;
        private loadProHand: Handler;

        constructor(compHand: Handler, proHand: Handler) {
            Laya.init(750, 1334, Laya.WebGL);
            laya.utils.Stat.show(0, 0);
            Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
            Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
            Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;

            this.loadCompHand = compHand;
            this.loadProHand = proHand;

            this.loadList = NSGameData.ResGroupMgr.Instance().getResArray(ResGroup.RESLIST_OTHER);

            this.loadList = this.loadList.concat([
                'res/moduleEntrance.fui', 'res/moduleEntrance@atlas0.png',
                'res/Arena.fui', 'res/Arena@atlas0.png',
                'res/mail.fui', 'res/mail@atlas0.png',
                'res/Extract.fui', 'res/Extract@atlas0.png',
                'res/Openactivities.fui', 'res/Openactivities@atlas0.png',
                'res/transcript.fui', 'res/transcript@atlas0.png',
                'res/money.fui', 'res/money@atlas0.png',
                'res/ActivityFrame.fui', 'res/ActivityFrame@atlas0.png',
                'res/Activity.fui', 'res/Activity@atlas0.png',
                'res/sign.fui', 'res/sign@atlas0.png',
                'res/ActivityIconAtlas.atlas', 'res/ActivityIconAtlas.png',
                'res/PvpRanking.fui', 'res/PvpRanking@atlas0.png',
                'res/PvpRanking@atlas0_1.png', 'res/EquipForging.fui',
                'res/EquipForging@atlas0.png', 'res/EquipMsg.fui',
                'res/EquipMsg@atlas0.png', 'res/WorldBoss.fui', 'res/WorldBoss@atlas0.png',
                'res/WorldBoss@atlas0_1.png',
                'res/EquipMsg@atlas0.png',
                'res/tower.fui', 'res/tower@atlas0.png',
                'res/Guilds_temp.fui', 'res/Guilds_temp@atlas0.png', 'res/Guilds_temp@atlas0_1.png', 'res/Guilds_temp@atlas0_2.png'
                , 'res/antiaddiction.fui', 'res/antiaddiction@atlas0.png'
            ]);
            NSGameData.LoadManager.Instance().loadAssets(this.loadList,
                Handler.create(this, (e) => {
                    this.assetsLoadComplete();
                    // compHand && compHand.runWith(e);
                }),
                Handler.create(this, (e) => {
                    this.loadProHand && this.loadProHand.runWith([e, 1, Object.getOwnPropertyNames(JsonDataFileList).length, this.loadList.length]);
                }, null, false));
        }


        assetsLoadComplete() {
            const packageStr = ['res/mapUi', 'res/Chat', 'res/bag',
                'res/mission', 'res/samllmap', 'res/bigmap', 'res/BattleUI',
                'res/friend', 'res/store', 'res/Arena', 'res/moduleEntrance',
                'res/mail', 'res/Extract', 'res/Openactivities', 'res/transcript', 'res/money',
                'res/ActivityFrame', 'res/Activity', 'res/sign', 'res/PvpRanking',
                'res/EquipForging', 'res/EquipMsg', 'res/WorldBoss', 'res/tower', 'res/Guilds_temp', 'res/antiaddiction'];
            const packageRes = ['res/mapUi.fui', 'res/Chat.fui', 'res/bag.fui',
                'res/mission.fui', 'res/samllmap.fui', 'res/bigmap.fui', 'res/BattleUI.fui',
                'res/friend.fui', 'res/store.fui', 'res/Arena.fui', 'res/moduleEntrance.fui',
                'res/mail.fui', 'res/Extract.fui', 'res/Openactivities.fui', 'res/transcript.fui', 'res/money.fui',
                'res/ActivityFrame.fui', 'res/Activity.fui', 'res/sign.fui', 'res/PvpRanking.fui', 'res/EquipForging.fui',
                'res/EquipMsg.fui', 'res/WorldBoss.fui', 'res/tower.fui', 'res/Guilds_temp.fui', 'res/antiaddiction.fui'];
            NSGameData.LoadManager.Instance().addPackage(packageStr, packageRes);

            // 加载固定表数据
            GameDataObj.DataInit(LYHandler.create(this, async (eload) => {
                NSGameData.MsgControl.getInstance().createAttributeInfoData();
                const a = await NSGameData.BagDataControll.getInstance().requestBagData(1);
                const b = await NSGameData.PlayerDataControll.getInstance().requestPlayerData(1);
                const c = await NSGameData.HeroDataControll.getInstance().requestHeroData(1);
                /** 体力自动恢复 */
                const d = await NSGameData.PlayerDataControll.getInstance().strengthRecover();
                /** 获取充值记录 */
                const e = await NSGameData.RechargeControll.getInstance().getRechargeRecord();

                const activityData = await NSGameData.ActivityFrame.getInstance().loadActivityData();
                const sevenActivityData = await NSGameData.SevenActivityData.Instance().GetSevenActivityData();

                this.loadCompHand && this.loadCompHand.runWith(true);
            }), LYHandler.create(this, (e) => {
                // 加载固定表进度
                this.loadProHand && this.loadProHand.runWith([e, 0, Object.getOwnPropertyNames(JsonDataFileList).length, this.loadList.length]);
            }, null, false));

        }
    }
}


