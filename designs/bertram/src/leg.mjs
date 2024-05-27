import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { draftCross } from '@freesewing/neville'

export const leg = {
  name: 'bertram.leg',
  options: {
    //Imported
    ...draftCross.options,
  },
  measurements: [
    ...draftCross.measurements,
    'ankle',
    'knee',
    'heel',
    'hips',
    'hipsBack',
    'waist',
    'waistBack',
    'waistToKnee',
  ],
  plugins: [pluginBundle],
  draft: (sh) => {
    //draft
    const {
      store,
      sa,
      Point,
      points,
      Path,
      paths,
      options,
      complete,
      paperless,
      macro,
      utils,
      measurements,
      part,
      snippets,
      Snippet,
      absoluteOptions,
    } = sh
    //draft
    draftCross.draft(sh)
    //measures
    const crossSeamBack = store.get('crossSeamBack')
    const toHips = store.get('toHips')
    const toUpperLeg = store.get('toUpperLeg')
    const seatBack = store.get('seatBack')
    const seatFront = store.get('seatFront')
    const waistbandWidth = store.get('waistbandWidth')
    let hipsBack
    let hipsFront
    if (options.useBackMeasures) {
      void store.setIfUnset('waistBack', measurements.waistBack * (1 + options.waistEase))
      void store.setIfUnset(
        'waistFront',
        (measurements.waist - measurements.waistBack) * (1 + options.waistEase)
      )
      hipsBack = measurements.hipsBack * (1 + options.hipsEase)
      hipsFront = (measurements.hips - measurements.hipsBack) * (1 + options.hipsEase)
    } else {
      void store.setIfUnset('waistBack', measurements.waist * (1 + options.waistEase) * 0.5)
      void store.setIfUnset('waistFront', measurements.waist * (1 + options.waistEase) * 0.5)
      hipsBack = measurements.hips * (1 + options.hipsEase) * 0.5
      hipsFront = measurements.hips * (1 + options.hipsEase) * 0.5
    }
    const waistBack = store.get('waistBack')
    const waistFront = store.get('waistFront')

    const knee = measurements.knee * (1 + options.kneeEase)
    let legBandWidth = absoluteOptions.legBandWidth
    if (!options.legBandsBool) {
      legBandWidth = 0
    }
    const toFloor = measurements.waistToFloor * (1 + options.legLengthBonus) - legBandWidth

    let floor = measurements.heel * (1 + options.heelEase)
    if (!options.useHeel) {
      floor = measurements.ankle * (1 + options.ankleEase)
    }
    let legBandDiff
    if (options.calculateLegBandDiff) {
      legBandDiff = (legBandWidth * (knee - floor)) / (toFloor - measurements.waistToKnee)
    } else {
      legBandDiff = 0
    }
    floor = floor + legBandDiff

    let waistbandDiff
    if (options.calculateWaistbandDiff || options.waistbandStyle == 'curved') {
      waistbandDiff =
        (waistbandWidth *
          (measurements.hips * (1 + options.hipsEase) -
            measurements.waist * (1 + options.waistEase))) /
        measurements.waistToHips /
        2
    } else {
      waistbandDiff = 0
    }
    if (options.fitWaistBack || waistBack > seatBack) {
      void store.setIfUnset(
        'styleWaistBack',
        waistBack * options.waistHeight + hipsBack * (1 - options.waistHeight) + waistbandDiff
      )
    } else {
      void store.setIfUnset('styleWaistBack', seatBack)
    }
    const styleWaistBack = store.get('styleWaistBack')

    if (options.fitWaistFront || waistFront > seatFront) {
      void store.setIfUnset(
        'styleWaistFront',
        waistFront * options.waistHeight + hipsFront * (1 - options.waistHeight) + waistbandDiff
      )
    } else {
      void store.setIfUnset('styleWaistFront', seatFront)
    }
    const styleWaistFront = store.get('styleWaistFront')
    //let's begin

    //guides
    paths.crossSeam.unhide()

    return part
  },
}
