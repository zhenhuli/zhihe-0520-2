import { useState, useRef } from 'react';
import { useResume } from '../context/ResumeContext';
import type { BasicInfo } from '../types';

interface FieldError {
  [key: string]: string;
}

const requiredFields: (keyof BasicInfo)[] = ['name', 'position', 'phone', 'email'];

const fieldLabels: Record<keyof BasicInfo, string> = {
  avatar: '头像',
  name: '姓名',
  position: '应聘岗位',
  age: '年龄',
  phone: '电话',
  email: '邮箱',
  location: '居住地',
};

export function BasicInfoEditor() {
  const { state, dispatch } = useResume();
  const { basicInfo } = state.data;
  const [errors, setErrors] = useState<FieldError>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateField = (field: keyof BasicInfo, value: string) => {
    if (requiredFields.includes(field) && !value.trim()) {
      return `${fieldLabels[field]}不能为空`;
    }
    if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return '请输入有效的邮箱地址';
    }
    if (field === 'phone' && value && !/^1[3-9]\d{9}$/.test(value)) {
      return '请输入有效的手机号码';
    }
    return '';
  };

  const handleChange = (field: keyof BasicInfo, value: string) => {
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
    dispatch({ type: 'UPDATE_BASIC_INFO', payload: { [field]: value } });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch({
          type: 'UPDATE_BASIC_INFO',
          payload: { avatar: reader.result as string },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAvatar = () => {
    dispatch({ type: 'UPDATE_BASIC_INFO', payload: { avatar: '' } });
  };

  return (
    <div className="basic-info-editor">
      <h3 className="editor-title">基础信息</h3>
      
      <div className="avatar-section">
        <div className="avatar-preview" onClick={handleAvatarClick}>
          {basicInfo.avatar ? (
            <img src={basicInfo.avatar} alt="头像" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>点击上传头像</span>
            </div>
          )}
        </div>
        {basicInfo.avatar && (
          <button type="button" className="remove-avatar-btn" onClick={handleRemoveAvatar}>
            移除头像
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>
            {fieldLabels.name} <span className="required">*</span>
          </label>
          <input
            type="text"
            value={basicInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="请输入姓名"
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>
            {fieldLabels.position} <span className="required">*</span>
          </label>
          <input
            type="text"
            value={basicInfo.position}
            onChange={(e) => handleChange('position', e.target.value)}
            placeholder="请输入应聘岗位"
            className={errors.position ? 'input-error' : ''}
          />
          {errors.position && <span className="error-text">{errors.position}</span>}
        </div>

        <div className="form-group">
          <label>{fieldLabels.age}</label>
          <input
            type="number"
            value={basicInfo.age}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder="请输入年龄"
          />
        </div>

        <div className="form-group">
          <label>
            {fieldLabels.phone} <span className="required">*</span>
          </label>
          <input
            type="tel"
            value={basicInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="请输入电话号码"
            className={errors.phone ? 'input-error' : ''}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>
            {fieldLabels.email} <span className="required">*</span>
          </label>
          <input
            type="email"
            value={basicInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="请输入邮箱地址"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>{fieldLabels.location}</label>
          <input
            type="text"
            value={basicInfo.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="请输入居住地"
          />
        </div>
      </div>
    </div>
  );
}
