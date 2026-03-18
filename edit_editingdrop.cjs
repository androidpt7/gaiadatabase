const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                  <div>
                    <label className="text-[13px] uppercase opacity-50 block mb-1">Technologies (one per line)</label>
                    <textarea 
                      value={editingDrop.initialValue}
                      onChange={(e) => setEditingDrop(prev => prev ? ({ ...prev, initialValue: e.target.value }) : null)}
                      rows={['Amarna', 'Soris', 'Giza'].includes(editingDrop.category) ? 3 : 2}
                      className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-sm rounded focus:outline-none focus:border-[#90EE90] resize-none"
                      placeholder="e.g. WU 1&#10;WU 2"
                    />
                  </div>`;

const replacement = `                  <div>
                    <label className="text-[13px] uppercase opacity-50 block mb-1">Technologies (one per line)</label>
                    {(() => {
                      const planet = planets.find(p => p.id === editingDrop.planetId);
                      if (planet && planet.ring <= 4) {
                        const allowedItems = CATEGORY_ITEMS[editingDrop.category] || Object.keys(ITEM_ICONS);
                        const currentItems = editingDrop.initialValue.split('\\n').filter(t => t.trim() !== '').map(t => parseTechName(t).item);
                        
                        const ringPrefixes: Record<number, string> = {
                          1: 'Ecoglyte',
                          2: 'Oolyte',
                          3: 'Dolomyte',
                          4: 'Kenyte'
                        };
                        const prefix = ringPrefixes[planet.ring] || '';
                        
                        return (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {allowedItems.map(item => (
                              <label key={item} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-[#333] rounded">
                                <input 
                                  type="checkbox" 
                                  checked={currentItems.includes(item)}
                                  onChange={(e) => {
                                    const newItems = e.target.checked 
                                      ? [...currentItems, item] 
                                      : currentItems.filter(i => i !== item);
                                    const newValue = newItems.map(i => \`\${prefix} \${i}\`).join('\\n');
                                    setEditingDrop(prev => prev ? ({ ...prev, initialValue: newValue }) : null);
                                  }}
                                  className="rounded bg-[#2A2A2A] border-[#444] text-[#90EE90] focus:ring-[#90EE90]"
                                />
                                <span className="text-sm">{item}</span>
                              </label>
                            ))}
                          </div>
                        );
                      }
                      
                      return (
                        <textarea 
                          value={editingDrop.initialValue}
                          onChange={(e) => setEditingDrop(prev => prev ? ({ ...prev, initialValue: e.target.value }) : null)}
                          rows={['Amarna', 'Soris', 'Giza'].includes(editingDrop.category) ? 3 : 2}
                          className="w-full bg-[#2A2A2A] border border-[#333] p-2 text-sm rounded focus:outline-none focus:border-[#90EE90] resize-none"
                          placeholder="e.g. WU 1\\nWU 2"
                        />
                      );
                    })()}
                  </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log('Done');
