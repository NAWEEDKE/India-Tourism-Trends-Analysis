with open('app.js', encoding='utf-8') as f:
    lines = f.readlines()
print(f'Total lines before: {len(lines)}')
kept = lines[:782]
with open('app.js', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(kept)
print(f'Saved {len(kept)} lines')
