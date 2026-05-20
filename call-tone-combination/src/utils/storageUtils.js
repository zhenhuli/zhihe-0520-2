const STORAGE_KEY = 'pentatonic_melodies';

export const saveMelody = (name, notes, bpm) => {
  const melodies = getMelodies();
  const newMelody = {
    id: Date.now().toString(),
    name,
    notes,
    bpm,
    createdAt: new Date().toISOString(),
  };
  melodies.unshift(newMelody);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(melodies));
  return newMelody;
};

export const getMelodies = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const deleteMelody = (id) => {
  const melodies = getMelodies();
  const filtered = melodies.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

export const updateMelody = (id, updates) => {
  const melodies = getMelodies();
  const index = melodies.findIndex(m => m.id === id);
  if (index !== -1) {
    melodies[index] = { ...melodies[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(melodies));
    return melodies[index];
  }
  return null;
};
