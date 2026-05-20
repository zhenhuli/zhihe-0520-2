export const SPORTS_TYPES = [
  { id: 'running', name: '跑步', met: 8.0, intensityFactor: 1.2 },
  { id: 'cycling', name: '骑行', met: 6.8, intensityFactor: 1.0 },
  { id: 'swimming', name: '游泳', met: 9.8, intensityFactor: 1.3 },
  { id: 'weightlifting', name: '力量训练', met: 5.0, intensityFactor: 1.1 },
  { id: 'yoga', name: '瑜伽', met: 2.5, intensityFactor: 0.6 },
  { id: 'basketball', name: '篮球', met: 7.2, intensityFactor: 1.15 },
  { id: 'football', name: '足球', met: 10.0, intensityFactor: 1.25 },
  { id: 'tennis', name: '网球', met: 7.0, intensityFactor: 1.1 },
  { id: 'badminton', name: '羽毛球', met: 6.5, intensityFactor: 1.05 },
  { id: 'walking', name: '快走', met: 3.5, intensityFactor: 0.7 },
  { id: 'hiit', name: 'HIIT高强度间歇', met: 12.0, intensityFactor: 1.5 },
  { id: 'other', name: '其他', met: 5.0, intensityFactor: 1.0 }
]

export const HEART_RATE_ZONES = [
  { id: 'zone1', name: 'Zone 1 - 恢复区', min: 50, max: 60, factor: 0.6, description: '非常轻松，可正常交谈' },
  { id: 'zone2', name: 'Zone 2 - 脂肪燃烧区', min: 60, max: 70, factor: 0.8, description: '轻松，可连续交谈' },
  { id: 'zone3', name: 'Zone 3 - 有氧区', min: 70, max: 80, factor: 1.0, description: '中等强度，交谈略有困难' },
  { id: 'zone4', name: 'Zone 4 - 无氧阈区', min: 80, max: 90, factor: 1.3, description: '高强度，只能说短句' },
  { id: 'zone5', name: 'Zone 5 - 极限区', min: 90, max: 100, factor: 1.6, description: '极高强度，几乎无法说话' }
]

export const RPE_LEVELS = [
  { value: 6, label: '6 - 非常轻松', description: '休息状态' },
  { value: 7, label: '7 - 很轻松', description: '可以轻松唱歌' },
  { value: 8, label: '8 - 轻松', description: '可以连续交谈' },
  { value: 9, label: '9 - 比较轻松', description: '交谈略有困难' },
  { value: 10, label: '10 - 中等', description: '可以说短句' },
  { value: 11, label: '11 - 有点吃力', description: '需要用力呼吸' },
  { value: 12, label: '12 - 吃力', description: '呼吸急促' },
  { value: 13, label: '13 - 很吃力', description: '只能说几个字' },
  { value: 14, label: '14 - 非常吃力', description: '几乎无法说话' },
  { value: 15, label: '15 - 极度吃力', description: '极限状态' },
  { value: 16, label: '16 - 筋疲力尽', description: '无法继续' },
  { value: 17, label: '17 - 极限', description: '濒临极限' },
  { value: 18, label: '18 - 非常极限', description: '几乎不能动' },
  { value: 19, label: '19 - 极度极限', description: '完全不能动' },
  { value: 20, label: '20 - 最大极限', description: '濒死状态' }
]

export function calculateMaxHeartRate(age = 30) {
  return 220 - age
}

