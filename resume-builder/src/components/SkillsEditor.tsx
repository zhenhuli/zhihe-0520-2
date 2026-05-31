import { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import type { SkillItem, CertificateItem } from '../types';

const proficiencyLabels: Record<number, string> = {
  20: '了解',
  40: '熟悉',
  60: '掌握',
  80: '精通',
  100: '专家',
};

export function SkillsEditor() {
  const { state, dispatch } = useResume();
  const { skills, certificates } = state.data;
  const [newSkillName, setNewSkillName] = useState('');

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    dispatch({
      type: 'ADD_SKILL',
      payload: { name: newSkillName.trim(), proficiency: 60 },
    });
    setNewSkillName('');
  };

  const handleSkillNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleUpdateSkill = (id: string, data: Partial<SkillItem>) => {
    dispatch({ type: 'UPDATE_SKILL', id, payload: data });
  };

  const handleDeleteSkill = (id: string) => {
    dispatch({ type: 'DELETE_SKILL', id });
  };

  const handleAddCertificate = () => {
    dispatch({
      type: 'ADD_CERTIFICATE',
      payload: { name: '', date: '', issuer: '' },
    });
  };

  const handleUpdateCertificate = (id: string, data: Partial<CertificateItem>) => {
    dispatch({ type: 'UPDATE_CERTIFICATE', id, payload: data });
  };

  const handleDeleteCertificate = (id: string) => {
    dispatch({ type: 'DELETE_CERTIFICATE', id });
  };

  return (
    <div className="skills-editor">
      <div className="editor-header">
        <h3 className="editor-title">技能证书</h3>
      </div>

      <div className="skills-section">
        <h4 className="subsection-title">专业技能</h4>
        
        <div className="skill-input-row">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={handleSkillNameKeyDown}
            placeholder="输入技能名称，按回车添加"
            className="skill-input"
          />
          <button type="button" className="add-btn" onClick={handleAddSkill}>
            + 添加
          </button>
        </div>

        {skills.length === 0 ? (
          <div className="empty-state small">
            <p>暂无技能，添加您的专业技能吧</p>
          </div>
        ) : (
          <div className="skills-list">
            {skills.map((skill) => (
              <div key={skill.id} className="skill-item">
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  <button
                    type="button"
                    className="icon-btn small"
                    onClick={() => handleDeleteSkill(skill.id)}
                    title="删除"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="skill-proficiency">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="20"
                    value={skill.proficiency}
                    onChange={(e) => handleUpdateSkill(skill.id, { proficiency: Number(e.target.value) })}
                    className="proficiency-slider"
                  />
                  <span className="proficiency-label">
                    {proficiencyLabels[skill.proficiency] || `${skill.proficiency}%`}
                  </span>
                </div>
                <div className="proficiency-bar">
                  <div
                    className="proficiency-fill"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="certificates-section">
        <div className="subsection-header">
          <h4 className="subsection-title">证书信息</h4>
          <button type="button" className="add-btn small" onClick={handleAddCertificate}>
            + 添加证书
          </button>
        </div>

        {certificates.length === 0 ? (
          <div className="empty-state small">
            <p>暂无证书，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="certificates-list">
            {certificates.map((cert) => (
              <div key={cert.id} className="certificate-item">
                <div className="certificate-fields">
                  <div className="form-group inline">
                    <label>证书名称</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleUpdateCertificate(cert.id, { name: e.target.value })}
                      placeholder="如：英语六级"
                    />
                  </div>
                  <div className="form-group inline">
                    <label>获得时间</label>
                    <input
                      type="month"
                      value={cert.date}
                      onChange={(e) => handleUpdateCertificate(cert.id, { date: e.target.value })}
                    />
                  </div>
                  <div className="form-group inline">
                    <label>颁发机构</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleUpdateCertificate(cert.id, { issuer: e.target.value })}
                      placeholder="如：教育部"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => handleDeleteCertificate(cert.id)}
                  title="删除"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
