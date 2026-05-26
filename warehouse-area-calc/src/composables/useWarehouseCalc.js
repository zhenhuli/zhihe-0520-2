import { computed, reactive } from 'vue'

export function useWarehouseCalc() {
  const warehouse = reactive({
    length: 50,
    width: 30,
    pillarWidth: 0.6,
    pillarDepth: 0.6,
    pillarRows: 3,
    pillarCols: 5,
    aisleWidth: 3,
    aisleDepth: 2.5,
    shelfWidth: 2,
    shelfDepth: 1,
    wallMargin: 0.5,
    crossAisles: 2
  })

  const originalArea = computed(() => {
    return warehouse.length * warehouse.width
  })

  const pillarArea = computed(() => {
    const singlePillarArea = warehouse.pillarWidth * warehouse.pillarDepth
    const pillarCount = warehouse.pillarRows * warehouse.pillarCols
    return singlePillarArea * pillarCount
  })

  const aisleArea = computed(() => {
    const mainAisleWidth = warehouse.aisleWidth * warehouse.width
    const depthAisles = warehouse.aisleDepth * warehouse.length
    const crossAislesArea = warehouse.crossAisles * warehouse.aisleWidth * warehouse.width
    return mainAisleWidth + depthAisles + crossAislesArea
  })

  const wallMarginArea = computed(() => {
    const margin = warehouse.wallMargin
    return 2 * margin * (warehouse.length + warehouse.width) - 4 * margin * margin
  })

  const effectiveArea = computed(() => {
    const occupied = pillarArea.value + aisleArea.value + wallMarginArea.value
    return Math.max(0, originalArea.value - occupied)
  })

  const shelfCount = computed(() => {
    const usableLength = warehouse.length - 2 * warehouse.wallMargin - warehouse.aisleWidth
    const usableWidth = warehouse.width - 2 * warehouse.wallMargin
    
    const shelvesPerRow = Math.floor(usableWidth / (warehouse.shelfWidth + warehouse.aisleDepth))
    const rows = Math.floor(usableLength / warehouse.shelfDepth)
    
    return Math.max(0, shelvesPerRow * rows)
  })

  const spaceUtilization = computed(() => {
    if (originalArea.value === 0) return 0
    return ((effectiveArea.value / originalArea.value) * 100).toFixed(2)
  })

  const utilizationRate = computed(() => {
    if (originalArea.value === 0) return 0
    const shelfTotalArea = shelfCount.value * warehouse.shelfWidth * warehouse.shelfDepth
    return ((shelfTotalArea / originalArea.value) * 100).toFixed(2)
  })

  const pillars = computed(() => {
    const result = []
    const spacingX = warehouse.length / (warehouse.pillarCols + 1)
    const spacingY = warehouse.width / (warehouse.pillarRows + 1)
    
    for (let row = 0; row < warehouse.pillarRows; row++) {
      for (let col = 0; col < warehouse.pillarCols; col++) {
        result.push({
          x: spacingX * (col + 1) - warehouse.pillarWidth / 2,
          y: spacingY * (row + 1) - warehouse.pillarDepth / 2,
          width: warehouse.pillarWidth,
          height: warehouse.pillarDepth
        })
      }
    }
    return result
  })

  const shelves = computed(() => {
    const result = []
    const margin = warehouse.wallMargin
    const startX = margin
    const startY = margin
    const usableWidth = warehouse.width - 2 * margin
    
    const shelvesPerRow = Math.floor(usableWidth / (warehouse.shelfWidth + warehouse.aisleDepth))
    
    for (let row = 0; row < Math.floor(warehouse.length / warehouse.shelfDepth); row++) {
      for (let col = 0; col < shelvesPerRow; col++) {
        result.push({
          x: startX + col * (warehouse.shelfWidth + warehouse.aisleDepth),
          y: startY + row * (warehouse.shelfDepth + warehouse.aisleWidth / 10),
          width: warehouse.shelfWidth,
          height: warehouse.shelfDepth
        })
      }
    }
    return result
  })

  return {
    warehouse,
    originalArea,
    pillarArea,
    aisleArea,
    wallMarginArea,
    effectiveArea,
    shelfCount,
    spaceUtilization,
    utilizationRate,
    pillars,
    shelves
  }
}
