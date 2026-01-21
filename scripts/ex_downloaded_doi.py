import json
from minio import Minio
from minio.error import S3Error
from pathlib import Path

from dotenv import load_dotenv
import os

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)


def env_cfg(cfg):
    return os.environ.get(cfg)


print(env_cfg("MY_MINIO_URL"))

save_path = Path(__file__).resolve().parent.parent / "task_0120"


def export_minio_doi_list():
    # 1. 配置连接信息
    # 这里的 dev123.local 需要你的运行环境支持 mDNS 解析
    # 如果是本地 Python 运行通常没问题；如果在 Colab 运行则需要通过公网域名
    client = Minio(
        env_cfg("REAL_MINIO_URL"), env_cfg("REAL_AK"), env_cfg("REAL_SK"), secure=False
    )

    bucket_name = "electrolyte-brain"  # 或者是你的新 Bucket 名字
    doi_set = set()

    print(f"正在连接到 {bucket_name} ...")

    try:
        # 2. 递归列出桶内所有对象
        # 假设文件结构是: DOI_PREFIX/DOI_SUFFIX/_.html.gz
        objects = client.list_objects(bucket_name, recursive=True)

        for obj in objects:
            # 只处理以压缩包结尾的文件，避免统计到文件夹本身
            if obj.object_name.endswith("_.html.gz"):
                # 提取路径中 '_.html.gz' 之前的部分作为 DOI
                # 例如: 10.1016/j.ensm.2024.103233/_.html.gz -> 10.1016/j.ensm.2024.103233
                doi = obj.object_name.replace("/_.html.gz", "")
                doi_set.add(doi)

        # 3. 整理并排序
        final_list = sorted(list(set(doi_set)))

        # 4. 写入 JSON 文件
        output_file = save_path / "electrolyte-dois-exported.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(final_list, f, indent=4, ensure_ascii=False)

        print("-" * 30)
        print(f"导出完成！")
        print(f"总计文献数量: {len(final_list)}")
        print(f"索引文件已保存至: {output_file}")

    except S3Error as e:
        print(f"连接或操作数据库时出错: {e}")
    except Exception as e:
        print(f"发生未知错误: {e}")


if __name__ == "__main__":
    export_minio_doi_list()
