import json
import re
from pathlib import Path

SEL_PATH = Path('./selectors.js')
OP_PATH = Path(__file__).resolve().parent.parent / 'electrolyte-brain-doi-0120' / 'press-config.json'

def extract_json_optimized(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 逻辑：找到 window.validators = 后面的第一个 { 
    # 然后找到与其匹配的最后一个 }
    start_index = content.find('{')
    # 我们找倒数第一个出现 }; 的位置，或者直接找最后一个 }
    end_index = content.rfind('}') + 1 

    if start_index != -1 and end_index != -1:
        json_str = content[start_index:end_index]
        try:
            # 清理一下可能存在的尾随分号或空格
            json_str = json_str.strip()
            data = json.loads(json_str)
            
            with open(output_file, 'w', encoding='utf-8') as f_out:
                json.dump(data, f_out, indent=2, ensure_ascii=False)
            
            print(f"提取成功！已保存至: {output_file}")
        except json.JSONDecodeError as e:
            # 如果 json.loads 失败，可能是因为 JS 对象允许末尾逗号，而标准 JSON 不允许
            # 这里尝试用正则去掉对象中最后一个元素后面的逗号
            try:
                fixed_json = re.sub(r',\s*([\]}])', r'\1', json_str)
                data = json.loads(fixed_json)
                with open(output_file, 'w', encoding='utf-8') as f_out:
                    json.dump(data, f_out, indent=2, ensure_ascii=False)
                print(f"修复逗号后提取成功！已保存至: {output_file}")
            except:
                print(f"JSON 格式依然不规范，错误原因: {e}")
    else:
        print("未能在文件中定位到 {} 括起来的内容。")

# 使用示例
if __name__ == "__main__":
    # 假设你的原始文件叫 input.js，目标文件叫 output.json
    extract_json_optimized(SEL_PATH, OP_PATH)