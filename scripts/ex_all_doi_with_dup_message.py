import pandas as pd
import json
import os
import glob
from collections import defaultdict
from pathlib import Path

XLS_PATH = Path(__file__).resolve().parent.parent / 'task_0120'
OP_PATH = Path(__file__).resolve().parent.parent / 'task_0120'

def analyze_dois_with_missing(folder_path):
    # 存储 DOI 记录: { doi: [{"file": ..., "row": ...}, ...] }
    doi_map = defaultdict(list)
    # 存储缺失 DOI 的位置: [{"file": ..., "row": ...}, ...]
    missing_doi_locations = []
    
    xls_files = glob.glob(os.path.join(folder_path, "*.xls"))
    print(f"正在分析 {len(xls_files)} 个 XLS 文件...")

    total_find_count = 0  # 累计找到的有效 DOI 数量
    
    for file_path in xls_files:
        file_name = os.path.basename(file_path)
        try:
            df = pd.read_excel(file_path)
            
            if 'DOI' in df.columns:
                for idx, row_val in df['DOI'].items():
                    excel_row = idx + 2 # 匹配 Excel 实际行号
                    
                    # 检查是否缺失 DOI
                    if pd.isna(row_val) or str(row_val).strip() == "":
                        missing_doi_locations.append({
                            "file": file_name,
                            "row": excel_row
                        })
                        continue
                    
                    # 正常处理存在的 DOI
                    doi = str(row_val).strip()
                    total_find_count += 1
                    doi_map[doi].append({
                        "file": file_name,
                        "row": excel_row
                    })
            else:
                print(f"警告: {file_name} 中未找到 'DOI' 列")
        except Exception as e:
            print(f"解析 {file_name} 失败: {e}")

    # --- 数据整理 ---
    unique_dois = sorted(list(doi_map.keys()))
    duplicates_report = {
        doi: info for doi, info in doi_map.items() if len(info) > 1
    }
    duplicate_instances_count = total_find_count - len(unique_dois)

    # --- 保存结果 ---
    with open(OP_PATH / 'all_unique_dois.json', 'w', encoding='utf-8') as f:
        json.dump(unique_dois, f, indent=4, ensure_ascii=False)
        
    with open(OP_PATH / 'duplicate_dois_report.json', 'w', encoding='utf-8') as f:
        json.dump(duplicates_report, f, indent=4, ensure_ascii=False)

    with open(OP_PATH / 'missing_dois_report.json', 'w', encoding='utf-8') as f:
        json.dump(missing_doi_locations, f, indent=4, ensure_ascii=False)

    # --- 最终总结 ---
    print("-" * 30)
    print(f"分析完成！统计如下：")
    print(f"1. 有效唯一 DOI 总数: {len(unique_dois)}")
    print(f"2. 重复出现的 DOI 种类: {len(duplicates_report)}")
    print(f"3. 累计重复发现次数: {duplicate_instances_count}")
    print(f"4. 缺失 DOI 的行数: {len(missing_doi_locations)}")
    print("-" * 30)
    print(f"输出文件：")
    print(f"- [1] all_unique_dois.json (去重列表)")
    print(f"- [2] duplicate_dois_report.json (重复详情)")
    print(f"- [3] missing_dois_report.json (缺失位置详情)")

if __name__ == "__main__":
    # 指定你的 xls 目录
    analyze_dois_with_missing(folder_path=XLS_PATH)