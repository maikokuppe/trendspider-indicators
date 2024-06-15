const looseness = input('Looseness', 0.3, { min: 0.0, max: 1.0 })
const targetRatio = input('Target ratio', 1.0, { min: 0.5, max: 5.0 })
const minDist = input('Min. distance', 1.0, { min: 0.5, max: 5.0 })
const minZoneSize = input('Min. zone size', 0.5, { min: 0.1, max: 5.0 })
const maxZoneSize = input('Max. zone size', 3.0, { min: 0.1, max: 5.0 })

const perf = true
describe_indicator('Maiko Supply and Demand Zones', (perf ? 'lower' : 'price'), { shortName: 'Maiko Supply/Demand' })
// Use this value to set the maximum number of zones. Without this maximum number the saved indicator will not paint any.
const maxNumberOfAreas = 1

const atrs = atr(14)

const midResolution = {
  '1': '5',
  '5': '30',
  '15': '60',
  '60': '240',
  '240': 'D',
  'D': 'W',
  'W': 'M',
}[current.resolution]

const mid = await request.history(constants.ticker, midResolution)
const midLanded = [
  interpolate_sparse_series(land_points_onto_series(mid.time, mid.open, time), 'constant'),
  interpolate_sparse_series(land_points_onto_series(mid.time, mid.high, time), 'constant'),
  interpolate_sparse_series(land_points_onto_series(mid.time, mid.close, time), 'constant'),
  interpolate_sparse_series(land_points_onto_series(mid.time, mid.low, time), 'constant'),
]
let midSeries = []
midSeries = for_every(...midLanded, main)
const series = for_every(open, high, close, low, main)

