const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                  <div>
                    <label className="text-[13px] uppercase opacity-50 block mb-1">System</label>
                    <select 
                      required value={newDrop.system}
                      onChange={(e) => updateTechName(e.target.value, newDrop.type, newDrop.item)}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-sm rounded focus:outline-none"
                    >
                      <option value="">Select System...</option>
                      {['Vega', 'Antares', 'Gemini', 'Mizar', 'Sol', 'Draconis', 'Sirius'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[13px] uppercase opacity-50 block mb-1">Type</label>
                    <select 
                      required value={newDrop.type}
                      onChange={(e) => updateTechName(newDrop.system, e.target.value, newDrop.item)}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-sm rounded focus:outline-none"
                    >
                      <option value="">Select Type...</option>
                      {['Rapid', 'Long', 'Normal', 'Strong'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>`;

const replacement = `                  {(!newDrop.planet_id || (planets.find(p => p.id === newDrop.planet_id)?.ring || 5) > 4) && (
                    <>
                      <div>
                        <label className="text-[13px] uppercase opacity-50 block mb-1">System</label>
                        <select 
                          required value={newDrop.system}
                          onChange={(e) => updateTechName(e.target.value, newDrop.type, newDrop.item)}
                          className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-sm rounded focus:outline-none"
                        >
                          <option value="">Select System...</option>
                          {['Vega', 'Antares', 'Gemini', 'Mizar', 'Sol', 'Draconis', 'Sirius'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[13px] uppercase opacity-50 block mb-1">Type</label>
                        <select 
                          required value={newDrop.type}
                          onChange={(e) => updateTechName(newDrop.system, e.target.value, newDrop.item)}
                          className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-sm rounded focus:outline-none"
                        >
                          <option value="">Select Type...</option>
                          {['Rapid', 'Long', 'Normal', 'Strong'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </>
                  )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log('Done');
