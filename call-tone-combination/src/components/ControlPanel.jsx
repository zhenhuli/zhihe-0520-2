import styled from 'styled-components';

const PanelWrapper = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const BPMControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;

  label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .bpm-slider {
    display: flex;
    align-items: center;
    gap: 16px;

    input[type='range'] {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.2);
      appearance: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3498db;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(52, 152, 219, 0.5);
      }
    }

    .bpm-value {
      font-size: 20px;
      font-weight: bold;
      color: #3498db;
      min-width: 60px;
      text-align: center;
    }
  }

  .bpm-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    opacity: 0.5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  flex: 1;
  min-width: 100px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$primary ? '#3498db' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$primary ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${props => props.$primary ? '#3498db' : 'rgba(255, 255, 255, 0.2)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px ${props => props.$primary ? 'rgba(52, 152, 219, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  &.danger {
    background: rgba(231, 76, 60, 0.2);
    border-color: #e74c3c;
    color: #e74c3c;

    &:hover {
      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
    }
  }

  &.success {
    background: rgba(46, 204, 113, 0.2);
    border-color: #2ecc71;
    color: #2ecc71;

    &:hover {
      box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
    }
  }
`;

const ControlPanel = ({ bpm, onBpmChange, onPlay, onStop, onClear, onSave, onExport, isPlaying, hasNotes }) => {
  return (
    <PanelWrapper>
      <BPMControl>
        <label>节拍速度 (BPM)</label>
        <div className="bpm-slider">
          <input
            type="range"
            min="40"
            max="200"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
          />
          <span className="bpm-value">{bpm}</span>
        </div>
        <div className="bpm-label">
          <span>慢 40</span>
          <span>快 200</span>
        </div>
      </BPMControl>

      <ButtonGroup>
        {!isPlaying ? (
          <Button $primary onClick={onPlay} disabled={!hasNotes}>
            ▶ 播放
          </Button>
        ) : (
          <Button className="danger" onClick={onStop}>
            ■ 停止
          </Button>
        )}
        <Button onClick={onClear} disabled={!hasNotes}>
          ↺ 清空
        </Button>
        <Button className="success" onClick={onSave} disabled={!hasNotes}>
          💾 保存
        </Button>
        <Button onClick={onExport} disabled={!hasNotes}>
          📄 导出
        </Button>
      </ButtonGroup>
    </PanelWrapper>
  );
};

export default ControlPanel;
