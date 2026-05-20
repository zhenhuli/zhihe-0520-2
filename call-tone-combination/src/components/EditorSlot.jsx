import styled from 'styled-components';
import { PENTATONIC_NOTES } from '../utils/audioUtils';

const SlotWrapper = styled.div`
  width: 70px;
  height: 80px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.$isActive ? `${props.$activeColor || '#4ade80'}44` : 'rgba(255,255,255,0.05)'};
  border: 2px ${props => props.$isActive ? 'solid' : 'dashed'} ${props => props.$isOver ? '#4ade80' : 'rgba(255,255,255,0.2)'};
  transition: all 0.2s ease;
  position: relative;

  ${props => props.$isActive && `
    animation: pulse 0.3s ease-out;
    border-style: solid;
  `}

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .slot-index {
    position: absolute;
    top: 4px;
    left: 6px;
    font-size: 10px;
    opacity: 0.5;
  }

  .slot-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .note-name {
    font-size: 22px;
    font-weight: bold;
  }

  .note-pinyin {
    font-size: 10px;
    opacity: 0.8;
    margin-top: 2px;
  }

  .empty-hint {
    font-size: 24px;
    opacity: 0.3;
  }

  .remove-btn {
    position: absolute;
    top: 2px;
    right: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.8);
    color: white;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .remove-btn {
    opacity: 1;
  }
`;

const EditorSlot = ({ note, index, isActive, isOver, onDrop, onDragOver, onDragLeave, onRemove }) => {
  const noteData = note ? PENTATONIC_NOTES[note] : null;

  const handleDrop = (e) => {
    e.preventDefault();
    const noteKey = e.dataTransfer.getData('noteKey');
    if (noteKey && onDrop) {
      onDrop(index, noteKey);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (onDragOver) onDragOver(index);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) onRemove(index);
  };

  return (
    <SlotWrapper
      $isActive={isActive}
      $isOver={isOver}
      $activeColor={noteData?.color}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
    >
      <span className="slot-index">{index + 1}</span>
      {noteData ? (
        <>
          <div className="remove-btn" onClick={handleRemove}>×</div>
          <div className="slot-content" style={{ color: noteData.color }}>
            <span className="note-name">{noteData.name}</span>
            <span className="note-pinyin">{noteData.pinyin}</span>
          </div>
        </>
      ) : (
        <span className="empty-hint">+</span>
      )}
    </SlotWrapper>
  );
};

export default EditorSlot;
