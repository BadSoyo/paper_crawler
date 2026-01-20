/*
使用方法
* 搜索：
    * 在web of science上执行搜索，到达搜索结果页面
* 获取saveToFile消息：
    * 打开devtool
    * 切换到network标签
    * 点击export按钮，执行任意参数的export
    * 在network中找到saveToFile消息
    * 在Headers中找到x-1p-wos-sid和requesturl，在Payload中找到parentQid，
* 下载：
    * 替换掉脚本中的x-1p-wos-sid、requesturl、parentQid、entry_num
    * 复制脚本到console中执行
> 注意：超过10w的记录无法下载，建议下载方式是按年份，当前年份单独下载
*/
const CONFIG = {
    requesturl: "https://www.webofscience.com/api/wosnx/indic/export/saveToFile",
    parentQid: "5f2c0bf0-1e6d-4fcb-b084-152831da1024-0198116ee6",
    x_1p_wos_sid: "EUW1ED0B8B423Nn13uNiGguVnLc1T",
    entry_num: 3500,
    start_from: 1
};

const downloadFile = (blob, fileName) => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    // const blob = new Blob([data], {
    //   type: "application/octet-stream",
    // });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
    


async function fetchAsync (parentQid, wosSid, markFrom = 1, markTo = 1000) {
    const response = await fetch(CONFIG.requesturl, {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9",
          "content-type": "application/json",
          "sec-ch-ua": '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-1p-wos-sid": wosSid
        },
        "referrer": `https://webofscience.clarivate.cn/wos/alldb/summary/${parentQid}/date-descending/1(overlay:export/exc)`,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `{
            "parentQid":"${parentQid}",
            "sortBy":"date-descending",
            "displayTimesCited":"true",
            "displayCitedRefs":"true",
            "product":"UA",
            "colName":"ALLDB",
            "displayUsageInfo":"true",
            "fileOpt":"xls",
            "action":"saveToExcel",
            "markFrom":"${markFrom}",
            "markTo":"${markTo}",
            "view":"summary",
            "isRefQuery":"false",
            "locale":"en_US",
            "fieldList":["TITLE","SOURCE","CITTIMES","ACCESSION_NUM","USAGEIND","PMID"]
        }`,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
      });
    const data = await response.blob();
    // return URL.createObjectURL(data);
    downloadFile(data, `wos-${markFrom}-${markTo}.xls`)
}


async function main(parentQid, wosSid, total, start = 1) {
    const step = 1000;
    for (let i = start; i <= total; i += step) {
        const markTo = i + step - 1 > total ? total : i + step - 1;
        console.log(i, markTo)
        await fetchAsync(parentQid, wosSid, i, markTo);
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

main(CONFIG.parentQid, CONFIG.x_1p_wos_sid, CONFIG.entry_num, CONFIG.start_from);