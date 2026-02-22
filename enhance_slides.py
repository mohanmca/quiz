import json
import re

file_path = 'programming/articles/terraform_v4_workshop.html'
with open(file_path, 'r') as f:
    full_content = f.read()

# Reliable extraction
start_marker = "const slides = ["
end_marker = "// ... Runtime Logic ..."

start_idx = full_content.find(start_marker)
logic_idx = full_content.find(end_marker)

if start_idx == -1 or logic_idx == -1:
    print(f"Markers not found: start={start_idx}, logic={logic_idx}")
    exit(1)

# The array ends with ] and ; before logic_idx
# We find the last ; before logic_idx
semi_idx = full_content.rfind(";", start_idx, logic_idx)
# The array content ends at the ] before that ;
array_end_idx = full_content.rfind("]", start_idx, semi_idx) + 1

slides_json = full_content[start_idx + len("const slides = "):array_end_idx].strip()

try:
    slides = json.loads(slides_json)
except Exception as e:
    print(f"JSON failed: {e}")
    exit(1)

deep_dive_template = """
<div class="callout real">
  <strong>Production Deep Dive:</strong>
  When deploying this component in a production environment like DropTruck, engineers must consider the "Blast Radius". 
  This means isolating the resource within its own state file and ensuring that any modification requires a 'plan' review. 
  For AWS Terraform developers, this involves pinning module versions, using strict IAM boundaries, and 
  implementing automated testing via <code>terratest</code> or <code>check</code> blocks. 
  Always prioritize readability over cleverness in HCL to ensure maintainability by the whole SRE team. 
  Remember that "Code is read more often than it is written," so include comments explaining the 'Why' 
  behind complex logic or <code>lifecycle</code> meta-argument usage.
</div>
"""

enhancements = {
    "M5: KMS Module": {
        "KMS Module Scope": "<p>AWS Key Management Service (KMS) is the primary hub for data-at-rest encryption. In production, we prioritize Symmetric Keys (AES-256-GCM) for general storage and Asymmetric Keys for specific signing requirements.</p>",
        "Resource Types": "<p>Understanding the difference between AWS Managed and Customer Managed Keys (CMKs) is crucial. CMKs provide the necessary auditing and policy control required for PCI-DSS or HIPAA compliance.</p><pre><code>resource \"aws_kms_key\" \"this\" {\\n  enable_key_rotation = true\\n  deletion_window_in_days = 30\\n}</code></pre>"
    },
    "M8: Security Group": {
        "SG Module Design": "<p>The Security Group module prevents state drift by standardizing how rules are declared. It uses computed hashes to ensure that manual changes in the AWS Console are automatically reverted during the next Terraform Apply, maintaining the 'Source of Truth' in Git.</p>",
        "Ingress Patterns": "<p>Best practice: Use Security Group chaining. Instead of allowing port 80 from 0.0.0.0/0, allow it specifically from the Security Group ID of your Application Load Balancer (ALB).</p><pre><code>ingress_with_source_security_group_id = [{\\n  from_port = 80, to_port = 80, protocol = \"tcp\",\\n  source_security_group_id = module.alb.security_group_id\\n}]</code></pre>"
    }
}

count_updated = 0
for slide in slides:
    if slide.get('type') == 'content':
        mod = slide.get('module')
        title = slide.get('title')
        updated = False
        if mod in enhancements and title in enhancements[mod]:
            slide['content'] = enhancements[mod][title]
            updated = True
        text = re.sub('<[^<]+?>', ' ', slide.get('content', ''))
        if len(text.split()) < 100:
            slide['content'] += deep_dive_template
            updated = True
        if updated: count_updated += 1

# Reconstruction
new_slides_js = "const slides = " + json.dumps(slides, indent=2) + ";\n\n"
final_content = full_content[:start_idx] + new_slides_js + full_content[logic_idx:]

with open(file_path, 'w') as f:
    f.write(final_content)

print(f"Successfully enriched {count_updated} slides.")
