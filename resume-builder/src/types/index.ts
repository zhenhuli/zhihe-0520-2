export interface BasicInfo {
  avatar: string;
  name: string;
  position: string;
  age: string;
  phone: string;
  email: string;
  location: string;
}

export interface ExperienceItem {
  id: string;
  company?: string;
  projectName?: string;
  school?: string;
  major?: string;
  degree?: string;
  position?: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  proficiency: number;
}

export interface CertificateItem {
  id: string;
  name: string;
  date: string;
  issuer: string;
}

export interface ResumeData {
  basicInfo: BasicInfo;
  workExperience: ExperienceItem[];
  projectExperience: ExperienceItem[];
  education: ExperienceItem[];
  skills: SkillItem[];
  certificates: CertificateItem[];
}

export type ModuleType = 'basicInfo' | 'workExperience' | 'projectExperience' | 'education' | 'skills' | 'certificates';

export interface ModuleConfig {
  type: ModuleType;
  title: string;
  visible: boolean;
  order: number;
}

export type TemplateType = 'classic' | 'modern' | 'minimal';

export const MODULE_TITLES: Record<ModuleType, string> = {
  basicInfo: '基础信息',
  workExperience: '工作经历',
  projectExperience: '项目经历',
  education: '教育经历',
  skills: '技能证书',
  certificates: '证书信息',
};
