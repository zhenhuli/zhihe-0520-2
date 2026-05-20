import styled from 'styled-components';
import { PENTATONIC_NOTES } from '../utils/audioUtils';

const Wrapper = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 400px;
  overflow-y: auto;

  h3 {
    font-size: 16px;
    margin-bottom: 16px;
    color: rgba(255, 255, 255, 0.9);
  }

  .empty {
    text-align: center;
    padding: 40px 20px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
  }
`;

const MelodyItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .melody-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .melody-name {
      font-weight: 600;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }

    .melody-meta {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .melody-notes {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    flex-wrap: wrap;

    .note-dot {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: white;
    }

    .empty-dot {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .melody-actions {
    display: flex;
    gap: 8px;

    button {
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;

      &.load {
        background: rgba(52, 152, 219, 0.2);
        color: #3498db;
        border: 1px solid #3498db;
      }

      &.play {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
        border: 1px solid #2ecc71;
      }

      &.delete {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: 1px solid #e74c3c;
      }

      &:hover {
        transform: translateY(-1px);
      }
    }
  }
`;

const SavedMelodies = ({ melodies, onLoad, onDelete, onPlay }) => {
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <Wrapper>
      <h3>💾 已保存的音律</h3>
      {melodies.length === 0 ? (
        <div className="empty">暂无保存的音律<br />创作并保存你的第一个旋律吧！</div>
      ) : (
        melodies.map(melody => (
          <MelodyItem key={melody.id}>
            <div className="melody-header">
              <span className="melody-name">{melody.name}</span>
              <span className="melody-meta">{melody.bpm} BPM · {formatDate(melody.createdAt)}</span>
            </div>
            <div className="melody-notes">
              {melody.notes.map((note, idx) => (
                note ? (
                  <div
                  key={idx}
                  className="note-dot"
                  style={{ background: PENTATONIC_NOTES[note]?.color || '#666' }}
                >
                  {PENTATONIC_NOTES[note]?.name || '?'}
                </div>
              ) : (
                <div key={idx} className="empty-dot" />
              )
              ))}
            </div>
            <div className="melody-actions">
              <button className="load" onClick={() => onLoad(melody)}>加载</button>
              <button className="play" onClick={() => onPlay(melody)}>试听</button>
              <button className="delete" onClick={() => onDelete(melody.id)}>删除</button>
            </div>
          </MelodyItem>
        ))
      )}
    </Wrapper>
  );
};

export default SavedMelodies;
