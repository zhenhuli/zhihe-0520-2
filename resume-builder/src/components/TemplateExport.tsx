import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useResume } from '../context/ResumeContext';
import type { TemplateType } from '../types';

interface TemplateExportProps {
  resumeRef: React.RefObject<HTMLDivElement | null>;
}

const templates: { type: TemplateType; name: string; description: string }[] = [
  { type: 'classic', name: '经典模板', description: '传统专业风格，适合正式场合' },
  { type: 'modern', name: '现代模板', description: '清新活泼，富有设计感' },
  { type: 'minimal', name: '简约模板', description: '简洁大方，突出内容' },
];

export function TemplateExport({ resumeRef }: TemplateExportProps) {
  const { state, dispatch } = useResume();
  const { template } = state;
  const [exporting, setExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'template' | 'export'>('template');

  const handleTemplateChange = (newTemplate: TemplateType) => {
    dispatch({ type: 'SET_TEMPLATE', template: newTemplate });
  };

  const handleExportPDF = async () => {
    if (!resumeRef.current || exporting) return;

    try {
      setExporting(true);

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${state.data.basicInfo.name || '简历'}.pdf`);
    } catch (error) {
      console.error('导出PDF失败:', error);
      alert('导出PDF失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handlePreviewImage = async () => {
    if (!resumeRef.current || exporting) return;

    try {
      setExporting(true);

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      setPreviewImage(imgData);
    } catch (error) {
      console.error('生成预览图失败:', error);
      alert('生成预览图失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadImage = () => {
    if (!previewImage) return;
    const link = document.createElement('a');
    link.download = `${state.data.basicInfo.name || '简历'}.png`;
    link.href = previewImage;
    link.click();
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleReset = () => {
    if (confirm('确定要重置所有简历内容吗？此操作不可恢复。')) {
      dispatch({ type: 'RESET_RESUME' });
    }
  };

  return (
    <div className="template-export-panel">
      <div className="panel-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'template' ? 'active' : ''}`}
          onClick={() => setActiveTab('template')}
        >
          模板选择
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          导出设置
        </button>
      </div>

      {activeTab === 'template' && (
        <div className="template-options">
          <h3 className="panel-title">选择简历模板</h3>
          <div className="template-grid">
            {templates.map((t) => (
              <div
                key={t.type}
                className={`template-card ${template === t.type ? 'selected' : ''}`}
                onClick={() => handleTemplateChange(t.type)}
              >
                <div className={`template-preview template-${t.type}`}>
                  <div className="preview-mock">
                    <div className="mock-header" />
                    <div className="mock-line short" />
                    <div className="mock-line long" />
                    <div className="mock-line long" />
                    <div className="mock-line short" />
                    <div className="mock-line long" />
                  </div>
                </div>
                <div className="template-info">
                  <h4>{t.name}</h4>
                  <p>{t.description}</p>
                </div>
                {template === t.type && <span className="checkmark">✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="export-options">
          <h3 className="panel-title">导出简历</h3>
          
          <div className="export-actions">
            <button
              type="button"
              className="export-btn primary"
              onClick={handleExportPDF}
              disabled={exporting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {exporting ? '导出中...' : '导出 PDF'}
            </button>

            <button
              type="button"
              className="export-btn secondary"
              onClick={handlePreviewImage}
              disabled={exporting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              图片预览
            </button>

            <button type="button" className="export-btn danger" onClick={handleReset}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              重置简历
            </button>
          </div>

          <div className="export-tips">
            <h4>导出提示</h4>
            <ul>
              <li>PDF 导出为 A4 尺寸，可直接打印</li>
              <li>图片预览可查看导出效果，支持保存为 PNG</li>
              <li>重置将清空所有内容，操作前请确认</li>
            </ul>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="image-preview-modal" onClick={handleClosePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>图片预览</h3>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleDownloadImage}>
                  下载图片
                </button>
                <button type="button" className="btn-close" onClick={handleClosePreview}>
                  ✕
                </button>
              </div>
            </div>
            <div className="modal-body">
              <img src={previewImage} alt="简历预览" className="preview-image" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
