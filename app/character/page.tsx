import React, { useState } from 'react'

// Helper to calculate D&D ability score modifiers
const getModifier = (score) => Math.floor((score - 10) / 2);

export default function CharactersPage() {
  // State for storing all player-created character sheets. Starts completely empty!
  const [characters, setCharacters] = useState([]);
  // ID of the character sheet currently being viewed in detail (null = on dashboard)
  const [activeCharacterId, setActiveCharacterId] = useState(null);
  // State to control the creation form modal
  const [isCreating, setIsCreating] = useState(false);
  
  const [newCharForm, setNewCharForm] = useState({
    name: '',
    race: 'Human',
    className: 'Fighter',
    level: 1,
    xp: 0,
    background: 'Soldier',
    playerName: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    armorClass: 10,
    maxHp: 10,
    speed: 30,
    proficiencyBonus: 2,
  });

  // Handle input changes for the creation form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewCharForm((prev) => ({
      ...prev,
      [name]: ['level', 'xp', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'armorClass', 'maxHp', 'speed', 'proficiencyBonus'].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  // Submit handler to save the new character sheet to the vault
  const handleSaveNewCharacter = (e) => {
    e.preventDefault();
    if (!newCharForm.name.trim()) return;

    const strMod = getModifier(newCharForm.strength);
    const dexMod = getModifier(newCharForm.dexterity);
    const conMod = getModifier(newCharForm.constitution);
    const intMod = getModifier(newCharForm.intelligence);
    const wisMod = getModifier(newCharForm.wisdom);
    const chaMod = getModifier(newCharForm.charisma);
    const prof = newCharForm.proficiencyBonus;

    const createdCharacter = {
      id: Date.now().toString(),
      name: newCharForm.name,
      race: newCharForm.race,
      className: newCharForm.className,
      level: newCharForm.level,
      xp: newCharForm.xp,
      background: newCharForm.background,
      playerName: newCharForm.playerName || 'Anonymous',
      stats: {
        strength: newCharForm.strength,
        dexterity: newCharForm.dexterity,
        constitution: newCharForm.constitution,
        intelligence: newCharForm.intelligence,
        wisdom: newCharForm.wisdom,
        charisma: newCharForm.charisma,
      },
      combat: {
        currentHp: newCharForm.maxHp,
        maxHp: newCharForm.maxHp,
        tempHp: 0,
        armorClass: newCharForm.armorClass,
        initiative: dexMod,
        speed: newCharForm.speed,
        proficiencyBonus: prof,
      },
      savingThrows: {
        Strength: { proficient: false, modifier: strMod },
        Dexterity: { proficient: false, modifier: dexMod },
        Constitution: { proficient: false, modifier: conMod },
        Intelligence: { proficient: false, modifier: intMod },
        Wisdom: { proficient: false, modifier: wisMod },
        Charisma: { proficient: false, modifier: chaMod },
      },
      skills: {
        Acrobatics: { proficient: false, modifier: dexMod, stat: 'Dex' },
        AnimalHandling: { proficient: false, modifier: wisMod, stat: 'Wis' },
        Arcana: { proficient: false, modifier: intMod, stat: 'Int' },
        Athletics: { proficient: false, modifier: strMod, stat: 'Str' },
        Deception: { proficient: false, modifier: chaMod, stat: 'Cha' },
        History: { proficient: false, modifier: intMod, stat: 'Int' },
        Insight: { proficient: false, modifier: wisMod, stat: 'Wis' },
        Intimidation: { proficient: false, modifier: chaMod, stat: 'Cha' },
        Investigation: { proficient: false, modifier: intMod, stat: 'Int' },
        Medicine: { proficient: false, modifier: wisMod, stat: 'Wis' },
        Nature: { proficient: false, modifier: intMod, stat: 'Int' },
        Perception: { proficient: false, modifier: wisMod, stat: 'Wis' },
        Performance: { proficient: false, modifier: chaMod, stat: 'Cha' },
        Persuasion: { proficient: false, modifier: chaMod, stat: 'Cha' },
        Religion: { proficient: false, modifier: intMod, stat: 'Int' },
        SleightOfHand: { proficient: false, modifier: dexMod, stat: 'Dex' },
        Stealth: { proficient: false, modifier: dexMod, stat: 'Dex' },
        Survival: { proficient: false, modifier: wisMod, stat: 'Wis' },
      },
      attacks: [
        { name: 'Unarmed Strike', bonus: `+${strMod + prof}`, damage: `1 + ${strMod} bludgeoning` }
      ],
      deathSaves: { successes: 0, failures: 0 },
    };

    setCharacters([...characters, createdCharacter]);
    setIsCreating(false);
    // Reset form defaults
    setNewCharForm({
      name: '',
      race: 'Human',
      className: 'Fighter',
      level: 1,
      xp: 0,
      background: 'Soldier',
      playerName: '',
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      armorClass: 10,
      maxHp: 10,
      speed: 30,
      proficiencyBonus: 2,
    });
  };

  // Find active character for detailed view
  const activeCharacter = characters.find((c) => c.id === activeCharacterId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* App Header with Orange Gradient Text */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-200 bg-clip-text text-transparent drop-shadow-sm">
          D&D Character Vault
        </h1>
        <p className="text-zinc-400 mt-2 text-sm md:text-base">
          Forge your legends. Create, track, and manage your custom D&D campaign heroes.
        </p>
      </header>

      {/* DASHBOARD VIEW */}
      {!activeCharacter && !isCreating && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* Create New Character Square Button (+) */}
            <button
              onClick={() => setIsCreating(true)}
              className="group h-64 border-2 border-dashed border-zinc-700 hover:border-amber-500 rounded-2xl flex flex-col items-center justify-center bg-zinc-900/50 hover:bg-zinc-900 transition-all duration-300 shadow-lg cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-zinc-800 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
                <span className="text-3xl font-light text-zinc-400 group-hover:text-amber-400">+</span>
              </div>
              <span className="mt-4 text-sm font-semibold text-zinc-400 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-orange-200 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                Create New Sheet
              </span>
            </button>

            {/* List of Player-Created Sheets */}
            {characters.map((char) => (
              <div
                key={char.id}
                onClick={() => setActiveCharacterId(char.id)}
                className="h-64 border border-zinc-800 hover:border-amber-500/60 rounded-2xl p-6 bg-zinc-900 flex flex-col justify-between transition-all duration-300 shadow-xl cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                    Level {char.level} {char.className}
                  </span>
                  <h3 className="text-xl font-bold text-zinc-100 mt-1 group-hover:text-amber-400 transition-colors truncate">
                    {char.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {char.race} • {char.background}
                  </p>
                </div>

                {/* Summary Combat Stats */}
                <div className="grid grid-cols-3 gap-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">AC</div>
                    <div className="text-sm font-bold text-amber-400">{char.combat.armorClass}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">HP</div>
                    <div className="text-sm font-bold text-emerald-400">
                      {char.combat.currentHp}/{char.combat.maxHp}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Init</div>
                    <div className="text-sm font-bold text-orange-400">+{char.combat.initiative}</div>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 flex justify-between items-center pt-2 border-t border-zinc-800/50">
                  <span>Player: {char.playerName}</span>
                  <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Sheet →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty Vault State Notice */}
          {characters.length === 0 && (
            <div className="text-center mt-12 text-zinc-500 text-sm">
              Your vault is currently empty. Click <span className="text-amber-400 font-semibold">+ Create New Sheet</span> to begin!
            </div>
          )}
        </div>
      )}

      {/* CHARACTER CREATION FORM MODAL / VIEW */}
      {isCreating && (
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
              Create New D&D Character
            </h2>
            <button
              onClick={() => setIsCreating(false)}
              className="text-zinc-400 hover:text-zinc-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveNewCharacter} className="space-y-6">
            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">Character Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={newCharForm.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Lyra Sunwhisper"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">Player Name</label>
                <input
                  type="text"
                  name="playerName"
                  value={newCharForm.playerName}
                  onChange={handleFormChange}
                  placeholder="e.g. Sarah"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">Class</label>
                <input
                  type="text"
                  name="className"
                  value={newCharForm.className}
                  onChange={handleFormChange}
                  placeholder="e.g. Wizard, Rogue"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">Race</label>
                <input
                  type="text"
                  name="race"
                  value={newCharForm.race}
                  onChange={handleFormChange}
                  placeholder="e.g. Elf, Dwarf"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">Level</label>
                <input
                  type="number"
                  name="level"
                  min="1"
                  max="20"
                  value={newCharForm.level}
                  onChange={handleFormChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">Background</label>
                <input
                  type="text"
                  name="background"
                  value={newCharForm.background}
                  onChange={handleFormChange}
                  placeholder="e.g. Sage, Noble"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Core Stats Section */}
            <div>
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">Core Ability Scores</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((stat) => (
                  <div key={stat} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                    <label className="text-[10px] uppercase text-zinc-400 block mb-1">{stat}</label>
                    <input
                      type="number"
                      name={stat}
                      value={newCharForm[stat]}
                      onChange={handleFormChange}
                      className="w-16 bg-zinc-900 border border-zinc-700 rounded text-center text-sm font-bold text-amber-400 py-1 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-zinc-500 block mt-1">
                      Mod: {getModifier(newCharForm[stat]) >= 0 ? `+${getModifier(newCharForm[stat])}` : getModifier(newCharForm[stat])}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Combat Stats Section */}
            <div>
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">Combat Stats</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Armor Class (AC)</label>
                  <input
                    type="number"
                    name="armorClass"
                    value={newCharForm.armorClass}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded text-center text-sm font-bold text-amber-400 py-1 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Max HP</label>
                  <input
                    type="number"
                    name="maxHp"
                    value={newCharForm.maxHp}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded text-center text-sm font-bold text-emerald-400 py-1 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Speed (ft)</label>
                  <input
                    type="number"
                    name="speed"
                    value={newCharForm.speed}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded text-center text-sm font-bold text-yellow-300 py-1 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Prof. Bonus</label>
                  <input
                    type="number"
                    name="proficiencyBonus"
                    value={newCharForm.proficiencyBonus}
                    onChange={handleFormChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded text-center text-sm font-bold text-amber-300 py-1 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold rounded-lg text-sm shadow-lg transition-all"
              >
                Save Sheet to Vault
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAILED CHARACTER SHEET VIEW */}
      {activeCharacter && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back button */}
          <button
            onClick={() => setActiveCharacterId(null)}
            className="text-sm font-medium bg-zinc-900 border border-zinc-800 hover:border-amber-500/60 px-4 py-2 rounded-lg text-zinc-300 hover:text-amber-400 transition-all flex items-center gap-2"
          >
            ← Back to Vault
          </button>

          {/* Top Bio Header */}          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider block">Character Name</span>
              <div className="text-lg font-bold text-amber-400 mt-1">{activeCharacter.name}</div>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider block">Class & Level</span>
              <div className="text-sm font-medium text-zinc-200 mt-1">
                {activeCharacter.className} (Level {activeCharacter.level})
              </div>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider block">Race & Background</span>
              <div className="text-sm font-medium text-zinc-200 mt-1">
                {activeCharacter.race} • {activeCharacter.background}
              </div>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider block">Player Name</span>
              <div className="text-sm font-medium text-zinc-200 mt-1">{activeCharacter.playerName}</div>
            </div>
          </div>

          {/* Core Stats & Combat/Skills Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Core Stats Column */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent text-center border-b border-zinc-800 pb-2">
                  Core Stats
                </h2>
                {Object.entries(activeCharacter.stats).map(([statName, val]) => {
                  const mod = getModifier(val);
                  return (
                    <div
                      key={statName}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center flex flex-col items-center"
                    >
                      <span className="text-xs font-medium uppercase text-zinc-400">{statName}</span>
                      <span className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-200 bg-clip-text text-transparent my-0.5">
                        {mod >= 0 ? `+${mod}` : mod}
                      </span>
                      <span className="text-xs text-zinc-500">Score: {val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Details Column */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Combat Stats Bar */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Armor Class</span>
                  <span className="text-lg font-bold text-amber-400">{activeCharacter.combat.armorClass}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Initiative</span>
                  <span className="text-lg font-bold text-orange-400">+{activeCharacter.combat.initiative}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Speed</span>
                  <span className="text-lg font-bold text-yellow-300">{activeCharacter.combat.speed} ft</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Prof. Bonus</span>
                  <span className="text-lg font-bold text-amber-300">+{activeCharacter.combat.proficiencyBonus}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 col-span-2 sm:col-span-3">
                  <span className="text-[10px] text-zinc-500 uppercase block">Hit Points (Current / Max)</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-lg font-bold text-emerald-400">{activeCharacter.combat.currentHp}</span>
                    <span className="text-zinc-600">/</span>
                    <span className="text-lg font-bold text-zinc-300">{activeCharacter.combat.maxHp}</span>
                    <span className="text-xs text-zinc-500 ml-2">(Temp: {activeCharacter.combat.tempHp})</span>
                  </div>
                </div>
              </div>

              {/* Saving Throws & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Saving Throws */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent border-b border-zinc-800 pb-2">
                    Saving Throws
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {Object.entries(activeCharacter.savingThrows).map(([saveName, data]) => (
                      <div key={saveName} className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={data.proficient}
                            onChange={() => {
                              const updated = characters.map((c) => {
                                if (c.id === activeCharacter.id) {
                                  return {
                                    ...c,
                                    savingThrows: {
                                      ...c.savingThrows,
                                      [saveName]: { ...data, proficient: !data.proficient },
                                    },
                                  };
                                }
                                return c;
                              });
                              setCharacters(updated);
                            }}
                            className="accent-amber-500 w-4 h-4 rounded bg-zinc-900 border-zinc-700 cursor-pointer"
                          />
                          <span className="text-xs font-medium text-zinc-300">{saveName}</span>
                        </div>
                        <span className="text-xs font-bold text-amber-400">
                          {data.modifier + (data.proficient ? activeCharacter.combat.proficiencyBonus : 0) >= 0 ? `+${data.modifier + (data.proficient ? activeCharacter.combat.proficiencyBonus : 0)}` : data.modifier + (data.proficient ? activeCharacter.combat.proficiencyBonus : 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent border-b border-zinc-800 pb-2">
                    Skills
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {Object.entries(activeCharacter.skills).map(([skillName, data]) => (
                      <div key={skillName} className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={data.proficient}
                            onChange={() => {
                              const updated = characters.map((c) => {
                                if (c.id === activeCharacter.id) {
                                  return {
                                    ...c,
                                    skills: {
                                      ...c.skills,
                                      [skillName]: { ...data, proficient: !data.proficient },
                                    },
                                  };
                                }
                                return c;
                              });
                              setCharacters(updated);
                            }}
                            className="accent-amber-500 w-4 h-4 rounded bg-zinc-900 border-zinc-700 cursor-pointer"
                          />
                          <span className="text-xs font-medium text-zinc-300">
                            {skillName} <span className="text-zinc-500 text-[10px]">({data.stat})</span>
                          </span>
                        </div>
                        <span className="text-xs font-bold text-amber-400">
                          {data.modifier + (data.proficient ? activeCharacter.combat.proficiencyBonus : 0) >= 0 ? `+${data.modifier + (data.proficient ? activeCharacter.combat.proficiencyBonus : 0)}` : data.modifier + (data.proficient ? activeCharacter.combat.proficiencyBonus : 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Attacks & Death Saves */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Attacks */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent border-b border-zinc-800 pb-2">
                    Attacks & Spellcasting
                  </h3>
                  <div className="space-y-2">
                    {activeCharacter.attacks.map((atk, idx) => (
                      <div key={idx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-zinc-200 block">{atk.name}</span>
                          <span className="text-zinc-400">{atk.damage}</span>
                        </div>
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold">
                          {atk.bonus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Death Saving Throws */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent border-b border-zinc-800 pb-2">
                    Death Saving Throws
                  </h3>
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800">
                      <span className="text-xs font-medium text-emerald-400">Successes</span>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              const current = activeCharacter.deathSaves.successes;
                              const updated = characters.map((c) => {
                                if (c.id === activeCharacter.id) {
                                  return {
                                    ...c,
                                    deathSaves: {
                                      ...c.deathSaves,
                                      successes: current === num ? num - 1 : num,
                                    },
                                  };
                                }
                                return c;
                              });
                              setCharacters(updated);
                            }}
                            className={`w-4 h-4 rounded-full border border-emerald-500/50 cursor-pointer ${
                              num <= activeCharacter.deathSaves.successes ? 'bg-emerald-500' : 'bg-zinc-900'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800">
                      <span className="text-xs font-medium text-rose-400">Failures</span>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              const current = activeCharacter.deathSaves.failures;
                              const updated = characters.map((c) => {
                                if (c.id === activeCharacter.id) {
                                  return {
                                    ...c,
                                    deathSaves: {
                                      ...c.deathSases,
                                      failures: current === num ? num - 1 : num,
                                    },
                                  };
                                }
                                return c;
                              });
                              setCharacters(updated);
                            }}
                            className={`w-4 h-4 rounded-full border border-rose-500/50 cursor-pointer ${
                              num <= activeCharacter.deathSaves.failures ? 'bg-rose-500' : 'bg-zinc-900'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}