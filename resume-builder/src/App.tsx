import { useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ResumeProvider, useResume } from './context/ResumeContext';
import { ModuleList } from './components/ModuleList';
import { BasicInfoEditor } from './components/BasicInfoEditor';
import { ExperienceEditor } from './components/ExperienceEditor';
import { SkillsEditor } from './components/SkillsEditor';
import { ResumePreview } from './components/ResumePreview';
import { TemplateExport } from './components/TemplateExport';
import { IndustryTemplates } from './components/IndustryTemplates';
import './App.css';

function EditorContent() {
  const { state } = useResume();
  const { activeModule } = state;
  const resumeRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<'editor' | 'template'>('editor');

  const renderEditor = () => {
    switch (activeModule) {
      case 'basicInfo':
        return <BasicInfoEditor />;
      case 'workExperience':
        return <ExperienceEditor type="workExperience" />;
      case 'projectExperience':
        return <ExperienceEditor type="projectExperience" />;
      case 'education':
        return <ExperienceEditor type="education" />;
      case 'skills':
      case 'certificates':
        return <SkillsEditor />;
      default:
        return <BasicInfoEditor />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            简历制作工具
          </h1>
        </div>
        <div className="header-nav">
          <button
            type="button"
            className={`nav-btn ${currentPage === 'editor' ? 'active' : ''}`}
            onClick={() => setCurrentPage('editor')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            编辑简历
          </button>
          <button
            type="button"
            className={`nav-btn ${currentPage === 'template' ? 'active' : ''}`}
            onClick={() => setCurrentPage('template')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            模板与导出
          </button>
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'editor' ? (
          <div className="editor-layout">
            <aside className="sidebar-left">
              <ModuleList />
              <IndustryTemplates />
            </aside>
            <section className="editor-panel">
              <div className="editor-content">{renderEditor()}</div>
            </section>
            <aside className="sidebar-right">
              <div className="preview-wrapper">
                <h3 className="preview-title">实时预览</h3>
                <ResumePreview ref={resumeRef} />
              </div>
            </aside>
          </div>
        ) : (
          <div className="template-layout">
            <div className="template-panel">
              <TemplateExport resumeRef={resumeRef} />
            </div>
            <aside className="sidebar-right">
              <div className="preview-wrapper">
                <h3 className="preview-title">实时预览</h3>
                <ResumePreview ref={resumeRef} />
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ResumeProvider>
        <EditorContent />
      </ResumeProvider>
    </DndProvider>
  );
}

export default App;
