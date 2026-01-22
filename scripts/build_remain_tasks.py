import json
import os
from pathlib import Path

BASE_PATH = Path(__file__).resolve().parent.parent / 'task_0120'
TASK_PATH=BASE_PATH  / 'tasks' / 'task_10.3390.json'
DL_PATH=BASE_PATH / 'electrolyte-dois-exported.json' 
OP_PATH=BASE_PATH / 'remaining_tasks.json'

def filter_remaining_tasks(task_path, downloaded_path, output_path):
    # 1. 读取 JSON 文件
    try:
        with open(task_path, 'r', encoding='utf-8') as f:
            all_tasks = json.load(f)
        with open(downloaded_path, 'r', encoding='utf-8') as f:
            downloaded_dois = json.load(f)
    except Exception as e:
        print(f"读取文件失败: {e}")
        return

    # 2. 将已下载的 DOI 转换为集合 (Set) 以提高查询速度
    # 确保去除可能的空格
    downloaded_set = {doi.strip() for doi in downloaded_dois}

    remaining_tasks = []
    
    # 3. 遍历任务并比对
    for item in all_tasks:
        raw_doi_url = item.get("doi", "")
        
        # 清洗逻辑：去除 URL 前缀提取纯 DOI
        # https://doi.org/10.1016/xxx -> 10.1016/xxx
        clean_doi = raw_doi_url.replace("https://doi.org/", "").strip()
        
        # 如果这个 DOI 不在已下载集合中，则保留为剩余任务
        if clean_doi not in downloaded_set:
            remaining_tasks.append(item)

    # 4. 输出结果
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(remaining_tasks, f, indent=4, ensure_ascii=False)

    print(f"处理完成！")
    print(f"原始任务数: {len(all_tasks)}")
    print(f"已下载数: {len(downloaded_set)}")
    print(f"剩余任务数: {len(remaining_tasks)}")
    print(f"结果已保存至: {output_path}")

if __name__ == "__main__":
    # 根据你的实际文件名修改
    filter_remaining_tasks(
        task_path=TASK_PATH, 
        downloaded_path=DL_PATH, 
        output_path=OP_PATH
    )