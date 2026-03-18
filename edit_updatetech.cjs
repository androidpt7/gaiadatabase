const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const updateTechName = (system: string, type: string, item: string) => {
    const abbr = getAbbreviation(system, type);
    setNewDrop(prev => ({ 
      ...prev, 
      system, 
      type, 
      item,
      tech_name: \`\${abbr} \${item}\`.trim() 
    }));
  };`;

const replacement = `  const updateTechName = (system: string, type: string, item: string, planetId?: string) => {
    const pId = planetId || newDrop.planet_id;
    const planet = planets.find(p => p.id === pId);
    let abbr = getAbbreviation(system, type);
    let finalSystem = system;
    let finalType = type;
    
    if (planet && planet.ring <= 4) {
      const ringPrefixes: Record<number, string> = {
        1: 'Ecoglyte',
        2: 'Oolyte',
        3: 'Dolomyte',
        4: 'Kenyte'
      };
      abbr = ringPrefixes[planet.ring] || '';
      finalSystem = abbr;
      finalType = 'Normal';
    }
    
    setNewDrop(prev => ({ 
      ...prev, 
      system: finalSystem, 
      type: finalType, 
      item,
      tech_name: \`\${abbr} \${item}\`.trim() 
    }));
  };`;

content = content.replace(target, replacement);

const target2 = `                      onChange={(e) => setNewDrop(prev => ({ ...prev, planet_id: e.target.value }))}`;
const replacement2 = `                      onChange={(e) => {
                        setNewDrop(prev => ({ ...prev, planet_id: e.target.value }));
                        updateTechName(newDrop.system, newDrop.type, newDrop.item, e.target.value);
                      }}`;

content = content.replace(target2, replacement2);

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
