export const PENTATONIC_NOTES = {
  gong: { name: '宫', pinyin: 'Gōng', frequency: 261.63, color: '#e74c3c' },
  shang: { name: '商', pinyin: 'Shāng', frequency: 293.66, color: '#e67e22' },
  jue: { name: '角', pinyin: 'Jué', frequency: 329.63, color: '#f1c40f' },
  zhi: { name: '徵', pinyin: 'Zhǐ', frequency: 392.00, color: '#2ecc71' },
  yu: { name: '羽', pinyin: 'Yǔ', frequency: 440.00, color: '#3498db' },
};

export const NOTE_ORDER = ['gong', 'shang', 'jue', 'zhi', 'yu'];

let audioContext = null;

export const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

export const playNote = (noteKey, duration = 0.4, volume = 0.5) => {
  const ctx = getAudioContext();
  const note = PENTATONIC_NOTES[noteKey];
  
  if (!note) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(note.frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

export const playMelody = (notes, bpm = 120, onNotePlay, onComplete) => {
  const ctx = getAudioContext();
  const beatDuration = 60 / bpm;
  
  let currentTime = 0;
  const timeouts = [];

  notes.forEach((note, index) => {
    if (note) {
      const timeout = setTimeout(() => {
        playNote(note, beatDuration * 0.8, 0.6);
        if (onNotePlay) onNotePlay(index);
      }, currentTime * 1000);
      timeouts.push(timeout);
    }
    currentTime += beatDuration;
  });

  const completeTimeout = setTimeout(() => {
    if (onComplete) onComplete();
  }, currentTime * 1000);
  timeouts.push(completeTimeout);

  return () => {
    timeouts.forEach(t => clearTimeout(t));
  };
};

export const exportToText = (notes) => {
  const noteNames = notes.map(note => {
    if (!note) return '-';
    return PENTATONIC_NOTES[note]?.name || note;
  });
  
  const pinyinNames = notes.map(note => {
    if (!note) return '-';
    return PENTATONIC_NOTES[note]?.pinyin || note;
  });

  return `宫商角徵羽 音律组合
====================
音符序列: ${noteNames.join(' ')}
拼音标注: ${pinyinNames.join(' ')}
音符数量: ${notes.filter(n => n).length}/${notes.length}
创建时间: ${new Date().toLocaleString('zh-CN')}
====================`;
};

export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
