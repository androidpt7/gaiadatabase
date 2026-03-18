const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const sysMapRevTarget = `const sysMapRev: Record<string, string> = {
    'V': 'Vega', 'A': 'Antares', 'G': 'Gemini', 'M': 'Mizar', 'So': 'Sol', 'D': 'Draconis', 'Si': 'Sirius'
  };`;

const sysMapRevReplacement = `const sysMapRev: Record<string, string> = {
    'V': 'Vega', 'A': 'Antares', 'G': 'Gemini', 'M': 'Mizar', 'So': 'Sol', 'D': 'Draconis', 'Si': 'Sirius',
    'Ecoglyte': 'Ecoglyte', 'Oolyte': 'Oolyte', 'Dolomyte': 'Dolomyte', 'Kenyte': 'Kenyte', 'Clay': 'Clay'
  };`;

const sysMapTarget = `const sysMap: Record<string, string> = {
    'Vega': 'V', 'Antares': 'A', 'Gemini': 'G', 'Mizar': 'M', 'Sol': 'So', 'Draconis': 'D', 'Sirius': 'Si'
  };`;

const sysMapReplacement = `const sysMap: Record<string, string> = {
    'Vega': 'V', 'Antares': 'A', 'Gemini': 'G', 'Mizar': 'M', 'Sol': 'So', 'Draconis': 'D', 'Sirius': 'Si',
    'Ecoglyte': 'Ecoglyte', 'Oolyte': 'Oolyte', 'Dolomyte': 'Dolomyte', 'Kenyte': 'Kenyte', 'Clay': 'Clay'
  };`;

content = content.replace(sysMapRevTarget, sysMapRevReplacement);
content = content.replace(sysMapTarget, sysMapReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
