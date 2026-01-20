import pandas as pd
import os
import json

def process_dois_and_generate_tasks(input_directory, output_directory='output_data'):
    # --- 1. 初始化存储结构 ---
    # 使用字典存储分类结果： key = validator, value = set(dois) (使用集合自动去重)
    validator_groups = {}
    
    # 确保输出目录存在
    tasks_dir = os.path.join(output_directory, 'tasks')
    os.makedirs(tasks_dir, exist_ok=True)
    
    # 支持的文件后缀
    valid_extensions = ('.xls', '.xlsx', '.csv')
    
    # --- 2. 遍历并读取文件 ---
    if not os.path.exists(input_directory):
        print(f"错误: 找不到输入目录 '{input_directory}'")
        return

    files = [f for f in os.listdir(input_directory) if f.lower().endswith(valid_extensions)]
    print(f"开始处理目录 '{input_directory}' 下的 {len(files)} 个文件...")

    total_doi_count = 0
    
    for filename in files:
        file_path = os.path.join(input_directory, filename)
        # print(f"正在读取: {filename} ...", end=" ")
        
        try:
            # 尝试作为 Excel 读取
            try:
                df = pd.read_excel(file_path)
            except:
                # 如果 Excel 读取失败，尝试作为 CSV 读取
                df = pd.read_csv(file_path, sep=None, engine='python')

            if 'DOI' in df.columns:
                # 清洗数据：转字符串，去除空值和首尾空格
                clean_dois = df['DOI'].dropna().astype(str).str.strip()
                
                file_valid_count = 0
                for raw_doi in clean_dois:
                    # 确保是有效的 DOI 格式 (包含 '/')
                    if '/' in raw_doi:
                        # 提取 validator (10.xxxx)
                        validator = raw_doi.split('/')[0]
                        
                        # 标准化 DOI 链接
                        if raw_doi.lower().startswith('http'):
                            final_doi = raw_doi
                        else:
                            final_doi = f"https://doi.org/{raw_doi}"
                        
                        # 初始化该 validator 的集合
                        if validator not in validator_groups:
                            validator_groups[validator] = set()
                        
                        # 添加到集合
                        validator_groups[validator].add(final_doi)
                        file_valid_count += 1
                
                total_doi_count += file_valid_count
                # print(f"提取了 {file_valid_count} 条有效 DOI")
            else:
                pass
                # print("跳过 (无 DOI 列)")
                
        except Exception as e:
            print(f"\n读取文件 {filename} 失败: {e}")

    print("-" * 30)
    print(f"所有文件读取完毕。共处理原始 DOI 记录 {total_doi_count} 条。")
    print("正在生成统计数据和输出文件...")

    # --- 3. 生成总览文件 (validator_index.json) ---
    
    master_index = []
    
    # 遍历字典，构建基础列表
    for val, dois_set in validator_groups.items():
        # 取集合中的第一个元素作为示例
        # 注意：集合是无序的，转换成列表取第一个即可
        example_doi = list(dois_set)[0]
        
        master_index.append({
            "validator": val,
            "count": len(dois_set),  # [需求] 添加数量
            "doi": example_doi       # [需求] 示例 DOI
        })
    
    # [需求] 按照 count 字段降序排序 (数量多的排前面)
    master_index.sort(key=lambda x: x['count'], reverse=True)
    
    # 输出总索引文件
    master_index_path = os.path.join(output_directory, 'validator_index.json')
    with open(master_index_path, 'w', encoding='utf-8') as f:
        json.dump(master_index, f, indent=4, ensure_ascii=False)
    
    print(f"[1/2] 总索引文件已生成: {master_index_path}")
    print(f"      包含 {len(master_index)} 个不同的 Prefix 类别。")
    print(f"      排名前三的 Prefix: {', '.join([item['validator'] + '(' + str(item['count']) + ')' for item in master_index[:3]])}")

    # --- 4. 生成分任务文件夹 (Tasks Folder) ---
    
    # 根据已排序的 master_index 顺序来生成文件，虽然文件生成顺序不影响使用，但看着舒服
    task_count = 0
    for item in master_index:
        val = item['validator']
        # 从原始字典中取回该 validator 对应的所有 DOI
        all_dois = list(validator_groups[val])
        
        # 构建任务列表格式
        task_content = []
        for d in all_dois:
            task_content.append({
                "doi": d,
                "validator": val
            })
        
        # 文件名处理，防止特殊字符
        safe_val_name = val.replace('/', '_') 
        task_file_name = f"task_{safe_val_name}.json"
        task_file_path = os.path.join(tasks_dir, task_file_name)
        
        with open(task_file_path, 'w', encoding='utf-8') as f:
            json.dump(task_content, f, indent=4, ensure_ascii=False)
        task_count += 1
        
    print(f"[2/2] 分类任务文件已生成至 '{tasks_dir}/' 目录 (共 {task_count} 个文件)")
    print("-" * 30)
    print("全部完成！")

# --- 配置区域 ---

# 1. 输入目录：存放原始 xls/xlsx 文件的文件夹
input_folder = '../task_0120' 

# 2. 输出目录：结果保存位置
output_folder = '../task_0120'

# 3. 运行
process_dois_and_generate_tasks(input_folder, output_folder)