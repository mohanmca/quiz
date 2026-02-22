import json
import re

file_path = 'programming/articles/terraform_v4_workshop.html'
with open(file_path, 'r') as f:
    content = f.read()

# Extract the slides array
match = re.search(r'const slides = (\[.*\]);', content, re.DOTALL)
if not match:
    print("Could not find slides array")
    exit(1)

slides_json = match.group(1).strip()
if slides_json.endswith(';'):
    slides_json = slides_json[:-1].strip()

try:
    slides = json.loads(slides_json)
except Exception as e:
    print(f"JSON load failed: {e}")
    exit(1)

short_slides = []
for i, slide in enumerate(slides):
    if slide.get('type') == 'content':
        # Strip HTML tags
        text = re.sub('<[^<]+?>', ' ', slide.get('content', ''))
        word_count = len(text.split())
        if word_count < 100:
            short_slides.append((i, slide['module'], slide['title'], word_count))

print(f"Total Slides: {len(slides)}")
print(f"Short Content Slides (< 100 words): {len(short_slides)}")
for idx, mod, title, count in short_slides:
    print(f"[{idx}] {mod} - {title} ({count} words)")