export function calculateTrainingLoad({
  sportType,
  duration,
  heartRateZone,
  rpe,
  age = 30,
  weight = 70
}) {
  const sport = SPORTS_TYPES.find(s => s.id === sportType) || SPORTS_TYPES[SPORTS_TYPES.length - 1]
  const zone = HEART_RATE_ZONES.find(z => z.id === heartRateZone) || HEART_RATE_ZONES[0]
  
  const durationHours = duration / 60
  
  const caloriesBurned = sport.met * weight * durationHours
  
  const rpeLoad = rpe * duration
  
  const trimp = duration * zone.factor * sport.intensityFactor
  
  const totalLoad = Math.round((rpeLoad * 0.4 + trimp * 0.4 + caloriesBurned * 0.2))
  
  let intensityLevel
  let color
  if (totalLoad < 200) {
    intensityLevel = '低强度'
    color = 'success'
  } else if (totalLoad < 400) {
    intensityLevel = '中低强度'
    color = 'success'
  } else if (totalLoad < 600) {
    intensityLevel = '中等强度'
    color = 'warning'
  } else if (totalLoad < 800) {
    intensityLevel = '中高强度'
    color = 'warning'
  } else if (totalLoad < 1000) {
    intensityLevel = '高强度'
    color = 'danger'
  } else {
    intensityLevel = '极高强度'
    color = 'danger'
  }
  
  const isOverloaded = totalLoad >= 800
  const recommendations = generateRecommendations(totalLoad, sportType, duration, rpe)
  
  return {
    totalLoad,
    intensityLevel,
    color,
    isOverloaded,
    caloriesBurned: Math.round(caloriesBurned),
    rpeLoad,
    trimp: Math.round(trimp),
    recommendations
  }
}

function generateRecommendations(load, sportType, duration, rpe) {
  const recommendations = {
    restAdvice: '',
    nutritionAdvice: '',
    nextTraining: '',
    warnings: []
  }
  
  if (load < 200) {
    recommendations.restAdvice = '本次训练强度较低，休息30-60分钟即可完全恢复。'
    recommendations.nutritionAdvice = '正常饮食即可，可适当补充蛋白质促进肌肉修复。'
    recommendations.nextTraining = '明天可以进行正常训练，建议搭配不同运动项目。'
  } else if (load < 400) {
    recommendations.restAdvice = '建议休息1-2小时，当天避免再进行高强度活动。'
    recommendations.nutritionAdvice = '训练后30分钟内补充蛋白质和碳水化合物，多喝水。'
    recommendations.nextTraining = '建议间隔12-24小时后再进行下一次训练。'
  } else if (load < 600) {
    recommendations.restAdvice = '需要充分休息2-4小时，建议当晚早睡保证8小时睡眠。'
    recommendations.nutritionAdvice = '训练后立即补充30-40g蛋白质和60-80g碳水化合物，补充电解质。'
    recommendations.nextTraining = '建议休息24-48小时后再进行训练，可安排低强度恢复性运动。'
  } else if (load < 800) {
    recommendations.restAdvice = '需要充足休息4-6小时，建议当晚早睡，保证9小时睡眠。'
    recommendations.nutritionAdvice = '分阶段补充营养，训练后1小时内补充蛋白质和碳水，正餐增加优质蛋白和蔬菜。'
    recommendations.nextTraining = '建议休息48-72小时，期间可进行轻度拉伸或瑜伽等恢复性活动。'
    recommendations.warnings.push('训练强度较高，注意观察身体反应')
  } else if (load < 1000) {
    recommendations.restAdvice = '高强度训练后需要充分休息，建议当天完全休息，保证充足睡眠。'
    recommendations.nutritionAdvice = '大量补充营养，蛋白质摄入量增加到每公斤体重1.6-2.2g，补充足够的维生素和矿物质。'
    recommendations.nextTraining = '建议休息72小时以上，恢复期间只进行非常轻度的活动。'
    recommendations.warnings.push('训练强度很高，注意预防运动损伤')
    recommendations.warnings.push('如果出现持续疲劳、睡眠质量下降等情况，请延长休息时间')
  } else {
    recommendations.restAdvice = '极高强度训练后需要完全休息2-3天，保证充足睡眠和恢复。'
    recommendations.nutritionAdvice = '需要大量补充营养，建议咨询营养师制定专门的恢复饮食计划。'
    recommendations.nextTraining = '建议休息至少72-96小时，恢复期间避免任何有强度的运动。'
    recommendations.warnings.push('⚠️ 训练强度极高，存在过度训练风险')
    recommendations.warnings.push('⚠️ 密切关注身体状况，如有不适请及时就医')
    recommendations.warnings.push('⚠️ 建议在专业教练指导下进行如此高强度的训练')
  }
  
  if (rpe >= 15 && duration >= 60) {
    recommendations.warnings.push('长时间高强度训练，注意补水和电解质平衡')
  }
  
  return recommendations
}
