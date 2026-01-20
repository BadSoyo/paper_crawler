// ==UserScript==
// @name              Crawler base on SingleFile (Debug & Fail Log)
// @author            Mark & Modified
// @description       Download site in single file automatically with Failure Logging
// @license           MIT
// @version           0.0.22
// @match             https://*/*
// @run-at            document-idle
// @grant             GM.setValue
// @grant             GM.getValue
// @grant             GM.xmlHttpRequest
// @grant             GM_registerMenuCommand
// @grant             unsafeWindow
// @require           https://update.greasyfork.org/scripts/483730/1305396/gm-fetch.js
// @require           https://openuserjs.org/src/libs/sizzle/GM_config.js
// @connect           *
// @noframes
// @namespace         https://greasyfork.org/users/1106595
// ==/UserScript==

const REPORT_ADDRESS = "https://crawler-hit.deno.dev/api/update"; // report server address
const PAGE_LOADING_TIME = 7;
const ERROR_RELOAD_TIME = 10;
const ERROR_RELOAD_LONG_TIME = 60;
const NEXT_TASK_WAITING_TIME = 10;

const NO_TASK_WAITING_TIME = 90;
const CF_CHALLENGE_WAITING_TIME = 20;
const QUICK_SLEEP_TIME = 5;
const DOMAIN_REG = /^(https?):\/\/([^\s\/?\.#]+\.?)+$/;
const TASK_MAX_RETRY_TIMES = 3;
const TIME_POINT_TYPES = {
  PREPARE_START: "prepareStart",
  TASK_LOADED: "taskLoaded",
  TASK_REPORTED: "taskReported",
  PRESIGN_INDEX: "presignIndex",
  PRESIGN_SINGLEFILE: "presignSinglefile",
  SINGLE_FILE_SUCCESS: "singleFileSuccess",
  INDEX_FILE_UPLOADED: "indexFileUploaded",
  SINGLE_FILE_UPLOADED: "singleFileUploaded",
  VALIDATE_FAILED: "validateFailed",
};

let gmc = new GM_config({
  id: "CrawlerConfig",
  title: "Crawler setting",
  fields: {
    Name: {
      label: "Name",
      type: "text",
    },
    Password: {
      label: "Password",
      type: "text",
    },
    taskInterval: {
      label: "Task Interval (s)",
      type: "int",
      default: NEXT_TASK_WAITING_TIME,
    },
    taskMaxRetryTimes: {
      label: "Task Max Retry Times",
      type: "int",
      default: TASK_MAX_RETRY_TIMES,
    },
    preferServer: {
      label: "Prefer preSign Server",
      type: "text",
    },
    reportServer: {
      label: "Report Server",
      type: "text",
      default: REPORT_ADDRESS,
    },
  },
  events: {
    init: function () {
      // runs after initialization completes
    },
    save: function () {
      // runs after values are saved
      console.log("save", this.get("Name"), this.get("Password"));
      this.close();
    },
  },
});

const crawlerUtil = {
  addScript: (url) => {
    const s = document.createElement("script");
    s.src = url;
    s.onerror = (evt) => {
      setTimeout(() => {
        addScript(url);
      }, 2000);
    };
    document.body.append(s);
  },

  addScriptByText: async (url, cache = false, retry = 0) => {
    const s = document.createElement("script");
    s.dataset.crawler = "true";
    const scriptCache = (await GM.getValue("scriptCache")) || {};
    if (cache && scriptCache[url]) {
      s.innerHTML = scriptCache[url];
      document.body.append(s);
      return true;
    }
    try {
      const res = await GM.xmlHttpRequest({
        url: url,
        method: "GET",
      });

      const text = res.responseText;
      if (cache) {
        scriptCache[url] = text;
        GM.setValue("scriptCache", scriptCache);
      }
      s.innerHTML = text;
      document.body.append(s);
      return true;
    } catch (error) {
      if (retry > 3) {
        return false;
      }
      await sleep(2);
      return await addScriptByText(url, retry + 1);
    }
  },

  getPreSignUrl: async (doi, fileName, name, pass, preferServer = "") => {
    const configServer = DOMAIN_REG.test(preferServer) ? [preferServer] : [];
    const preSignSevers = configServer.concat([
      "http://localhost:8000",
      "https://electrolyte-brain-minio.deno.dev",
    ]);
    async function getPreSignUrlFromServer(serverIndex = 0) {
      try {
        return await (
          await GM_fetch(
            `${preSignSevers[serverIndex]}/api/presignedPutObject?doi=${doi}&file_name=${fileName}&account=${name}&pass=${pass}`
          )
        ).json();
      } catch (error) {
        if (!preSignSevers[serverIndex + 1]) {
          return { reload: true };
        }
        return await getPreSignUrlFromServer(serverIndex + 1);
      }
    }

    const preSignRes = await getPreSignUrlFromServer();
    if (preSignRes.reload) {
      return "RELOAD";
    }

    const url = preSignRes?.url;
    return url || null;
  },

  uploader: async (url, content) => {
    // ============ DEBUG START ============
    console.log(`%c[DEBUG] 准备上传! 目标地址: ${url}`, "color: red; font-weight: bold; font-size: 14px;");
    if (url.startsWith("http:") && location.protocol === "https:") {
        console.warn("%c[DEBUG WARN] 检测到混合内容风险: 正在 HTTPS 页面请求 HTTP 接口!", "background: yellow; color: black; font-size: 14px;");
    }
    // ============ DEBUG END ============

    const mime = "application/gzip"
    const gzip_data = pako.gzip(content, { level: 9 });
    const upload_blob = new Blob([gzip_data], { type: mime });

    try {
        const response = await GM.xmlHttpRequest({
            method: "PUT",
            url,
            headers: {
                "Content-Type": mime,
                "Content-Length": upload_blob.size,
            },
            data: upload_blob,
            onerror: (err) => {
                console.error("[DEBUG] GM_xhr onerror:", err);
            },
            ontimeout: () => {
                console.error("[DEBUG] GM_xhr timeout");
            }
        });
        console.log("[DEBUG] 上传请求响应状态:", response.status, response.statusText);
        if (response.status >= 400) {
            console.error("[DEBUG] 上传服务端返回错误:", response.responseText);
            throw new Error(`Upload failed with status ${response.status}`);
        }
        return response;
    } catch (e) {
        console.error("[DEBUG] uploader 函数内部捕获异常:", e);
        throw e;
    }
  },

  downloadFile: (data, fileName) => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    const blob = new Blob([data], {
      type: "application/octet-stream",
    });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  generateClientId: () => (1e6 * Math.random()).toString(32).replace(".", ""),

  sleep: (duration) => {
    return new Promise((res, rej) => {
      setTimeout(() => res(), duration * 1000);
    });
  },
};

// main function
(function () {
  "use strict";
  const {
    addScript,
    addScriptByText,
    generateClientId,
    uploader,
    downloadFile,
    getPreSignUrl,
    sleep,
  } = crawlerUtil;

  const dependenciesInit = async () => {
    await addScriptByText(
      "https://cdn.jsdelivr.net/gh/gildas-lormeau/SingleFile-MV3/lib/single-file-bootstrap.js",
      true
    );
    await addScriptByText(
      "https://cdn.jsdelivr.net/gh/gildas-lormeau/SingleFile-MV3/lib/single-file-hooks-frames.js",
      true
    );
    await addScriptByText(
      "https://cdn.jsdelivr.net/gh/gildas-lormeau/SingleFile-MV3/lib/single-file-frames.js",
      true
    );
    await addScriptByText(
      "https://cdn.jsdelivr.net/gh/gildas-lormeau/SingleFile-MV3/lib/single-file.js",
      true
    );

    await addScriptByText(
      "https://cdn.jsdelivr.net/gh/IKKEM-Lin/crawler-base-on-singlefile/config.js"
    );
    await addScriptByText(
      "https://gist.githubusercontent.com/BadSoyo/b36567143720e4596dbd9bfb2166a608/raw/validator.js?t=" + Date.now(),
      false
    );
    await addScriptByText(
      "https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js"
    );
    return () => {
      document.querySelectorAll("script[data-crawler='true']").forEach((el) => {
        el.parentElement.removeChild(el);
      });
    };
  };

  const pureHTMLCleaner = (document) => {
    document.querySelectorAll("script").forEach((el) => {
      el.parentElement.removeChild(el);
    });
    document.querySelectorAll("style").forEach((el) => {
      el.parentElement.removeChild(el);
    });
  };

  window.unsafeWindow.fetch = async (...args) => {
    return await fetch(...args).catch(async (err) => {
      return await GM_fetch(...args);
    });
  };

  async function reload(waiting = 60, message = "") {
    console.warn(`%c${message}, reload ${waiting}s later`, printStyle);
    await sleep(waiting);
    location.reload();
  }

  function readFile(accept = "", multiple = false) {
    const inputEl = document.createElement("input");
    inputEl.setAttribute("type", "file");
    inputEl.setAttribute("accept", accept);
    inputEl.setAttribute("multiple", !!multiple);
    return new Promise((resolve, reject) => {
      inputEl.addEventListener("change", (e) => {
        resolve(multiple ? inputEl.files : inputEl.files[0]);
        window.removeEventListener("click", onWindowClick, true);
      });
      document.body.append(inputEl);
      inputEl.click();

      const onWindowClick = () => {
        if (!inputEl.value) {
          reject(new Error("用户取消选择"));
        }
        window.removeEventListener("click", onWindowClick, true);
      };
      setTimeout(() => {
        window.addEventListener("click", onWindowClick, true);
      }, 100);
    });
  }

  function AddImportBtn() {
    const btnWrapImport = document.createElement("div");
    btnWrapImport.id = "CRAWLER_ID";
    btnWrapImport.innerHTML = `<button style="padding: 4px 8px;position: fixed;bottom: 40%;right: 8px;border-radius: 4px;background-color: #224466;color: #fff;">Import</button>`;
    const importBtn = btnWrapImport.querySelector("button");
    importBtn.onclick = async () => {
      if (
        !window.confirm(
          "The data in browser will be clear up. Please make sure you have to do this !!!"
        )
      ) {
        return;
      }
      const file = await readFile(".json");
      const reader = new FileReader();

      reader.onload = (event) => {
        const json = JSON.parse(event.target.result);
        if (
          json instanceof Array &&
          json.every((item) => item.doi && item.validator)
        ) {
          GM.setValue("tasks", json);
          location.reload();
        } else {
          alert(
            "Please upload json file like [{doi: string, validator: string, ...}]"
          );
        }
      };

      reader.readAsText(file);
    };
    document.body.appendChild(btnWrapImport);
    return () => {
      const importBtn = document.getElementById("CRAWLER_ID");
      if (importBtn) {
        importBtn.parentElement.removeChild(importBtn);
      }
    };
  }

  // === NEW: 导出所有任务（原始功能） ===
  GM_registerMenuCommand("Download All Tasks", async () => {
    const taskData = await GM.getValue("tasks");
    const waitingTasks = taskData.filter(
      (task) =>
        !task.downloaded &&
        task.validated === undefined &&
        validators[task.validator]
    );
    const now = new Date();
    downloadFile(
      JSON.stringify(taskData, null, 2),
      `Full-Export-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.json`
    );
  });

  // === NEW: 仅导出失败的任务 (包含原因) ===
  GM_registerMenuCommand("Download Failed Tasks", async () => {
    const taskData = await GM.getValue("tasks");
    // 筛选条件: validated === false (明确失败) 或者有 failReason
    const failedTasks = taskData.filter((task) => task.validated === false || task.failReason);
    
    if (failedTasks.length === 0) {
        alert("暂无失败任务记录。");
        return;
    }

    const output = failedTasks.map(t => ({
        doi: t.doi,
        validator: t.validator,
        failReason: t.failReason || "Unknown Failure",
        retryTimes: t.retryTimes
    }));

    const now = new Date();
    downloadFile(
      JSON.stringify(output, null, 2),
      `Failed-Tasks-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.json`
    );
  });

  GM_registerMenuCommand("Config", async () => {
    gmc.open();
  });

  const printStyle = "color: blue;background-color: #ccc;font-size: 20px";

  const prepareNextTask = async (nextDoi) => {
    const taskInterval = gmc.get("taskInterval") || NEXT_TASK_WAITING_TIME;
    if (nextDoi) {
      console.log(
        `%cStart next task ${taskInterval}s later...`,
        printStyle,
        nextDoi
      );
      await sleep(taskInterval);
      const taskData = await GM.getValue("tasks");
      const task = taskData.find((task) => task.doi === nextDoi);
      await saveTaskTimepoint(TIME_POINT_TYPES.PREPARE_START, task, taskData);
      location.href = nextDoi;
    } else {
      await reload(NO_TASK_WAITING_TIME, "No tasks waiting");
    }
  };

  let lasestTimepoint = 0;
  const saveTaskTimepoint = async (pointName, task, taskData) => {
    if (pointName === TIME_POINT_TYPES.PREPARE_START) {
      task[`timePoint_${pointName}`] = new Date().valueOf()
    }
    else {
      if (lasestTimepoint == 0) {
        lasestTimepoint = task[`timePoint_${TIME_POINT_TYPES.PREPARE_START}`] || 0;
      }
      if (lasestTimepoint == 0) {
        task[`timePoint_${pointName}`] = 0;
      } else {
        task[`timePoint_${pointName}`] = new Date().valueOf() - lasestTimepoint;
      }
      lasestTimepoint = new Date().valueOf();
    }
    await GM.setValue("tasks", taskData);
  };

  // === MODIFIED: checkRetry 增加 reason 参数 ===
  const checkRetry = async (task, taskData, nextDoi, failReason = "Unknown Retry Error") => {
    const taskMaxRetryTimes = gmc.get("taskMaxRetryTimes") || TASK_MAX_RETRY_TIMES;
    const retryTimes = task.retryTimes || 0;
    let result = true;
    
    if (retryTimes >= taskMaxRetryTimes) {
      console.log(`%cTask have been retry ${taskMaxRetryTimes} times! ${task.doi}`, printStyle);
      
      // 达到最大重试次数，标记彻底失败并记录原因
      task.validated = false;
      task.failReason = `Max retries exceeded. Last Error: ${failReason}`;
      task.updateTime = new Date().valueOf();
      
      await prepareNextTask(nextDoi);
      result = false;
    } else {
      task.retryTimes = retryTimes + 1;
      // 记录本次重试的原因，虽然还未彻底失败
      task.lastError = failReason; 
    }
    await GM.setValue("tasks", taskData);
    return result;
  }

  async function start() {
    console.log(new Date());

    const importBtnHandler = AddImportBtn();

    let clientId = await GM.getValue("clientId");
    if (typeof clientId !== "string" || !clientId) {
      clientId = generateClientId();
      await GM.setValue("clientId", clientId);
    }

    const dependenciesHandler = await dependenciesInit();

    if (!singlefile || !singlefile.getPageData) {
      await reload(ERROR_RELOAD_TIME, `singlefile error! ${currentTask.doi}`);
      return;
    }

    if (!(validators && DEFAULT_CONFIG)) {
      await reload(
        ERROR_RELOAD_TIME,
        "Can not get validators or DEFAULT_CONFIG"
      );
      return;
    }

    // ---------------------------- Get Task -----------------------------------------------------
    const taskData = await GM.getValue("tasks");
    let tasks = taskData || [];

    // find task which not downloaded and not validated before
    // ================= DEBUG START =================
    console.log("DEBUG: 检查全局 validators 对象:", validators);

    // ================= [修改开始] =================
    // 1. 改为只筛选“未完成”的任务 (暂时不检查 validator 是否存在，以免它被默默过滤掉)
    const waitingTasks = tasks.filter((task) => 
        !task.downloaded && task.validated === undefined
    );

    console.log(
      `%cPending tasks(${waitingTasks.length} / ${tasks.length}):`,
      printStyle,
      waitingTasks
    );

    if (!waitingTasks.length) {
      await reload(NO_TASK_WAITING_TIME, "No tasks waiting");
      return;
    }
    
    // 获取当前要执行的任务
    const currentTask = waitingTasks[0];
    const nextTask = waitingTasks[1] || {};
    
    // ============================================================
    // 🛡️ 安全机制：看门狗 & 环境检测 (防止卡死)
    // ============================================================

    // 1. 定义强制跳转函数 (用于超时或严重错误)
    const forceAbort = async (reason) => {
        console.error(`☠️ [Watchdog] 触发强制中止: ${reason}`);
        currentTask.validated = false;
        currentTask.failReason = `[Force Abort] ${reason}`;
        currentTask.updateTime = new Date().valueOf();
        await GM.setValue("tasks", tasks);
        
        // 强制跳转到下一题 (使用 location.replace 避免历史记录堆积)
        const target = nextTask.doi || "about:blank";
        console.warn(`正在强制跳转到: ${target}`);
        window.location.href = target;
    };

    // 2. 启动看门狗定时器 (60秒后如果还在当前页面，说明卡死了)
    // 注意：这个定时器会在页面卸载(正常跳转)时自动失效
    const WATCHDOG_TIMEOUT = 60 * 1000; 
    const watchdogId = setTimeout(() => {
        forceAbort("Script Execution Timeout (60s limit)");
    }, WATCHDOG_TIMEOUT);

    // 3. 检测特殊页面类型 (PDF, XML, Plain Text)
    // 这些页面 SingleFile 无法处理，必须跳过
    const contentType = document.contentType || "";
    const isPDF = contentType.includes("pdf") || window.location.pathname.endsWith(".pdf");
    const isXML = contentType.includes("xml") || contentType.includes("json");
    
    if (isPDF || isXML) {
        clearTimeout(watchdogId); // 清除定时器
        await sleep(2); // 稍等两秒让用户看一眼
        await forceAbort(`Unsupported Content-Type: ${contentType}`);
        return; // 终止后续执行
    }
    
    // ============================================================
    // 🛡️ 安全机制结束
    // ============================================================

    // 2. [新增] 显式检查 Validator 是否存在
    // 如果不存在，记录失败原因，而不是像以前那样直接跳过导致没记录
    if (!validators[currentTask.validator]) {
        console.error(`❌ 致命错误: 缺少校验器配置 ${currentTask.validator}，跳过此任务`);
        
        // 记录失败原因
        currentTask.failReason = `Missing Validator Config: ${currentTask.validator}`;
        currentTask.validated = false; // 标记为验证失败，防止下次无限重试
        currentTask.updateTime = new Date().valueOf();
        
        // 保存状态
        await GM.setValue("tasks", tasks); 

        // 直接跳到下一个任务 (不执行后面的逻辑)
        await prepareNextTask(nextTask.doi);
        return;
    }
    // ================= [修改结束] =================

    const invalidatedTasks = tasks.filter((task) => task.validated === false);
    const doneTasks = tasks
      .filter((task) => task.downloaded)
      .sort((a, b) => (a.updateTime > b.updateTime ? -1 : 1));
    const previousDay = new Date().valueOf() - 24 * 3600 * 1000;
    const last24hDoneTasks = doneTasks.filter(
      (task) => task.updateTime > previousDay
    );

    const lastDoneTime = new Date(doneTasks[0]?.updateTime);
    // const currentTask = waitingTasks[0];
    // const nextTask = waitingTasks[1] || {};
    await saveTaskTimepoint(TIME_POINT_TYPES.TASK_LOADED, currentTask, tasks);

    const updateCurrentTask = async (isSuccess) => {
      currentTask.validated = isSuccess;
      currentTask.updateTime = new Date().valueOf();
      await GM.setValue("tasks", tasks);
    };

    // Report progress
    const reportUrl = gmc.get("reportServer") || REPORT_ADDRESS;
    const reportTip = `Last download time: ${lastDoneTime.toLocaleString()}
      Speed: ${last24hDoneTasks.length} / last 24h`;
    GM.xmlHttpRequest({
      url: reportUrl,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        account: clientId,
        invalidate_count: invalidatedTasks.length,
        done_count: doneTasks.length,
        queue_count: waitingTasks.length,
        tip: reportTip,
      }),
    })
      .then((res) => {
        console.log("Report successfully", { res });
      })
      .finally(() => {
        saveTaskTimepoint(TIME_POINT_TYPES.TASK_REPORTED, currentTask, tasks);
      });


    // -------------------------- Detect Cloudflare challenge -------------------------------------------------------
    await sleep(PAGE_LOADING_TIME);
    if (document.getElementById("challenge-form")) {
      console.log(`%cCloudflare challenge! ${currentTask.doi}`, printStyle);
      await sleep(CF_CHALLENGE_WAITING_TIME);
      
      // === MODIFIED: 记录 CF 失败 ===
      currentTask.cloudflareBlock = true;
      currentTask.failReason = "Cloudflare/Captcha Challenge blocked";
      await updateCurrentTask(false);
      
      await prepareNextTask(nextTask.doi);
      return;
    }
    // bypass els institution check
    if (document.querySelector('.sec-A #bdd-els-close')) {
      const elsCloseBtn = document.querySelector('.sec-A #bdd-els-close');
      elsCloseBtn.click();
    }

    // ---------------------------- validated task ------------------------------------------------

    const doi = currentTask.doi.replace("https://doi.org/", "").toLowerCase();
    const doiFixed = doi.replaceAll("/", "_");

    const validator = (document) => {
      const abs_selectors = validators[currentTask.validator]["sel_A"];
      const para_selectors = validators[currentTask.validator]["sel_P"];
      if (abs_selectors.length == 0 && para_selectors.length == 0) {
        return false;
      }
      const absValidated = abs_selectors.length == 0 || abs_selectors.some((selector) => document.querySelector(selector));
      const paraValidated = para_selectors.length == 0 || para_selectors.some((selector) => document.querySelectorAll(selector).length > 0);
      return absValidated && paraValidated;
    }

    let name = "";
    let pass = "";
    let preferServer = "";
    try {
      name = gmc.get("Name");
      pass = gmc.get("Password");
      preferServer = gmc.get("preferServer");
      if (!name || !pass) {
        throw new Error();
      }
    } catch (err) {
      console.error(
        `%cMiss name or password. Please input in config panel.`,
        printStyle
      );
      return;
    }

    const indexUrl = await getPreSignUrl(doiFixed, `_.html.gz`, name, pass, preferServer);
    await saveTaskTimepoint(TIME_POINT_TYPES.PRESIGN_INDEX, currentTask, tasks);
    const singlefileUrl = await getPreSignUrl(
      doiFixed,
      `_.sf.html.gz`,
      name,
      pass,
      preferServer
    );
    await saveTaskTimepoint(
      TIME_POINT_TYPES.PRESIGN_SINGLEFILE,
      currentTask,
      tasks
    );
    
    // Check PreSign Errors
    if (indexUrl === "RELOAD" || singlefileUrl === "RELOAD") {
      await reload(
        ERROR_RELOAD_LONG_TIME,
        "Minio PreSignUrl error, please check url or account"
      );
      return;
    }
    
    // === MODIFIED: 文件已存在 ===
    if (!indexUrl && !singlefileUrl) {
      console.error("%cFile existed!!!", printStyle, currentTask.doi);
      
      currentTask.failReason = "File already exists on server (PreSign returned null)";
      await updateCurrentTask(false); // 标记为 false 以避免重复处理，或者你可以根据需求逻辑调整
      
      await prepareNextTask(nextTask.doi);
      return;
    } else {
      const old_index = await getPreSignUrl(doiFixed, `_.html`, name, pass, preferServer);
      const old_singlefileUrl = await getPreSignUrl(
        doiFixed,
        `_.sf.html`,
        name,
        pass,
        preferServer
      );
      if (!old_index && !old_singlefileUrl) {
        console.error("%cFile existed!!!", printStyle, currentTask.doi);
        
        currentTask.failReason = "File already exists on server (Old format check)";
        await updateCurrentTask(false);
        
        await prepareNextTask(nextTask.doi);
        return;
      }
    }

    // --------------------------- Page validate ------------------------------------------------------
    if (!document.body.textContent.toLowerCase().includes(doi)) {
      console.log(
        `%cURL not match, will redirect to ${currentTask.doi} 5s later`,
        printStyle
      );
      await sleep(QUICK_SLEEP_TIME);
      // === MODIFIED: 传递错误原因 ===
      if(await checkRetry(currentTask, tasks, nextTask.doi, "Page text content does not include DOI")){
        location.href = currentTask.doi;
      }
      return;
    }
    
    if (validator(document)) {
      console.log(
        "%cValidate successfully! Downloading page...",
        printStyle,
        waitingTasks,
        tasks
      );
      importBtnHandler();
      // repair special page
      if (typeof documentFixer[currentTask.validator] === "function") {
        documentFixer[currentTask.validator](document);
      }
      try {
        const data = await singlefile.getPageData(DEFAULT_CONFIG);
        await saveTaskTimepoint(
          TIME_POINT_TYPES.SINGLE_FILE_SUCCESS,
          currentTask,
          tasks
        );

        if (singlefileUrl) {
          await uploader(singlefileUrl, data.content);
          await saveTaskTimepoint(
            TIME_POINT_TYPES.SINGLE_FILE_UPLOADED,
            currentTask,
            tasks
          );
        }
        if (indexUrl) {
          dependenciesHandler();
          pureHTMLCleaner(document);
          await uploader(indexUrl, document.body.parentElement.outerHTML);
          await saveTaskTimepoint(
            TIME_POINT_TYPES.INDEX_FILE_UPLOADED,
            currentTask,
            tasks
          );
        }
        console.log("%cUpload successfully!", printStyle);
        currentTask.downloaded = true;
        // 成功时清除可能存在的失败原因
        delete currentTask.failReason;
        await updateCurrentTask(true);
      } catch (error) {
        console.error("%c[DEBUG] Capture Fatal Error:", "color: red", error);
        
        // === MODIFIED: 传递具体的 Exception 信息给 checkRetry ===
        if (await checkRetry(currentTask, tasks, nextTask.doi, `Exception: ${error.message}`)) {
          await reload(
            ERROR_RELOAD_TIME,
            `singlefile or upload error! ${currentTask.doi}`
          );
        }
        return;
      }
    } else {
      // ============ 插入开始：详细的校验失败记录 ============
      const vConfig = validators[currentTask.validator];
      const absSelectors = vConfig["sel_A"];
      const paraSelectors = vConfig["sel_P"];

      const hasAbstract = absSelectors.length === 0 || absSelectors.some((s) => document.querySelector(s));
      const hasParagraphs = paraSelectors.length === 0 || paraSelectors.some((s) => document.querySelectorAll(s).length > 0);

      const failDetail = `Validator Mismatch. Abstract found: ${hasAbstract}, Paragraphs found: ${hasParagraphs}. Title: ${document.title}`;
      
      console.log(`%cValidate failed! ${currentTask.doi}`, printStyle);
      
      await saveTaskTimepoint(
        TIME_POINT_TYPES.VALIDATE_FAILED,
        currentTask,
        tasks
      );
      
      // === MODIFIED: 记录校验失败原因 ===
      currentTask.failReason = failDetail;
      await updateCurrentTask(false);
    }

    await prepareNextTask(nextTask.doi);
  }

  start();
})();