function main(o, h, c, l, lastOHCL, index) {
  if (index === 0 || lastOHCL == null) {
    lastOHCL = { o: o, h: h, c: c, l: l, demandZones: [], supplyZones: [] }
    return lastOHCL
  }
  lastOHCL.demandZones.forEach(function (value, index) {
    if (l < value.bottom) {
      delete lastOHCL.demandZones[index]
    }
  })
  lastOHCL.supplyZones.forEach(function (value, index) {
    if (h > value.top) {
      delete lastOHCL.supplyZones[index]
    }
  })
  if (lastOHCL.o > lastOHCL.c) {
    // red prev candle, get body size
    const prevCandleBodySize = lastOHCL.o - lastOHCL.c
    if (c > o) {
      // current candle is green
      const currentCandleBodySize = c - o
      if (((currentCandleBodySize >= (prevCandleBodySize * 2) && lastOHCL.l <= l) || ((o <= lastOHCL.c) && (c >= lastOHCL.o)))) {
        // we have a demand zone!
        const top = lastOHCL.o
        let bottom, demandZoneIndex
        if (o <= lastOHCL.c) {
          if (lastOHCL.l < l) {
            bottom = lastOHCL.l
            demandZoneIndex = index - 1
          } else {
            bottom = l
            demandZoneIndex = index
          }
        } else {
          bottom = lastOHCL.l
        }
        if (Array.isArray(lastOHCL.demandZones)) {
          lastOHCL.demandZones[index - 1] = { top: top, bottom: bottom }
        } else {
          lastOHCL.demandZones = []
        }
      }
    }
  } else if (lastOHCL.o < lastOHCL.c) {
    // green prev candle
    const prevCandleBodySize = lastOHCL.c - lastOHCL.o
    if (c < o) {
      // current candle is red
      const currentCandleBodySize = o - c
      if (((currentCandleBodySize >= (prevCandleBodySize * 2) && lastOHCL.h >= h) || ((o >= lastOHCL.c) && (c <= lastOHCL.o)))) {
        // we have a supply zone!
        const bottom = lastOHCL.o
        let top, supplyZoneIndex
        if (o >= lastOHCL.c) {
          if (lastOHCL.h < h) {
            top = h
            supplyZoneIndex = index
          } else {
            top = lastOHCL.h
            supplyZoneIndex = index - 1
          }
        } else {
          top = lastOHCL.h
        }
        if (Array.isArray(lastOHCL.supplyZones)) {
          lastOHCL.supplyZones[index - 1] = { top: top, bottom: bottom }
        } else {
          lastOHCL.supplyZones = []
        }
      }
    }
  } else if (lastOHCL.o === lastOHCL.c) {
    // handle the scenario when the last candle was a perfect doji
    const prevCandleBodySize = 0
    if (c > o) {
      // current candle is green
      const currentCandleBodySize = c - o
      if (((currentCandleBodySize >= (prevCandleBodySize * 2) && lastOHCL.l <= l) || ((o <= lastOHCL.c) && (c >= lastOHCL.o)))) {
        // we have a demand zone!
        const top = lastOHCL.o
        let bottom, demandZoneIndex
        if (o <= lastOHCL.c) {
          if (lastOHCL.l < l) {
            bottom = lastOHCL.l
            demandZoneIndex = index - 1
          } else {
            bottom = l
            demandZoneIndex = index
          }
        } else {
          bottom = lastOHCL.l
        }
        if (Array.isArray(lastOHCL.demandZones)) {
          lastOHCL.demandZones[index - 1] = { top: top, bottom: bottom }
        } else {
          lastOHCL.demandZones = []
        }
      }
    }
    if (c < o) {
      // current candle is red
      const currentCandleBodySize = o - c
      if (((currentCandleBodySize >= (prevCandleBodySize * 2) && lastOHCL.h >= h) || ((o >= lastOHCL.c) && (c <= lastOHCL.o)))) {
        // we have a supply zone!
        const bottom = lastOHCL.o
        let top, supplyZoneIndex
        if (o >= lastOHCL.c) {
          if (lastOHCL.h < h) {
            top = h
            supplyZoneIndex = index
          } else {
            top = lastOHCL.h
            supplyZoneIndex = index - 1
          }
        } else {
          top = lastOHCL.h
        }
        if (Array.isArray(lastOHCL.supplyZones)) {
          lastOHCL.supplyZones[index - 1] = { top: top, bottom: bottom }
        } else {
          lastOHCL.supplyZones = []
        }
      }
    }
  }

  lastOHCL = {
    o: o, h: h, c: c, l: l,
    atr: atrs[index],
    demandZones: lastOHCL.demandZones,
    supplyZones: lastOHCL.supplyZones,
    data: extractDataFrom(o, h, c, l, atrs[index], lastOHCL, index),
  }
  return lastOHCL
}

function colors({ o, h, c, l, data = {} }) {
  const { lastPosition, position, instantExit } = data

  if (position === 'long') {
    return '#00ff00'
  } else if (position === 'short') {
    return '#ff0000'
  } else if (instantExit) {
    // Entry and exit in same candle
    return 'gray'
  }
}

function extractDataFrom(o, h, c, l, atr, { demandZones, supplyZones, data }, index) {
  const demandZone = demandZones[Object.keys(demandZones).at(-1)]
  const demandZone2 = demandZones[Object.keys(demandZones).at(-2)]
  const supplyZone = supplyZones[Object.keys(supplyZones).at(-1)]
  const supplyZone2 = supplyZones[Object.keys(supplyZones).at(-2)]
  const extendedData = {
    ...(data || {}),
    demandTop: demandZone?.top,
    demandBottom: demandZone?.bottom,
    supplyTop: supplyZone?.top,
    supplyBottom: supplyZone?.bottom,
    lastDemandTop: data?.demandTop,
    lastDemandBottom: data?.demandBottom,
    lastSupplyTop: data?.supplyTop,
    lastSupplyBottom: data?.supplyBottom,
    midSeries: midSeries[index]?.data || {}, // empty if we are calculating midSeries here
  }
  const positionData = midSeries[index] ? extractPositionDataFrom(o, h, c, l, atr, extendedData) : {}

  return Object.assign(extendedData, positionData)
}

