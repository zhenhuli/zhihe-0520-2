import {
  fabricCareRules,
  colorCareRules,
  decorationCareRules,
  washMethods,
} from '../data/careKnowledge';

const washPriority = {
  dry: 4,
  hand: 3,
  machine: 2,
  noWash: 1,
};

export function determineCareMethod(fabricId, colorId, decorationIds) {
  const fabricRule = fabricCareRules[fabricId];
  const colorRule = colorCareRules[colorId];

  if (!fabricRule) {
    return null;
  }

  const decorationRules = decorationIds
    .map((id) => decorationCareRules[id])
    .filter(Boolean);

  let finalWashMethod = fabricRule.washMethod;

  decorationRules.forEach((decorationRule) => {
    if (decorationRule.washMethod) {
      const currentPriority = washPriority[finalWashMethod] || 0;
      const decorPriority = washPriority[decorationRule.washMethod] || 0;
      if (decorPriority > currentPriority) {
        finalWashMethod = decorationRule.washMethod;
      }
    }
  });

  const forbiddenDetergents = new Set();

  fabricRule.forbiddenDetergent.forEach((d) => forbiddenDetergents.add(d));

  if (colorId === 'bright' || colorId === 'dark') {
    forbiddenDetergents.add('漂白剂');
    forbiddenDetergents.add('碱性洗涤剂');
  }

  if (decorationIds.includes('sequins') || decorationIds.includes('beads')) {
    forbiddenDetergents.add('强力洗衣粉');
  }

  if (decorationIds.includes('rhinestone')) {
    forbiddenDetergents.add('水');
  }

  let maxTemp = fabricRule.maxTemp;

  if (colorId === 'bright' || colorId === 'dark') {
    maxTemp = Math.min(maxTemp, 30);
  }

  const hasSpecialCareDecor = decorationRules.some((r) => r.specialCare);
  if (hasSpecialCareDecor) {
    maxTemp = Math.min(maxTemp, 30);
  }

  const allTips = [];

  allTips.push(...fabricRule.tips);

  if (colorRule && colorRule.tips) {
    allTips.push(...colorRule.tips);
  }

  decorationRules.forEach((decorationRule) => {
    if (decorationRule.tips) {
      allTips.push(...decorationRule.tips);
    }
  });

  const uniqueTips = [...new Set(allTips)];

  let finalDryingMethod = fabricRule.dryingMethod;

  if (colorId === 'dark' || colorId === 'bright') {
    finalDryingMethod = '阴干，避免阳光直射';
  }

  if (fabricId === 'wool' || fabricId === 'cashmere' || fabricId === 'down') {
    finalDryingMethod = '平铺阴干，不可悬挂';
  }

  return {
    washMethod: washMethods[finalWashMethod] || washMethods.machine,
    maxTemp: maxTemp,
    canBleach: fabricRule.canBleach && colorId !== 'dark' && colorId !== 'bright',
    detergent: fabricRule.detergent,
    forbiddenDetergent: Array.from(forbiddenDetergents),
    dryingMethod: finalDryingMethod,
    tips: uniqueTips,
    fabricRule,
    colorRule,
    decorationRules,
  };
}

export function generateChecklist(careResult) {
  const checklist = [];

  if (careResult.washMethod.id === 'machine') {
    checklist.push({
      text: '选择洗衣机轻柔模式',
      checked: false,
      category: '洗涤准备',
    });
  }

  if (careResult.washMethod.id === 'hand') {
    checklist.push({
      text: '准备温水，控制水温在适宜范围',
      checked: false,
      category: '洗涤准备',
    });
    checklist.push({
      text: '使用适量洗涤剂，充分溶解',
      checked: false,
      category: '洗涤准备',
    });
  }

  if (careResult.washMethod.id === 'dry') {
    checklist.push({
      text: '选择正规专业干洗店',
      checked: false,
      category: '洗涤准备',
    });
    checklist.push({
      text: '告知店员衣物材质和特殊装饰',
      checked: false,
      category: '洗涤准备',
    });
  }

  checklist.push({
    text: '检查衣物口袋，取出所有物品',
    checked: false,
    category: '洗涤准备',
  });

  checklist.push({
    text: '将衣物反面翻出洗涤',
    checked: false,
    category: '洗涤准备',
  });

  if (careResult.colorRule && careResult.colorRule.washSeparately) {
    checklist.push({
      text: '深浅衣物分开洗涤',
      checked: false,
      category: '洗涤准备',
    });
  }

  if (careResult.maxTemp > 0) {
    checklist.push({
      text: `控制水温不超过 ${careResult.maxTemp}°C`,
      checked: false,
      category: '洗涤过程',
    });
  }

  if (!careResult.canBleach) {
    checklist.push({
      text: '禁止使用漂白剂',
      checked: false,
      category: '洗涤过程',
      warning: true,
    });
  }

  if (careResult.forbiddenDetergent.length > 0) {
    checklist.push({
      text: `禁用洗涤剂: ${careResult.forbiddenDetergent.join('、')}`,
      checked: false,
      category: '洗涤过程',
      warning: true,
    });
  }

  if (careResult.washMethod.id === 'hand') {
    checklist.push({
      text: '轻柔按压洗涤，避免揉搓拉扯',
      checked: false,
      category: '洗涤过程',
    });
    checklist.push({
      text: '充分漂洗，确保无洗涤剂残留',
      checked: false,
      category: '洗涤过程',
    });
  }

  if (careResult.washMethod.id === 'machine') {
    checklist.push({
      text: '有装饰物的衣物装入洗衣袋',
      checked: false,
      category: '洗涤过程',
    });
  }

  checklist.push({
    text: '洗涤后及时取出，避免长时间闷在洗衣机内',
    checked: false,
    category: '晾晒过程',
  });

  checklist.push({
    text: careResult.dryingMethod,
    checked: false,
    category: '晾晒过程',
  });

  if (
    careResult.fabricId === 'wool' ||
    careResult.fabricId === 'cashmere' ||
    careResult.fabricId === 'down'
  ) {
    checklist.push({
      text: '避免悬挂晾晒，防止衣物变形',
      checked: false,
      category: '晾晒过程',
    });
  }

  if (careResult.tips && careResult.tips.length > 0) {
    careResult.tips.forEach((tip, index) => {
      if (index < 3) {
        checklist.push({
          text: tip,
          checked: false,
          category: '额外注意',
        });
      }
    });
  }

  return checklist;
}
