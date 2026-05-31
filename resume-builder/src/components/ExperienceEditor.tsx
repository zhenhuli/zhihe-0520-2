import { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import type { ExperienceItem } from '../types';

type ExperienceType = 'workExperience' | 'projectExperience' | 'education';

interface ExperienceConfig {
  title: string;
  addText: string;
  fields: {
    key: keyof ExperienceItem;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
  }[];
}

const experienceConfigs: Record<ExperienceType, ExperienceConfig> = {
  workExperience: {
    title: '工作经历',
    addText: '+ 添加工作经历',
    fields: [
      { key: 'company', label: '公司名称', type: 'text', required: true, placeholder: '请输入公司名称' },
      { key: 'position', label: '职位', type: 'text', required: true, placeholder: '请输入职位' },
      { key: 'startTime', label: '开始时间', type: 'month', required: true },
      { key: 'endTime', label: '结束时间', type: 'month', required: true },
      { key: 'description', label: '岗位职责', type: 'textarea', required: true, placeholder: '请描述您的工作职责和成就' },
    ],
  },
  projectExperience: {
    title: '项目经历',
    addText: '+ 添加项目经历',
    fields: [
      { key: 'projectName', label: '项目名称', type: 'text', required: true, placeholder: '请输入项目名称' },
      { key: 'position', label: '担任角色', type: 'text', required: true, placeholder: '请输入您在项目中的角色' },
      { key: 'startTime', label: '开始时间', type: 'month', required: true },
      { key: 'endTime', label: '结束时间', type: 'month', required: true },
      { key: 'description', label: '项目描述', type: 'textarea', required: true, placeholder: '请描述项目内容和您的贡献' },
    ],
  },
  education: {
    title: '教育经历',
    addText: '+ 添加教育经历',
    fields: [
      { key: 'school', label: '学校名称', type: 'text', required: true, placeholder: '请输入学校名称' },
      { key: 'major', label: '专业', type: 'text', required: true, placeholder: '请输入专业' },
      { key: 'degree', label: '学历', type: 'select', required: true, placeholder: '请选择学历' },
      { key: 'startTime', label: '开始时间', type: 'month', required: true },
      { key: 'endTime', label: '结束时间', type: 'month', required: true },
      { key: 'description', label: '描述', type: 'textarea', placeholder: '可选：补充说明在校经历等' },
    ],
  },
};

const degreeOptions = ['', '大专', '本科', '硕士', '博士', '其他'];

interface ExperienceItemEditorProps {
  type: ExperienceType;
  item: ExperienceItem;
  onUpdate: (id: string, data: Partial<ExperienceItem>) => void;
  onDelete: (id: string) => void;
}

function ExperienceItemEditor({ type, item, onUpdate, onDelete }: ExperienceItemEditorProps) {
  const [expanded, setExpanded] = useState(true);
  const config = experienceConfigs[type];

  const getTitle = () => {
    switch (type) {
      case 'workExperience':
        return item.company || item.position || '新工作经历';
      case 'projectExperience':
        return item.projectName || item.position || '新项目经历';
      case 'education':
        return item.school || item.major || '新教育经历';
      default:
        return '新经历';
    }
  };

  const getSubtitle = () => {
    const start = item.startTime || '至今';
    const end = item.endTime || '至今';
    const time = `${start} - ${end}`;
    switch (type) {
      case 'workExperience':
        return `${time} | ${item.position || ''}`;
      case 'projectExperience':
        return `${time} | ${item.position || ''}`;
      case 'education':
        return `${time} | ${item.degree || ''}`;
      default:
        return time;
    }
  };

  return (
    <div className="experience-item">
      <div
        className="experience-item-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="experience-item-title">
          <span className="drag-handle">⋮⋮</span>
          <div>
            <h4>{getTitle()}</h4>
            <p className="experience-item-subtitle">{getSubtitle()}</p>
          </div>
        </div>
        <div className="experience-item-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            title="删除"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▼</span>
        </div>
      </div>

      {expanded && (
        <div className="experience-item-body">
          {config.fields.map((field) => (
            <div key={field.key as string} className="form-group">
              <label>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={(item[field.key] as string) || ''}
                  onChange={(e) => onUpdate(item.id, { [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  rows={4}
                />
              ) : field.type === 'select' ? (
                <select
                  value={(item[field.key] as string) || ''}
                  onChange={(e) => onUpdate(item.id, { [field.key]: e.target.value })}
                >
                  {degreeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt || '请选择学历'}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={(item[field.key] as string) || ''}
                  onChange={(e) => onUpdate(item.id, { [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ExperienceEditorProps {
  type: ExperienceType;
}

export function ExperienceEditor({ type }: ExperienceEditorProps) {
  const { state, dispatch } = useResume();
  const config = experienceConfigs[type];
  const items = state.data[type];

  const handleAdd = () => {
    const emptyItem: Omit<ExperienceItem, 'id'> = {
      startTime: '',
      endTime: '',
      description: '',
    };
    dispatch({ type: 'ADD_EXPERIENCE', moduleType: type, payload: emptyItem });
  };

  const handleUpdate = (id: string, data: Partial<ExperienceItem>) => {
    dispatch({ type: 'UPDATE_EXPERIENCE', moduleType: type, id, payload: data });
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条经历吗？')) {
      dispatch({ type: 'DELETE_EXPERIENCE', moduleType: type, id });
    }
  };

  return (
    <div className="experience-editor">
      <div className="editor-header">
        <h3 className="editor-title">{config.title}</h3>
        <button type="button" className="add-btn" onClick={handleAdd}>
          {config.addText}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>暂无{config.title}，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="experience-list">
          {items.map((item) => (
            <ExperienceItemEditor
              key={item.id}
              type={type}
              item={item}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
