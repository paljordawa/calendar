import re

def scale_font_size(match):
    size = float(match.group(1))
    # Increase by ~1.5px or 15%
    new_size = size + 1.5
    if new_size.is_integer():
        return f'text-[{int(new_size)}px]'
    else:
        return f'text-[{new_size}px]'

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace text-[Npx]
new_content = re.sub(r'text-\[([\d.]+)px\]', scale_font_size, content)

# Also scale text-xs, text-sm, text-base if possible? 
# No, let's stick to the explicit ones first as they are the smallest.
# text-xs -> text-[13.5px] ? (xs is 12)
# text-sm -> text-[15.5px] ? (sm is 14)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
