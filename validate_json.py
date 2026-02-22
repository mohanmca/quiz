import json
s = open('slides_dump.txt').read().replace('const slides = ', '').strip()
if s.endswith(';'):
    s = s[:-1].strip()

try:
    json.loads(s)
    print("Valid JSON")
except Exception as e:
    print(f"Error: {e}")
    # Extract location if possible
    m = re.search(r'line (\d+) column (\d+)', str(e))
    if m:
        line = int(m.group(1))
        col = int(m.group(2))
        lines = s.splitlines()
        print(f"Around error (Line {line}, Col {col}):")
        print(lines[line-1][max(0, col-20):col+20])
