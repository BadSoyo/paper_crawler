import pandas as pd
import json
import os
from pathlib import Path
import glob

BASE_PATH = Path(__file__).resolve().parent.parent / 'task_0120'
TASK_PATH=BASE_PATH  / 'tasks' / 'task_10.3390.json'
DL_PATH=BASE_PATH / 'electrolyte-dois-exported.json' 
OP_PATH=BASE_PATH / 'remaining_tasks.json'
PUB_PATH = Path(__file__).resolve().parent.parent / 'electrolyte-brain-doi-0120'

def extract_dois_from_xls_folder(folder_path):
    """遍历文件夹下所有 xls 文件并提取 DOI 列"""
    all_xls_dois = set()
    # 获取目录下所有 .xls 文件
    xls_files = glob.glob(os.path.join(folder_path, "*.xls"))
    
    print(f"正在扫描文件夹中的 {len(xls_files)} 个 XLS 文件...")
    
    for file in xls_files:
        try:
            # Web of Science 导出的 xls 往往在 'DOI' 列
            df = pd.read_excel(file)
            if 'DOI' in df.columns:
                # 提取 DOI 并去除空值和空格
                dois = df['DOI'].dropna().str.strip().tolist()
                all_xls_dois.update(dois)
            else:
                print(f"警告: 文件 {os.path.basename(file)} 中未找到 'DOI' 列")
        except Exception as e:
            print(f"读取文件 {file} 出错: {e}")
            
    return all_xls_dois

def filter_and_sort_dois(downloaded_json_path, xls_folder_path, output_json_path):
    # 1. 加载已下载的 DOI 列表 (作为基准顺序)
    with open(downloaded_json_path, 'r', encoding='utf-8') as f:
        downloaded_list = json.load(f)
    
    # 2. 从 XLS 文件夹中提取所有存在的 DOI
    xls_doi_pool = extract_dois_from_xls_folder(xls_folder_path)
    print(f"从 XLS 中提取到 {len(xls_doi_pool)} 条唯一 DOI")

    # 3. 按照 downloaded_list 的顺序进行比对
    # 只有当 downloaded_list 中的 DOI 同时也存在于 XLS 文件夹中时，才保留
    result = [doi for doi in downloaded_list if doi in xls_doi_pool]

    # 4. 输出结果为 JSON 纯文本格式
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False)

    print("-" * 30)
    print(f"比对完成！")
    print(f"输出 DOI 数量: {len(result)}")
    print(f"结果已保存至: {output_json_path}")

if __name__ == "__main__":
    # 请根据实际路径修改
    filter_and_sort_dois(
        downloaded_json_path = DL_PATH, # 你从 MinIO 导出的列表
        xls_folder_path = BASE_PATH,               # 存放那几个 xls 的文件夹
        output_json_path = PUB_PATH / 'downloaded_doi_0120.json'     # 最终输出的文件
    )