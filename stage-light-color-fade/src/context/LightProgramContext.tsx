import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { LightProgram, TimelineStep, LightGroup, generateId, interpolateColor, ActiveStepState } from '@/types';

interface LightProgramContextType {
  program: LightProgram;
  activeState: ActiveStepState;
  setProgramName: (name: string) => void;
  addStep: () => void;
  updateStep: (stepId: string, updates: Partial<TimelineStep>) => void;
  deleteStep: (stepId: string) => void;
  addLightGroup: (stepId: string) => void;
  updateLightGroup: (stepId: string, groupId: string, updates: Partial<LightGroup>) => void;
  deleteLightGroup: (stepId: string, groupId: string) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  saveProgram: () => void;
  loadProgram: (program: LightProgram) => void;
  exportProgram: () => string;
  importProgram: (jsonString: string) => void;
}

const LightProgramContext = createContext<LightProgramContextType | undefined>(undefined);

const createDefaultLightGroup = (): LightGroup => ({
  id: generateId(),
  name: `灯光组`,
  startColor: '#ff0000',
  endColor: '#0000ff',
  duration: 3000,
  easing: 'ease-in-out',
  delay: 0,
});

const createDefaultStep = (index: number): TimelineStep => ({
  id: generateId(),
  name: `场景 ${index + 1}`,
  lightGroups: [createDefaultLightGroup()],
  stepDuration: 5000,
});

const createDefaultProgram = (): LightProgram => ({
  id: generateId(),
  name: '未命名灯光方案',
  createdAt: Date.now(),
  timeline: [createDefaultStep(0)],
});