function extractPositionDataFrom(o, h, c, l, atr, data) {
  const {
    lastDemandTop, lastDemandBottom, lastSupplyTop, lastSupplyBottom,
    entry, stopLoss, takeProfit, position, lastPosition, instantExit, profit, totalProfit
  } = data

  let positionData = {
    position: position,
    lastPosition: position,
    instantExit: false,
    entry: entry,
    stopLoss: stopLoss,
    takeProfit: takeProfit,
    profit: null,
    totalProfit: totalProfit || 0,
  }

  // Check exit criteria of open position
  if (position === 'long') {
    // Assume loss if both stopLoss and takeProfit are crossed
    if (l < stopLoss) {
      positionData.position = null
      positionData.entry = null
      positionData.stopLoss = null
      positionData.takeProfit = null
      positionData.profit = stopLoss - entry
    } else if (h > takeProfit) {
      positionData.position = null
      positionData.entry = null
      positionData.stopLoss = null
      positionData.takeProfit = null
      positionData.profit = takeProfit - entry
    }
  }
  else if (position === 'short') {
    // Assume loss if both stopLoss and takeProfit are crossed
    if (h > stopLoss) {
      positionData.position = null
      positionData.entry = null
      positionData.stopLoss = null
      positionData.takeProfit = null
      positionData.profit = entry - stopLoss
    } else if (l < takeProfit) {
      positionData.position = null
      positionData.entry = null
      positionData.stopLoss = null
      positionData.takeProfit = null
      positionData.profit = entry - takeProfit
    }
  }

  // Consider opening a position
  if (!position) {
    const supplyZoneExists = !!lastSupplyBottom
    const supplyZoneSize = lastSupplyTop - lastSupplyBottom
    const demandZoneExists = !!lastDemandTop
    const demandZoneSize = lastDemandTop - lastDemandBottom

    const crossedIntoDemandZone = o > lastDemandTop && l < lastDemandTop
    const crossedThroughDemandZone = o > lastDemandTop && l < lastDemandBottom
    const closedInSupplyZone = c > lastSupplyBottom
    const goodLongRatio = supplyZoneExists && lastSupplyBottom - lastDemandTop >= minDist * demandZoneSize
    const goodDemandZoneSize = demandZoneSize > (minZoneSize * atr) && demandZoneSize < (maxZoneSize * atr)
    const longEnabled = supplyZoneExists
      ? data.midSeries.lastDemandBottom < lastDemandTop && data.midSeries.lastDemandTop + (looseness * (lastSupplyBottom - lastDemandTop)) > lastDemandTop
      : data.midSeries.lastDemandBottom < lastDemandTop && data.midSeries.lastDemandTop > lastDemandTop

    const crossedIntoSupplyZone = o < lastSupplyBottom && h > lastSupplyBottom
    const crossedThroughSupplyZone = o < lastSupplyBottom && h > lastSupplyTop
    const closedInDemandZone = c < lastDemandTop
    const goodShortRatio = demandZoneExists && lastSupplyBottom - lastDemandTop >= minDist * supplyZoneSize
    const goodSupplyZoneSize = supplyZoneSize > (minZoneSize * atr) && supplyZoneSize < (maxZoneSize * atr)
    const shortEnabled = demandZoneExists
      ? data.midSeries.lastSupplyBottom < lastSupplyBottom && data.midSeries.lastSupplyTop - (looseness * (lastSupplyBottom - lastDemandTop)) > lastSupplyBottom
      : data.midSeries.lastSupplyBottom < lastSupplyBottom && data.midSeries.lastSupplyTop > lastSupplyBottom

    if (crossedIntoDemandZone && supplyZoneExists && goodLongRatio && goodDemandZoneSize && longEnabled) {
      positionData.position = 'long'
      positionData.entry = lastDemandTop
      // Maybe put SL a bit lower
      // Maybe use minimum SL to avoid fraction
      positionData.stopLoss = lastDemandBottom
      positionData.takeProfit = Math.min(lastSupplyBottom, lastDemandTop + targetRatio * demandZoneSize)
      positionData.profit = null

      if (crossedThroughDemandZone) {
        // Instant stop loss (pessimistic)
        positionData.position = null
        positionData.instantExit = true
        positionData.entry = null
        positionData.stopLoss = null
        positionData.takeProfit = null
        positionData.profit = lastDemandBottom - lastDemandTop
      } else if (closedInSupplyZone) {
        // Instant take profit (pessimistic)
        positionData.position = null
        positionData.instantExit = true
        positionData.entry = null
        positionData.stopLoss = null
        positionData.takeProfit = null
        positionData.profit = lastSupplyBottom - lastDemandTop
      }
    }

    if (crossedIntoSupplyZone && demandZoneExists && goodShortRatio && goodSupplyZoneSize && shortEnabled) {
      positionData.position = 'short'
      positionData.lastPosition = null
      positionData.entry = lastSupplyBottom
      positionData.stopLoss = lastSupplyTop
      positionData.takeProfit = Math.max(lastDemandTop, lastSupplyBottom - targetRatio * supplyZoneSize)
      positionData.profit = null

      if (crossedThroughSupplyZone) {
        // Instant stop loss (pessimistic)
        positionData.position = null
        positionData.instantExit = true
        positionData.entry = null
        positionData.stopLoss = null
        positionData.takeProfit = null
        positionData.profit = lastSupplyBottom - lastSupplyTop
      } else if (closedInDemandZone) {
        // Instant take profit (pessimistic)
        positionData.position = null
        positionData.instantExit = true
        positionData.entry = null
        positionData.stopLoss = null
        positionData.takeProfit = null
        positionData.profit = lastSupplyBottom - lastDemandTop
      }
    }
  }

  if (positionData.profit) {
    positionData.totalProfit += positionData.profit
  }

  return positionData
}

