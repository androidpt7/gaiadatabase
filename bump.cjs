const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// We want to increase the text sizes.
// Current sizes we know about: text-[9px], text-[10px], text-[11px], text-xs (12px), text-sm (14px)
// We will bump them up by 2px generally.
// text-xs -> text-sm
// text-[11px] -> text-[13px]
// text-[10px] -> text-xs
// text-[9px] -> text-[11px]

content = content.replace(/text-xs/g, 'text-sm');
content = content.replace(/text-\[11px\]/g, 'text-[13px]');
content = content.replace(/text-\[10px\]/g, 'text-xs');
content = content.replace(/text-\[9px\]/g, 'text-[11px]');

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
