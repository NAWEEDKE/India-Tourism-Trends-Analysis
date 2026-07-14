import sys
f = open('app.js', encoding='utf-8')
lines = f.readlines()
f.close()
# Write clean version (first 782 lines only)
g = open('app_clean.js', 'w', encoding='utf-8')
g.writelines(lines[:782])
g.close()
print(f'Wrote {len(lines[:782])} lines to app_clean.js')
