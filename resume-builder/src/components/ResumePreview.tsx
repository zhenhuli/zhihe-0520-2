import { forwardRef } from 'react';
import { useResume } from '../context/ResumeContext';
import type { ModuleType } from '../types';
import { MODULE_TITLES } from '../types';

interface ResumePreviewProps {
  forwardedRef?: React.Ref<HTMLDivElement>;
}

function ClassicTemplate() {
  const { state } = useResume();
  const { data, modules } = state;
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  const renderModule = (moduleType: ModuleType) => {
    switch (moduleType) {
      case 'basicInfo':
        return (
          <div className="tmpl-section tmpl-basic-classic">
            <div className="tmpl-basic-header">
              {data.basicInfo.avatar && (
                <img src={data.basicInfo.avatar} alt="头像" className="tmpl-avatar" />
              )}
              <div className="tmpl-basic-text">
                <h1 className="tmpl-name">{data.basicInfo.name || '您的姓名'}</h1>
                <p className="tmpl-title">{data.basicInfo.position || '应聘岗位'}</p>
              </div>
            </div>
            <div className="tmpl-basic-contact">
              {data.basicInfo.phone && (
                <span className="tmpl-contact-item">
                  <span className="tmpl-contact-label">电话</span>
                  <span className="tmpl-contact-value">{data.basicInfo.phone}</span>
                </span>
              )}
              {data.basicInfo.email && (
                <span className="tmpl-contact-item">
                  <span className="tmpl-contact-label">邮箱</span>
                  <span className="tmpl-contact-value">{data.basicInfo.email}</span>
                </span>
              )}
              {data.basicInfo.age && (
                <span className="tmpl-contact-item">
                  <span className="tmpl-contact-label">年龄</span>
                  <span className="tmpl-contact-value">{data.basicInfo.age}岁</span>
                </span>
              )}
              {data.basicInfo.location && (
                <span className="tmpl-contact-item">
                  <span className="tmpl-contact-label">所在地</span>
                  <span className="tmpl-contact-value">{data.basicInfo.location}</span>
                </span>
              )}
            </div>
          </div>
        );

      case 'workExperience':
        if (data.workExperience.length === 0) return null;
        return (
          <div className="tmpl-section">
            <h2 className="tmpl-section-title">{MODULE_TITLES.workExperience}</h2>
            <div className="tmpl-content-list">
              {data.workExperience.map((item) => (
                <div key={item.id} className="tmpl-exp-item">
                  <div className="tmpl-exp-header">
                    <div className="tmpl-exp-main">
                      <h3 className="tmpl-exp-company">{item.company}</h3>
                      <span className="tmpl-exp-position">{item.position}</span>
                    </div>
                    <span className="tmpl-exp-date">{item.startTime} — {item.endTime}</span>
                  </div>
                  <div className="tmpl-exp-desc">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projectExperience':
        if (data.projectExperience.length === 0) return null;
        return (
          <div className="tmpl-section">
            <h2 className="tmpl-section-title">{MODULE_TITLES.projectExperience}</h2>
            <div className="tmpl-content-list">
              {data.projectExperience.map((item) => (
                <div key={item.id} className="tmpl-exp-item">
                  <div className="tmpl-exp-header">
                    <div className="tmpl-exp-main">
                      <h3 className="tmpl-exp-company">{item.projectName}</h3>
                      <span className="tmpl-exp-position">{item.position}</span>
                    </div>
                    <span className="tmpl-exp-date">{item.startTime} — {item.endTime}</span>
                  </div>
                  <div className="tmpl-exp-desc">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (data.education.length === 0) return null;
        return (
          <div className="tmpl-section">
            <h2 className="tmpl-section-title">{MODULE_TITLES.education}</h2>
            <div className="tmpl-content-list">
              {data.education.map((item) => (
                <div key={item.id} className="tmpl-exp-item">
                  <div className="tmpl-exp-header">
                    <div className="tmpl-exp-main">
                      <h3 className="tmpl-exp-company">{item.school}</h3>
                      <span className="tmpl-exp-position">
                        {item.degree} {item.major && `· ${item.major}`}
                      </span>
                    </div>
                    <span className="tmpl-exp-date">{item.startTime} — {item.endTime}</span>
                  </div>
                  {item.description && <div className="tmpl-exp-desc">{item.description}</div>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (data.skills.length === 0) return null;
        return (
          <div className="tmpl-section">
            <h2 className="tmpl-section-title">专业技能</h2>
            <div className="tmpl-skills-classic">
              {data.skills.map((skill) => (
                <div key={skill.id} className="tmpl-skill-item">
                  <span className="tmpl-skill-name">{skill.name}</span>
                  <div className="tmpl-skill-bar">
                    <div className="tmpl-skill-fill" style={{ width: `${skill.proficiency}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certificates':
        if (data.certificates.length === 0) return null;
        return (
          <div className="tmpl-section">
            <h2 className="tmpl-section-title">证书信息</h2>
            <div className="tmpl-certs-classic">
              {data.certificates.map((cert) => (
                <div key={cert.id} className="tmpl-cert-item">
                  <span className="tmpl-cert-name">{cert.name}</span>
                  {cert.issuer && <span className="tmpl-cert-issuer">{cert.issuer}</span>}
                  {cert.date && <span className="tmpl-cert-date">{cert.date}</span>}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="tmpl-classic">
      {sortedModules.map(
        (module) => module.visible && <div key={module.type}>{renderModule(module.type)}</div>
      )}
    </div>
  );
}

function ModernTemplate() {
  const { state } = useResume();
  const { data, modules } = state;
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  const renderModule = (moduleType: ModuleType) => {
    switch (moduleType) {
      case 'basicInfo':
        return (
          <div className="tmpl-basic-modern">
            <div className="tmpl-modern-header">
              <div className="tmpl-modern-avatar-wrap">
                {data.basicInfo.avatar ? (
                  <img src={data.basicInfo.avatar} alt="头像" className="tmpl-modern-avatar" />
                ) : (
                  <div className="tmpl-modern-avatar-placeholder">
                    {(data.basicInfo.name || 'N').charAt(0)}
                  </div>
                )}
              </div>
              <div className="tmpl-modern-info">
                <h1 className="tmpl-modern-name">{data.basicInfo.name || '您的姓名'}</h1>
                <p className="tmpl-modern-title">{data.basicInfo.position || '应聘岗位'}</p>
              </div>
            </div>
            <div className="tmpl-modern-contact">
              {data.basicInfo.phone && (
                <span className="tmpl-modern-contact-item">
                  <span className="tmpl-modern-icon">📱</span>
                  {data.basicInfo.phone}
                </span>
              )}
              {data.basicInfo.email && (
                <span className="tmpl-modern-contact-item">
                  <span className="tmpl-modern-icon">✉️</span>
                  {data.basicInfo.email}
                </span>
              )}
              {data.basicInfo.age && (
                <span className="tmpl-modern-contact-item">
                  <span className="tmpl-modern-icon">🎂</span>
                  {data.basicInfo.age}岁
                </span>
              )}
              {data.basicInfo.location && (
                <span className="tmpl-modern-contact-item">
                  <span className="tmpl-modern-icon">📍</span>
                  {data.basicInfo.location}
                </span>
              )}
            </div>
          </div>
        );

      case 'workExperience':
        if (data.workExperience.length === 0) return null;
        return (
          <div className="tmpl-section">
            <div className="tmpl-modern-section-head">
              <span className="tmpl-modern-icon-lg">💼</span>
              <h2 className="tmpl-modern-section-title">{MODULE_TITLES.workExperience}</h2>
            </div>
            <div className="tmpl-modern-timeline">
              {data.workExperience.map((item) => (
                <div key={item.id} className="tmpl-modern-timeline-item">
                  <div className="tmpl-modern-timeline-dot" />
                  <div className="tmpl-modern-timeline-content">
                    <div className="tmpl-modern-timeline-header">
                      <h3 className="tmpl-modern-company">{item.company}</h3>
                      <span className="tmpl-modern-timeline-date">
                        {item.startTime} — {item.endTime}
                      </span>
                    </div>
                    <div className="tmpl-modern-timeline-sub">{item.position}</div>
                    <div className="tmpl-modern-timeline-desc">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projectExperience':
        if (data.projectExperience.length === 0) return null;
        return (
          <div className="tmpl-section">
            <div className="tmpl-modern-section-head">
              <span className="tmpl-modern-icon-lg">🚀</span>
              <h2 className="tmpl-modern-section-title">{MODULE_TITLES.projectExperience}</h2>
            </div>
            <div className="tmpl-modern-timeline">
              {data.projectExperience.map((item) => (
                <div key={item.id} className="tmpl-modern-timeline-item">
                  <div className="tmpl-modern-timeline-dot" />
                  <div className="tmpl-modern-timeline-content">
                    <div className="tmpl-modern-timeline-header">
                      <h3 className="tmpl-modern-company">{item.projectName}</h3>
                      <span className="tmpl-modern-timeline-date">
                        {item.startTime} — {item.endTime}
                      </span>
                    </div>
                    <div className="tmpl-modern-timeline-sub">{item.position}</div>
                    <div className="tmpl-modern-timeline-desc">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (data.education.length === 0) return null;
        return (
          <div className="tmpl-section">
            <div className="tmpl-modern-section-head">
              <span className="tmpl-modern-icon-lg">🎓</span>
              <h2 className="tmpl-modern-section-title">{MODULE_TITLES.education}</h2>
            </div>
            <div className="tmpl-modern-timeline">
              {data.education.map((item) => (
                <div key={item.id} className="tmpl-modern-timeline-item">
                  <div className="tmpl-modern-timeline-dot" />
                  <div className="tmpl-modern-timeline-content">
                    <div className="tmpl-modern-timeline-header">
                      <h3 className="tmpl-modern-company">{item.school}</h3>
                      <span className="tmpl-modern-timeline-date">
                        {item.startTime} — {item.endTime}
                      </span>
                    </div>
                    <div className="tmpl-modern-timeline-sub">
                      {item.degree} {item.major && `· ${item.major}`}
                    </div>
                    {item.description && (
                      <div className="tmpl-modern-timeline-desc">{item.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (data.skills.length === 0) return null;
        return (
          <div className="tmpl-section">
            <div className="tmpl-modern-section-head">
              <span className="tmpl-modern-icon-lg">⚡</span>
              <h2 className="tmpl-modern-section-title">专业技能</h2>
            </div>
            <div className="tmpl-modern-skills">
              {data.skills.map((skill) => (
                <div key={skill.id} className="tmpl-modern-skill-tag">
                  <span className="tmpl-modern-skill-name">{skill.name}</span>
                  <span className="tmpl-modern-skill-stars">
                    {'★'.repeat(Math.ceil(skill.proficiency / 20))}
                    {'☆'.repeat(5 - Math.ceil(skill.proficiency / 20))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certificates':
        if (data.certificates.length === 0) return null;
        return (
          <div className="tmpl-section">
            <div className="tmpl-modern-section-head">
              <span className="tmpl-modern-icon-lg">🏆</span>
              <h2 className="tmpl-modern-section-title">证书信息</h2>
            </div>
            <div className="tmpl-modern-certs">
              {data.certificates.map((cert) => (
                <div key={cert.id} className="tmpl-modern-cert-card">
                  <div className="tmpl-modern-cert-name">{cert.name}</div>
                  {(cert.issuer || cert.date) && (
                    <div className="tmpl-modern-cert-meta">
                      {cert.issuer && <span>{cert.issuer}</span>}
                      {cert.date && <span>{cert.date}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="tmpl-modern">
      {sortedModules.map(
        (module) => module.visible && <div key={module.type}>{renderModule(module.type)}</div>
      )}
    </div>
  );
}

function MinimalTemplate() {
  const { state } = useResume();
  const { data, modules } = state;
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  const renderModule = (moduleType: ModuleType) => {
    switch (moduleType) {
      case 'basicInfo':
        return (
          <div className="tmpl-basic-minimal">
            <div className="tmpl-minimal-header">
              <h1 className="tmpl-minimal-name">{data.basicInfo.name || '您的姓名'}</h1>
              {data.basicInfo.avatar && (
                <img src={data.basicInfo.avatar} alt="头像" className="tmpl-minimal-avatar" />
              )}
            </div>
            <p className="tmpl-minimal-title">{data.basicInfo.position || '应聘岗位'}</p>
            <div className="tmpl-minimal-contact">
              {data.basicInfo.phone && <span>{data.basicInfo.phone}</span>}
              {data.basicInfo.email && <span>{data.basicInfo.email}</span>}
              {data.basicInfo.age && <span>{data.basicInfo.age}岁</span>}
              {data.basicInfo.location && <span>{data.basicInfo.location}</span>}
            </div>
          </div>
        );

      case 'workExperience':
        if (data.workExperience.length === 0) return null;
        return (
          <div className="tmpl-section">
            <h2 className="tmpl-minimal-section-title">{MODULE_TITLES.workExperience}</h2>
            {data.workExperience.map((item) => (
              <div key={item.id} className="tmpl-minimal-item">
                <div className="tmpl-minimal-item-head">
                  <h3 className="tmpl-minimal-company">{item.company}</h3>
                  <span className="tmpl-minimal-date">{item.startTime} — {item.endTime}</span>
                </div>
                <div className="tmpl-minimal-position">{item.position}</div>
                <div className="tmpl-minimal-desc">{item.description}</div>
              </div>
            ))}
          </div>
        );

      case 'projectExperience':
        if (data.projectExperience.length === 0) return null;
        return (
          <div className="tmpl-section">
            <h2 className="tmpl-minimal-section-title">{MODULE_TITLES.projectExperience}</h2>
            {data.projectExperience.map((item) => (
              <div key={item.id} className="tmpl-minimal-item">
                <div className="tmpl-minimal-item-head">
                  <h3 className="tmpl-minimal-company">{item.projectName}</h3>
                  <span className="tmpl-minimal-date">{item.startTime} — {item.endTime}</span>
                </div>
                <div className="tmpl-minimal-position">{item.position}</div>
                <div className="tmpl-minimal-desc">{item.description}</div>
              </div>
            ))}
          </div>
        );

      case 'education':
        if (data.education.length === 0) return null;
        return (
          <div className="tmpl-section">
            <h2 className="tmpl-minimal-section-title">{MODULE_TITLES.education}</h2>
            {data.education.map((item) => (
              <div key={item.id} className="tmpl-minimal-item">
                <div className="tmpl-minimal-item-head">
                  <h3 className="tmpl-minimal-company">{item.school}</h3>
                  <span className="tmpl-minimal-date">{item.startTime} — {item.endTime}</span>
                </div>
                <div className="tmpl-minimal-position">
                  {item.degree} {item.major && `· ${item.major}`}
                </div>
                {item.description && <div className="tmpl-minimal-desc">{item.description}</div>}
              </div>
            ))}
          </div>
        );

      case 'skills':
        if (data.skills.length === 0) return null;
        return (
          <div className="tmpl-section">
            <h2 className="tmpl-minimal-section-title">专业技能</h2>
            <div className="tmpl-minimal-skills">
              {data.skills.map((skill) => (
                <span key={skill.id} className="tmpl-minimal-skill">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        );

      case 'certificates':
        if (data.certificates.length === 0) return null;
        return (
          <div className="tmpl-section">
            <h2 className="tmpl-minimal-section-title">证书信息</h2>
            <div className="tmpl-minimal-certs">
              {data.certificates.map((cert) => (
                <span key={cert.id} className="tmpl-minimal-cert">
                  {cert.name}
                  {cert.date && ` · ${cert.date}`}
                </span>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="tmpl-minimal">
      {sortedModules.map(
        (module) => module.visible && <div key={module.type}>{renderModule(module.type)}</div>
      )}
    </div>
  );
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>((_props, ref) => {
  const { state } = useResume();
  const { template } = state;

  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate />;
      case 'minimal':
        return <MinimalTemplate />;
      case 'classic':
      default:
        return <ClassicTemplate />;
    }
  };

  return (
    <div className="resume-preview-container">
      <div ref={ref} className="resume-paper">
        {renderTemplate()}
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export { ResumePreview };
