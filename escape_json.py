
import json
import sys

def escape_html(s):
    if not isinstance(s, str):
        return s
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace(""", "&quot;").replace("'", "&#39;")

def escape_json_values(obj):
    if isinstance(obj, dict):
        return {k: escape_json_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [escape_json_values(elem) for elem in obj]
    elif isinstance(obj, str):
        return escape_html(obj)
    else:
        return obj

for file_path in sys.argv[1:]:
    with open(file_path, 'r+', encoding='utf-8') as f:
        content = f.read()
        try:
            data = json.loads(content)
            escaped_data = escape_json_values(data)
            f.seek(0)
            json.dump(escaped_data, f, indent=4)
            f.truncate()
            print(f"Processed {file_path}")
        except json.JSONDecodeError as e:
            print(f"Error processing {file_path}: {e}")
            pass
