
export class WebpRes {
    private static myselfs = null;
    private static _canWebp: boolean;

    public static Instance(): WebpRes {
        if (this.myselfs == null) {
            this.myselfs = new WebpRes();
        }
        return this.myselfs;
    }

    constructor() {
        if (WebpRes.canWebp == undefined) {
            WebpRes.canWebp = this.judgeSupportWebp();
        }
    }

    /** 获取资源后缀名 */
    public static getImageSuffix(suffixName?: string): string {
        return WebpRes.canWebp ? ".webp" : (suffixName ? suffixName : ".png")
    }
    public static get canWebp() {
        return WebpRes._canWebp;
    }
    public static set canWebp(isCan: boolean) {
        WebpRes._canWebp = isCan;
    }

    /** 判断是否支持Webp */
    private judgeSupportWebp(): boolean {

        const canvas: Object = Laya.Browser.window.document.createElement('canvas');
        canvas['width'] = 2;
        canvas['height'] = 2;
        canvas['style'].width = 2 + "px";
        canvas['style'].height = 2 + "px";
        // return !![].map && canvas['toDataURL']('image/webp').indexOf('data:image/webp') === 0;
        return false;
    }

    /** 修改需要加载的文件的后缀名 */
    public backToResList(resList: any, isClearRes?: boolean): any {
        if (!WebpRes.canWebp) {
            return resList;
        } else if (isClearRes) {
            resList.forEach((e, i) => {
                if (this.filterFolder(e)) {
                    if (e.indexOf(".png") > -1) {
                        resList[i] = e.replace(".png", ".webp");
                    } else if (e.indexOf(".jpg") > -1) {
                        resList[i] = e.replace(".jpg", ".webp");
                    } else if (e.indexOf(".atlas") > -1) {
                        const tempList = e.split('/');
                        resList[i].url = e.replace(tempList[tempList.length - 1], '_webp_' + tempList[tempList.length - 1]);
                    }
                }
            });
            return resList;
        } else {
            resList.forEach((e, i) => {
                if (this.filterFolder(e.url)) {
                    if (e.url.indexOf(".jpg") > -1) {
                        resList[i].url = e.url.replace(".jpg", ".webp");
                    } else if (e.url.indexOf(".png") > -1) {
                        resList[i].url = e.url.replace(".png", ".webp");
                    } else if (e.url.indexOf(".atlas") > -1) {
                        const tempList = e.url.split('/');
                        resList[i].url = e.url.replace(tempList[tempList.length - 1], '_webp_' + tempList[tempList.length - 1]);
                    }
                }
            });
            return resList;
        }
    }

    /** 过滤指定的文件夹不转换后缀名 */
    private filterFolder(filePath: string) {
        if (filePath.match(/\/tiledmap\//) != null
            || filePath.match(/\/gamebg\//) != null
            || filePath.match(/\/dragonbones\//) != null) {
            return false;
        }
        return true;
    }
}
