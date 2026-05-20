import styled from 'styled-components';
import { PENTATONIC_NOTES } from '../utils/audioUtils';
import { playNote } from '../utils/audioUtils';

const NoteWrapper = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  transition: all 0.2s ease;
  background: ${props => props.color}22;
  border: 2px solid ${props => props.color};
  color: ${props => props.color};
  box-shadow: 0 4px 15px ${props => props.color}40;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${props => props.color}60;
  }

  &:active {
    cursor: grabbing;
    transform: scale(0.95);
  }

  .note-name {
    font-size: 24px;
    font-weight: bold;
  }

  .note-pinyin {
    font-size: 11px;
    opacity: 0.8;
    margin-top: 2px;
  }
`;

const Note = ({ noteKey, draggable = true, onClick, onDragStart }) => {
  const note = PENTATONIC_NOTES[noteKey];
  
  if (!note) return null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('noteKey', noteKey);
    e.dataTransfer.effectAllowed = 'copy';
    if (onDragStart) onDragStart(noteKey);
  };

  const handleClick = () => {
    playNote(noteKey, 0.3, 0.5);
    if (onClick) onClick(noteKey);
  };

  return (
    <NoteWrapper
      color={note.color}
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={handleClick}
      title="点击试听，拖拽到编辑区"
    >
      <span className="note-name">{note.name}</span>
      <span className="note-pinyin">{note.pinyin}</span>
    </NoteWrapper>
  );
};

export default Note;