if (perf) {
  paint(for_every(series, (s) => s.data?.totalProfit), { style: 'line', color: 'white' })
} else {
  fill(
    paint(for_every(series, (s) => s.data?.demandTop), { hidden: true }),
    paint(for_every(series, (s) => s.data?.demandBottom), { hidden: true }),
    'green', 0.4, 'Demand',
  )

  fill(
    paint(for_every(series, (s) => s.data?.supplyTop), { hidden: true }),
    paint(for_every(series, (s) => s.data?.supplyBottom), { hidden: true }),
    'red', 0.4, 'Supply',
  )

  fill(
    paint(for_every(midSeries, (s) => s.data?.demandTop), { hidden: true }),
    paint(for_every(midSeries, (s) => s.data?.demandBottom), { hidden: true }),
    'green', 0.1, 'Demand',
  )

  fill(
    paint(for_every(midSeries, (s) => s.data?.supplyTop), { hidden: true }),
    paint(for_every(midSeries, (s) => s.data?.supplyBottom), { hidden: true }),
    'red', 0.1, 'Supply',
  )

  color_candles(for_every(series, colors))

  paint(for_every(series, ({ data }) => data?.profit > 0 && data?.lastPosition === 'long' && data?.profit), { style: 'labels_above', color: 'green' })
  paint(for_every(series, ({ data }) => data?.profit > 0 && data?.lastPosition === 'short' && data?.profit), { style: 'labels_below', color: 'green' })
  paint(for_every(series, ({ data }) => data?.profit < 0 && data?.lastPosition === 'long' && data?.profit), { style: 'labels_below', color: 'red' })
  paint(for_every(series, ({ data }) => data?.profit < 0 && data?.lastPosition === 'short' && data?.profit), { style: 'labels_above', color: 'red' })
}
