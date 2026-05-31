import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  ResumeData,
  BasicInfo,
  ExperienceItem,
  SkillItem,
  CertificateItem,
  ModuleConfig,
  ModuleType,
  TemplateType,
} from '../types';
import { MODULE_TITLES } from '../types';
import type { IndustryTemplate } from '../data/industryTemplates';

const initialBasicInfo: BasicInfo = {
  avatar: '',
  name: '',
  position: '',
  age: '',
  phone: '',
  email: '',
  location: '',
};

const initialData: ResumeData = {
  basicInfo: initialBasicInfo,
  workExperience: [],
  projectExperience: [],
  education: [],
  skills: [],
  certificates: [],
};

const initialModules: ModuleConfig[] = [
  { type: 'basicInfo', title: MODULE_TITLES.basicInfo, visible: true, order: 0 },
  { type: 'workExperience', title: MODULE_TITLES.workExperience, visible: true, order: 1 },
  { type: 'projectExperience', title: MODULE_TITLES.projectExperience, visible: true, order: 2 },
  { type: 'education', title: MODULE_TITLES.education, visible: true, order: 3 },
  { type: 'skills', title: MODULE_TITLES.skills, visible: true, order: 4 },
  { type: 'certificates', title: MODULE_TITLES.certificates, visible: true, order: 5 },
];

interface ResumeState {
  data: ResumeData;
  modules: ModuleConfig[];
  template: TemplateType;
  activeModule: ModuleType | null;
}

type Action =
  | { type: 'UPDATE_BASIC_INFO'; payload: Partial<BasicInfo> }
  | { type: 'ADD_EXPERIENCE'; moduleType: 'workExperience' | 'projectExperience' | 'education'; payload: Omit<ExperienceItem, 'id'> }
  | { type: 'UPDATE_EXPERIENCE'; moduleType: 'workExperience' | 'projectExperience' | 'education'; id: string; payload: Partial<ExperienceItem> }
  | { type: 'DELETE_EXPERIENCE'; moduleType: 'workExperience' | 'projectExperience' | 'education'; id: string }
  | { type: 'ADD_SKILL'; payload: Omit<SkillItem, 'id'> }
  | { type: 'UPDATE_SKILL'; id: string; payload: Partial<SkillItem> }
  | { type: 'DELETE_SKILL'; id: string }
  | { type: 'ADD_CERTIFICATE'; payload: Omit<CertificateItem, 'id'> }
  | { type: 'UPDATE_CERTIFICATE'; id: string; payload: Partial<CertificateItem> }
  | { type: 'DELETE_CERTIFICATE'; id: string }
  | { type: 'TOGGLE_MODULE_VISIBILITY'; moduleType: ModuleType }
  | { type: 'REORDER_MODULES'; payload: ModuleConfig[] }
  | { type: 'SET_TEMPLATE'; template: TemplateType }
  | { type: 'SET_ACTIVE_MODULE'; moduleType: ModuleType | null }
  | { type: 'RESET_RESUME' }
  | { type: 'LOAD_TEMPLATE'; payload: IndustryTemplate };

function resumeReducer(state: ResumeState, action: Action): ResumeState {
  switch (action.type) {
    case 'UPDATE_BASIC_INFO':
      return {
        ...state,
        data: {
          ...state.data,
          basicInfo: { ...state.data.basicInfo, ...action.payload },
        },
      };

    case 'ADD_EXPERIENCE':
      return {
        ...state,
        data: {
          ...state.data,
          [action.moduleType]: [
            ...state.data[action.moduleType],
            { ...action.payload, id: uuidv4() },
          ],
        },
      };

    case 'UPDATE_EXPERIENCE':
      return {
        ...state,
        data: {
          ...state.data,
          [action.moduleType]: state.data[action.moduleType].map((item) =>
            item.id === action.id ? { ...item, ...action.payload } : item
          ),
        },
      };

    case 'DELETE_EXPERIENCE':
      return {
        ...state,
        data: {
          ...state.data,
          [action.moduleType]: state.data[action.moduleType].filter(
            (item) => item.id !== action.id
          ),
        },
      };

    case 'ADD_SKILL':
      return {
        ...state,
        data: {
          ...state.data,
          skills: [...state.data.skills, { ...action.payload, id: uuidv4() }],
        },
      };

    case 'UPDATE_SKILL':
      return {
        ...state,
        data: {
          ...state.data,
          skills: state.data.skills.map((skill) =>
            skill.id === action.id ? { ...skill, ...action.payload } : skill
          ),
        },
      };

    case 'DELETE_SKILL':
      return {
        ...state,
        data: {
          ...state.data,
          skills: state.data.skills.filter((skill) => skill.id !== action.id),
        },
      };

    case 'ADD_CERTIFICATE':
      return {
        ...state,
        data: {
          ...state.data,
          certificates: [...state.data.certificates, { ...action.payload, id: uuidv4() }],
        },
      };

    case 'UPDATE_CERTIFICATE':
      return {
        ...state,
        data: {
          ...state.data,
          certificates: state.data.certificates.map((cert) =>
            cert.id === action.id ? { ...cert, ...action.payload } : cert
          ),
        },
      };

    case 'DELETE_CERTIFICATE':
      return {
        ...state,
        data: {
          ...state.data,
          certificates: state.data.certificates.filter((cert) => cert.id !== action.id),
        },
      };

    case 'TOGGLE_MODULE_VISIBILITY':
      return {
        ...state,
        modules: state.modules.map((module) =>
          module.type === action.moduleType
            ? { ...module, visible: !module.visible }
            : module
        ),
      };

    case 'REORDER_MODULES':
      return {
        ...state,
        modules: action.payload,
      };

    case 'SET_TEMPLATE':
      return {
        ...state,
        template: action.template,
      };

    case 'SET_ACTIVE_MODULE':
      return {
        ...state,
        activeModule: action.moduleType,
      };

    case 'RESET_RESUME':
      return {
        data: initialData,
        modules: initialModules,
        template: 'classic',
        activeModule: null,
      };

    case 'LOAD_TEMPLATE':
      return {
        data: {
          basicInfo: { ...action.payload.data.basicInfo, avatar: '' },
          workExperience: action.payload.data.workExperience.map((item) => ({
            ...item,
            id: uuidv4(),
          })),
          projectExperience: action.payload.data.projectExperience.map((item) => ({
            ...item,
            id: uuidv4(),
          })),
          education: action.payload.data.education.map((item) => ({
            ...item,
            id: uuidv4(),
          })),
          skills: action.payload.data.skills.map((item) => ({
            ...item,
            id: uuidv4(),
          })),
          certificates: action.payload.data.certificates.map((item) => ({
            ...item,
            id: uuidv4(),
          })),
        },
        modules: initialModules,
        template: 'classic',
        activeModule: 'basicInfo',
      };

    default:
      return state;
  }
}

interface ResumeContextType {
  state: ResumeState;
  dispatch: React.Dispatch<Action>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(resumeReducer, {
    data: initialData,
    modules: initialModules,
    template: 'classic',
    activeModule: 'basicInfo',
  });

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
