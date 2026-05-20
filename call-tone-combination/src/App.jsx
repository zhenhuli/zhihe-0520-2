import { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import Note from './components/Note';
import EditorSlot from './components/EditorSlot';
import ControlPanel from './components/ControlPanel';
import SavedMelodies from './components/SavedMelodies';
import { NOTE_ORDER, playMelody, exportToText, downloadFile, getAudioContext } from './utils/audioUtils';
import { saveMelody, getMelodies, deleteMelody } from './utils/storageUtils';

const AppWrapper = styled.div`
  min-height: 100vh;
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 42px;
    font-weight: 700;
    background: linear-gradient(135deg, #e74c3c, #f1c40f, #2ecc71, #3498db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
    letter-spacing: 8px;
  }

  .subtitle {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    letter-spacing: 2px;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const NotePalette = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 16px;
    font-weight: 500;
  }

  .notes {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const MelodyEditor = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 16px;
    font-weight: 500;
  }

  .slots {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    min-height: 100px;
  }

  .hint {
    text-align: center;
    margin-top: 16px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  padding: 28px;
  min-width: 360px;
  max-width: 90vw;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  h3 {
    font-size: 18px;
    margin-bottom: 16px;
    color: white;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 20px;
    line-height: 1.5;
  }

  input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 14px;
    margin-bottom: 20px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #3498db;
      background: rgba(52, 152, 219, 0.1);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  button {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &.cancel {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }
    }

    &.confirm {
      background: #3498db;
      color: white;

      &:hover {
        background: #2980b9;
      }
    }

    &.danger {
      background: #e74c3c;
      color: white;

      &:hover {
        background: #c0392b;
      }
    }
  }
`;

const SLOT_COUNT = 16;

function App() {
  const [notes, setNotes] = useState(Array(SLOT_COUNT).fill(null));
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [overIndex, setOverIndex] = useState(-1);
  const [savedMelodies, setSavedMelodies] = useState([]);
  const [stopPlayback, setStopPlayback] = useState(null);
  const [modal, setModal] = useState({ type: null, data: null });
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setSavedMelodies(getMelodies());
  }, []);

  useEffect(() => {
    if (modal.type === 'save' && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [modal.type]);

  const hasNotes = notes.some(n => n !== null);

  const handleDrop = (index, noteKey) => {
    const newNotes = [...notes];
    newNotes[index] = noteKey;
    setNotes(newNotes);
    setOverIndex(-1);
  };

  const handleRemove = (index) => {
    const newNotes = [...notes];
    newNotes[index] = null;
    setNotes(newNotes);
  };

  const handleClear = () => {
    setModal({ type: 'confirmClear' });
  };

  const confirmClear = () => {
    setNotes(Array(SLOT_COUNT).fill(null));
    setModal({ type: null });
  };

  const handlePlay = useCallback(() => {
    getAudioContext();
    setIsPlaying(true);
    setActiveIndex(-1);

    const stopFn = playMelody(
      notes,
      bpm,
      (index) => setActiveIndex(index),
      () => {
        setIsPlaying(false);
        setActiveIndex(-1);
        setStopPlayback(null);
      }
    );
    setStopPlayback(() => stopFn);
  }, [notes, bpm]);

  const handleStop = () => {
    if (stopPlayback) {
      stopPlayback();
    }
    setIsPlaying(false);
    setActiveIndex(-1);
    setStopPlayback(null);
  };

  const handleSave = () => {
    setInputValue(`音律 ${savedMelodies.length + 1}`);
    setModal({ type: 'save' });
  };

  const confirmSave = () => {
    const name = inputValue.trim();
    if (name) {
      saveMelody(name, notes, bpm);
      setSavedMelodies(getMelodies());
    }
    setModal({ type: null });
  };

  const handleExport = () => {
    const content = exportToText(notes);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(content, `宫商角徵羽_音律_${timestamp}.txt`);
  };

  const handleLoadMelody = (melody) => {
    setNotes([...melody.notes, ...Array(SLOT_COUNT - melody.notes.length).fill(null)].slice(0, SLOT_COUNT));
    setBpm(melody.bpm);
  };

  const handleDeleteMelody = (id) => {
    setModal({ type: 'confirmDelete', data: id });
  };

  const confirmDelete = () => {
    if (modal.data) {
      deleteMelody(modal.data);
      setSavedMelodies(getMelodies());
    }
    setModal({ type: null });
  };

  const handlePlaySaved = (melody) => {
    getAudioContext();
    playMelody(melody.notes, melody.bpm);
  };

  return (
    <AppWrapper>
      <Header>
        <h1>宫商角徵羽</h1>
        <p className="subtitle">五声音阶 · 音律组合创作工具</p>
      </Header>

      <MainContent>
        <EditorSection>
          <NotePalette>
            <h3>🎵 音符面板 - 点击试听，拖拽到编辑区</h3>
            <div className="notes">
              {NOTE_ORDER.map(noteKey => (
                <Note key={noteKey} noteKey={noteKey} />
              ))}
            </div>
          </NotePalette>

          <MelodyEditor>
            <h3>🎼 旋律编辑区 - {SLOT_COUNT} 拍</h3>
            <div className="slots">
              {notes.map((note, index) => (
                <EditorSlot
                  key={index}
                  index={index}
                  note={note}
                  $isActive={activeIndex === index}
                  $isOver={overIndex === index}
                  onDrop={handleDrop}
                  onDragOver={() => setOverIndex(index)}
                  onDragLeave={() => setOverIndex(-1)}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            <p className="hint">将上方音符拖拽到格子中，或点击格子右上角的 × 移除音符</p>
          </MelodyEditor>

          <ControlPanel
            bpm={bpm}
            onBpmChange={setBpm}
            onPlay={handlePlay}
            onStop={handleStop}
            onClear={handleClear}
            onSave={handleSave}
            onExport={handleExport}
            isPlaying={isPlaying}
            hasNotes={hasNotes}
          />
        </EditorSection>

        <Sidebar>
          <SavedMelodies
            melodies={savedMelodies}
            onLoad={handleLoadMelody}
            onDelete={handleDeleteMelody}
            onPlay={handlePlaySaved}
          />
        </Sidebar>
      </MainContent>

      {modal.type && (
        <ModalOverlay onClick={() => setModal({ type: null })}>
          <Modal onClick={e => e.stopPropagation()}>
            {modal.type === 'save' && (
              <>
                <h3>保存音律</h3>
                <p>请为这个旋律输入一个名称：</p>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="输入旋律名称..."
                  onKeyDown={e => e.key === 'Enter' && confirmSave()}
                />
                <div className="modal-actions">
                  <button className="cancel" onClick={() => setModal({ type: null })}>取消</button>
                  <button className="confirm" onClick={confirmSave}>保存</button>
                </div>
              </>
            )}

            {modal.type === 'confirmClear' && (
              <>
                <h3>确认清空</h3>
                <p>确定要清空所有音符吗？此操作无法撤销。</p>
                <div className="modal-actions">
                  <button className="cancel" onClick={() => setModal({ type: null })}>取消</button>
                  <button className="danger" onClick={confirmClear}>确认清空</button>
                </div>
              </>
            )}

            {modal.type === 'confirmDelete' && (
              <>
                <h3>确认删除</h3>
                <p>确定要删除这个保存的音律吗？此操作无法撤销。</p>
                <div className="modal-actions">
                  <button className="cancel" onClick={() => setModal({ type: null })}>取消</button>
                  <button className="danger" onClick={confirmDelete}>确认删除</button>
                </div>
              </>
            )}
          </Modal>
        </ModalOverlay>
      )}
    </AppWrapper>
  );
}

export default App;
