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

打开tampermonkey的高级选项
* 打开执行脚本权限
* 在chrome中打开执行脚本权限

15376 的selector有问题，网页本身就不允许使用selector完成分类
* 内容分类需要依靠代码和脚本一起完成
* 15376的标题选择器也有问题

爬虫使用singlefile下载整个网页，validators的作用是验证页面是否是预期页面，但下载时并不做选择，而是整个下载；press-config用于在最后提取出不同的内容例如abstract或者ref

#### 关于selector
* sel_R字段只能是一个字符串