#!/usr/bin/env python3
"""Generate a self-contained HTML file from the unchanged prototype assets."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
dist = root / 'dist'
scripts = []
for name in ('data.js', 'core.js', 'app.js'):
    source = (dist / name).read_text(encoding='utf-8')
    source = re.sub(r'^import [^\n]+;\s*\n', '', source, flags=re.MULTILINE)
    source = re.sub(r'^export (?=(?:const|function)\b)', '', source, flags=re.MULTILINE)
    if re.search(r'^\s*(?:import|export)\b', source, flags=re.MULTILINE):
        raise ValueError(f'Unsupported module syntax in {name}')
    scripts.append(source)
script = '(() => {\n"use strict";\n' + '\n\n'.join(scripts) + '\n})();\n'
script = re.sub(r'</script', r'<\\/script', script, flags=re.IGNORECASE)
css = (dist / 'styles.css').read_text(encoding='utf-8')
if re.search(r'</style', css, flags=re.IGNORECASE):
    raise ValueError('Inline CSS contains a closing style tag')
html = (dist / 'index.html').read_text(encoding='utf-8')
style_tag = '<link rel="stylesheet" href="./styles.css">'
script_tag = '<script type="module" src="./app.js"></script>'
if html.count(style_tag) != 1 or html.count(script_tag) != 1:
    raise ValueError('Unexpected HTML entrypoint structure')
html = html.replace(style_tag, '<style>\n' + css + '\n</style>')
html = html.replace(script_tag, '<script>\n' + script + '\n</script>')
output = root / 'localisator.html'
output.write_text(html, encoding='utf-8')
print(f'Created {output.name} ({output.stat().st_size:,} bytes)')
