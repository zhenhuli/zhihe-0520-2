import { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { industryTemplates } from '../data/industryTemplates';
import type { IndustryTemplate } from '../data/industryTemplates';

export function IndustryTemplates() {
  const { dispatch } = useResume();
  const [expanded, setExpanded] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<IndustryTemplate | null>(null);

  const handleLoadTemplate = (template: IndustryTemplate) => {
    if (confirm(`确定要加载「${template.name}」模板吗？这将替换当前所有简历内容。`)) {
      dispatch({ type: 'LOAD_TEMPLATE', payload: template });
      setPreviewTemplate(null);
      setExpanded(false);
    }
  };

  const handlePreview = (template: IndustryTemplate) => {
    setPreviewTemplate(template);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };

  return (
    <div className="industry-templates">
      <div
        className="industry-templates-header"
        onClick={() => setExpanded(!expanded)}
      >
        <h4 className="module-list-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: 'middle' }}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          行业参考模板
        </h4>
        <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>
      <p className="module-list-hint">选择行业模板快速填充示例内容</p>

      {expanded && (
        <div className="industry-templates-list">
          {industryTemplates.map((template) => (
            <div
              key={template.id}
              className="industry-template-card"
              onClick={() => handlePreview(template)}
            >
              <div className="template-card-icon">{template.icon}</div>
              <div className="template-card-info">
                <div className="template-card-name">{template.name}</div>
                <div className="template-card-industry">{template.industry}</div>
              </div>
              <span className="template-card-arrow">›</span>
            </div>
          ))}
        </div>
      )}

      {previewTemplate && (
        <div className="template-preview-overlay" onClick={handleClosePreview}>
          <div className="template-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="template-preview-header">
              <div className="template-preview-title">
                <span className="template-preview-icon">{previewTemplate.icon}</span>
                <div>
                  <h3>{previewTemplate.name}</h3>
                  <span className="template-preview-industry">{previewTemplate.industry}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={handleClosePreview}
              >
                ✕
              </button>
            </div>

            <div className="template-preview-body">
              <p className="template-preview-desc">{previewTemplate.description}</p>

              <div className="template-preview-section">
                <h4>基础信息</h4>
                <div className="preview-basic-info">
                  <span className="preview-name">{previewTemplate.data.basicInfo.name}</span>
                  <span className="preview-position">{previewTemplate.data.basicInfo.position}</span>
                  <span className="preview-location">{previewTemplate.data.basicInfo.location}</span>
                </div>
              </div>

              <div className="template-preview-section">
                <h4>工作经历</h4>
                {previewTemplate.data.workExperience.map((exp) => (
                  <div key={exp.id} className="preview-exp-item">
                    <div className="preview-exp-company">{exp.company}</div>
                    <div className="preview-exp-position">{exp.position}</div>
                    <div className="preview-exp-date">{exp.startTime} - {exp.endTime}</div>
                  </div>
                ))}
              </div>

              <div className="template-preview-section">
                <h4>项目经历</h4>
                {previewTemplate.data.projectExperience.map((exp) => (
                  <div key={exp.id} className="preview-exp-item">
                    <div className="preview-exp-company">{exp.projectName}</div>
                    <div className="preview-exp-position">{exp.position}</div>
                    <div className="preview-exp-date">{exp.startTime} - {exp.endTime}</div>
                  </div>
                ))}
              </div>

              <div className="template-preview-section">
                <h4>教育经历</h4>
                {previewTemplate.data.education.map((exp) => (
                  <div key={exp.id} className="preview-exp-item">
                    <div className="preview-exp-company">{exp.school}</div>
                    <div className="preview-exp-position">{exp.major} · {exp.degree}</div>
                  </div>
                ))}
              </div>

              <div className="template-preview-section">
                <h4>专业技能</h4>
                <div className="preview-skills">
                  {previewTemplate.data.skills.map((skill) => (
                    <span key={skill.id} className="preview-skill-tag">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              {previewTemplate.data.certificates.length > 0 && (
                <div className="template-preview-section">
                  <h4>证书信息</h4>
                  {previewTemplate.data.certificates.map((cert) => (
                    <div key={cert.id} className="preview-cert-item">
                      <span className="preview-cert-name">{cert.name}</span>
                      <span className="preview-cert-issuer">{cert.issuer}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="template-preview-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClosePreview}
              >
                取消
              </button>
              <button
                type="button"
                className="template-load-btn"
                onClick={() => handleLoadTemplate(previewTemplate)}
              >
                使用此模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
