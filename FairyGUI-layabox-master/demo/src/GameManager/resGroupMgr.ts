/**--------------------------------------------
 * 图片资源组管理类
 *--------------------------------------------
 */

export class ResGroupMgr extends Laya.EventDispatcher {

    public static JSON_POSITION = "res/resGroup.json";
    private static resGroupPool = null;  //  缓存已经解析提取的资源组路径信息

    private static _instance = null;
    public static Instance(): ResGroupMgr {
        if (ResGroupMgr._instance) {
            return ResGroupMgr._instance;
        }
        return ResGroupMgr._instance = new ResGroupMgr();
    }

    private constructor() {
        super();
    }

    /**
     * 获取当前组的资源列表
     * @param groupName 资源组名称
     */
    public getResArray(groupName: string): Array<any> {
        return ResGroupMgr.resGroupPool[groupName];
    }

    /**
     * 资源组JSON文件加载完成后解析json文件
     */
    public resJsonLoadComp() {
        if (ResGroupMgr.resGroupPool) {
            return;
        }
        ResGroupMgr.resGroupPool = {};
        const json = Laya.Loader.getRes(ResGroupMgr.JSON_POSITION);
        this.initGroupKey(json);
    }

    /**
     * 通过遍历资源组名获取组内keys
     * @param json 资源文件json解析后的对象
     */
    private initGroupKey(json) {
        if (!json) {
            console.log("资源配置json文件读取错误！");
            return;
        }
        const len = json.groups.length;
        let group = null;
        for (let i = 0; i < len; ++i) {
            group = json.groups[i];
            this.initResUrl(group.name, group.keys, json);
        }
        this.initResUrl('otherView', 'null', json);
    }

    /**
     * 根据资源组的keys从Json中resources获取资源列表
     * @param groupName
     * @param keyList
     * @param json
     */
    private initResUrl(groupName: string, keyList: string, json: any) {
        if (groupName === 'otherView' && keyList === 'null') {
            json.resources.forEach(element => {
                ResGroupMgr.resGroupPool[groupName].push(element.url);
            });
            return;
        }
        const keysArray = keyList.split(",");
        const keyLen = keysArray.length;
        const resLen = json.resources.length;

        ResGroupMgr.resGroupPool[groupName] = [];
        for (let i = 0; i < keyLen; ++i) {
            const tempKey = keysArray[i];
            for (let j = json.resources.length - 1; j >= 0; j--) {
                const tempRes = json.resources[j];
                // 提取json并封装格式
                if (tempRes.name === tempKey) {
                    ResGroupMgr.resGroupPool[groupName].push(tempRes.url);
                    json.resources.splice(j, 1);
                    break;
                }
            }
        }
    }
}
