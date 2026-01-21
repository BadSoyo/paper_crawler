* 文献爬虫项目

#### 文献爬取流程
* 使用 scripts/paper_message_exporter 在 web of science 上获取全部文献的doi
* 使用<>找到全部不同的prefix
* 部署deno\minio环境
    * sudo snap install deno 安装deno
    * deno run --allow-net --allow-env run_deno.ts 运行deno脚本
* 在tampermonkey中运行<>脚本，配置好指向deno机器的参数
* 按类别执行task.json
* 使用colab脚本发布
* 为每个fix编写一个selector，更新selector
* 使用<>脚本分类输出task.json

* 更新gist为repo
* 测试能不能下载到正式数据库里
* 你需要开启本地网络访问和不安全内容允许

set -a
source .env
set +a
deno run --allow-net --allow-env minio-presignedPutObject.deno.ts