export const LightProgramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [program, setProgram] = useState<LightProgram>(createDefaultProgram);
  const [activeState, setActiveState] = useState<ActiveStepState>({
    stepIndex: 0,
    progress: 0,
    isPlaying: false,
    currentColors: {},
  });
  
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentStepIndexRef = useRef<number>(0);

  const setProgramName = useCallback((name: string) => {
    setProgram((prev) => ({ ...prev, name }));
  }, []);

  const addStep = useCallback(() => {
    setProgram((prev) => ({
      ...prev,
      timeline: [...prev.timeline, createDefaultStep(prev.timeline.length)],
    }));
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<TimelineStep>) => {
    setProgram((prev) => ({
      ...prev,
      timeline: prev.timeline.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    }));
  }, []);

  const deleteStep = useCallback((stepId: string) => {
    setProgram((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((step) => step.id !== stepId),
    }));
  }, []);

  const addLightGroup = useCallback((stepId: string) => {
    setProgram((prev) => ({
      ...prev,
      timeline: prev.timeline.map((step) =>
        step.id === stepId
          ? { ...step, lightGroups: [...step.lightGroups, createDefaultLightGroup()] }
          : step
      ),
    }));
  }, []);

  const updateLightGroup = useCallback(
    (stepId: string, groupId: string, updates: Partial<LightGroup>) => {
      setProgram((prev) => ({
        ...prev,
        timeline: prev.timeline.map((step) =>
          step.id === stepId
            ? {
                ...step,
                lightGroups: step.lightGroups.map((group) =>
                  group.id === groupId ? { ...group, ...updates } : group
                ),
              }
            : step
        ),
      }));
    },
    []
  );

  const deleteLightGroup = useCallback((stepId: string, groupId: string) => {
    setProgram((prev) => ({
      ...prev,
      timeline: prev.timeline.map((step) =>
        step.id === stepId
          ? { ...step, lightGroups: step.lightGroups.filter((group) => group.id !== groupId) }
          : step
      ),
    }));
  }, []);

  const calculateColors = useCallback(
    (stepIndex: number, progress: number): Record<string, string> => {
      const step = program.timeline[stepIndex];
      if (!step) return {};

      const colors: Record<string, string> = {};
      step.lightGroups.forEach((group) => {
        const groupProgress = Math.max(
          0,
          Math.min(1, (progress * step.stepDuration - group.delay) / group.duration)
        );
        colors[group.id] = interpolateColor(
          group.startColor,
          group.endColor,
          groupProgress,
          group.easing
        );
      });
      return colors;
    },
    [program.timeline]
  );

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const currentStep = program.timeline[currentStepIndexRef.current];

      if (!currentStep) {
        setActiveState((prev) => ({ ...prev, isPlaying: false }));
        return;
      }

      const progress = elapsed / currentStep.stepDuration;

      if (progress >= 1) {
        const nextStepIndex = currentStepIndexRef.current + 1;
        if (nextStepIndex < program.timeline.length) {
          currentStepIndexRef.current = nextStepIndex;
          startTimeRef.current = timestamp;
          setActiveState({
            stepIndex: nextStepIndex,
            progress: 0,
            isPlaying: true,
            currentColors: calculateColors(nextStepIndex, 0),
          });
        } else {
          setActiveState((prev) => ({
            ...prev,
            progress: 1,
            isPlaying: false,
            currentColors: calculateColors(currentStepIndexRef.current, 1),
          }));
          return;
        }
      } else {
        setActiveState({
          stepIndex: currentStepIndexRef.current,
          progress,
          isPlaying: true,
          currentColors: calculateColors(currentStepIndexRef.current, progress),
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [program.timeline, calculateColors]
  );

  const play = useCallback(() => {
    if (program.timeline.length === 0) return;
    
    setActiveState((prev) => ({ ...prev, isPlaying: true }));
    startTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
  }, [program.timeline.length, animate]);

  const pause = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setActiveState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    currentStepIndexRef.current = 0;
    startTimeRef.current = 0;
    setActiveState({
      stepIndex: 0,
      progress: 0,
      isPlaying: false,
      currentColors: {},
    });
  }, []);

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    currentStepIndexRef.current = 0;
    startTimeRef.current = 0;
    setActiveState({
      stepIndex: 0,
      progress: 0,
      isPlaying: false,
      currentColors: {},
    });
  }, []);

  const saveProgram = useCallback(() => {
    const savedPrograms = JSON.parse(localStorage.getItem('lightPrograms') || '[]');
    const existingIndex = savedPrograms.findIndex((p: LightProgram) => p.id === program.id);
    
    if (existingIndex >= 0) {
      savedPrograms[existingIndex] = program;
    } else {
      savedPrograms.push(program);
    }
    
    localStorage.setItem('lightPrograms', JSON.stringify(savedPrograms));
    alert('方案已保存！');
  }, [program]);

  const loadProgram = useCallback((loadedProgram: LightProgram) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    currentStepIndexRef.current = 0;
    setProgram(loadedProgram);
    setActiveState({
      stepIndex: 0,
      progress: 0,
      isPlaying: false,
      currentColors: {},
    });
  }, []);

  const exportProgram = useCallback(() => {
    return JSON.stringify(program, null, 2);
  }, [program]);

  const importProgram = useCallback((jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString) as LightProgram;
      if (imported.timeline && Array.isArray(imported.timeline)) {
        loadProgram(imported);
        alert('方案导入成功！');
      } else {
        alert('无效的方案文件');
      }
    } catch (e) {
      alert('导入失败，请检查文件格式');
    }
  }, [loadProgram]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <LightProgramContext.Provider
      value={{
        program,
        activeState,
        setProgramName,
        addStep,
        updateStep,
        deleteStep,
        addLightGroup,
        updateLightGroup,
        deleteLightGroup,
        play,
        pause,
        stop,
        reset,
        saveProgram,
        loadProgram,
        exportProgram,
        importProgram,
      }}
    >
      {children}
    </LightProgramContext.Provider>
  );
};

export const useLightProgram = () => {
  const context = useContext(LightProgramContext);
  if (!context) {
    throw new Error('useLightProgram must be used within a LightProgramProvider');
  }
  return context;
};
