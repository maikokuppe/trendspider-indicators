describe_indicator('Institutional Supply and Demand Zones', 'price', { shortName: 'Maiko Supply/Demand' })
// Use this value to set the maximum number of zones. Without this maximum number the saved indicator will not paint any.
const maxNumberOfAreas = 5
let series = for_every(open, high, close, low, function (o, h, c, l, lastOHCL, index) {
  if (index === 0) {
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
    demandZones: lastOHCL.demandZones,
    supplyZones: lastOHCL.supplyZones,
    data: extractDataFrom(o, h, c, l, lastOHCL),
  }
  return lastOHCL
})

function colors({ o, h, c, l, data = {} }) {
  const { justEnteredPosition, position } = data

  if (justEnteredPosition && position === 'long') {
    return 'white'
  } else if (justEnteredPosition) {
    // Entry and exit in same candle
    return 'gray'
  }
}

function extractDataFrom(o, h, c, l, { demandZones, supplyZones, data }) {
  const demandZone = demandZones[Object.keys(demandZones).at(-1)]
  const supplyZone = supplyZones[Object.keys(supplyZones).at(-1)]
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
  }
  const positionData = extractPositionDataFrom(o, h, c, l, extendedData)

  return Object.assign(extendedData, positionData)
}

function extractPositionDataFrom(o, h, c, l, data) {
  const {
    lastDemandTop, lastDemandBottom, lastSupplyTop, lastSupplyBottom,
    entry, stopLoss, takeProfit, position, profit, totalProfit
  } = data

  let positionData = {
    position: position,
    justEnteredPosition: false,
    entry: entry,
    stopLoss: stopLoss,
    takeProfit: takeProfit,
    profit: null,
    totalProfit: totalProfit || 0,
  }

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

  }

  if (!position) {
    const crossedIntoDemandZone = o > lastDemandTop && l < lastDemandTop
    const crossedThroughDemandZone = o > lastDemandTop && l < lastDemandBottom
    const closedInSupplyZone = c > lastSupplyBottom
    const supplyZoneExists = !!lastSupplyBottom
    const distanceBetweenZones = supplyZoneExists && lastSupplyBottom - lastDemandTop >= 2 * (lastDemandTop - lastDemandBottom)

    if (crossedIntoDemandZone && supplyZoneExists && distanceBetweenZones) {
      positionData.position = 'long'
      positionData.justEnteredPosition = true
      positionData.entry = lastDemandTop
      // Maybe put SL a bit lower
      // Maybe use minimum SL to avoid fraction
      positionData.stopLoss = lastDemandBottom
      positionData.takeProfit = lastSupplyBottom
      positionData.profit = null

      if (crossedThroughDemandZone) {
        // Instant stop loss (pessimistic)
        positionData.position = null
        positionData.entry = null
        positionData.stopLoss = null
        positionData.takeProfit = null
        positionData.profit = lastDemandBottom - lastDemandTop
      } else if (closedInSupplyZone) {
        // Instant take profit (pessimistic)
        positionData.position = null
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

fill(
  paint(for_every(series, (s) => s.data?.demandTop), { hidden: true }),
  paint(for_every(series, (s) => s.data?.demandBottom), { hidden: true }),
  'green', 0.2, 'Demand',
)

fill(
  paint(for_every(series, (s) => s.data?.supplyTop), { hidden: true }),
  paint(for_every(series, (s) => s.data?.supplyBottom), { hidden: true }),
  'red', 0.2, 'Supply',
)

color_candles(for_every(series, colors))

paint(for_every(series, (s) => s.data?.profit > 0 && s.data?.profit), { style: 'labels_above', color: 'green' })
paint(for_every(series, (s) => s.data?.profit < 0 && s.data?.profit), { style: 'labels_below', color: 'red' })
// paint(for_every(series, (s) => s.data?.profit && s.data?.totalProfit), { style: 'labels_above', color: 'white' })
