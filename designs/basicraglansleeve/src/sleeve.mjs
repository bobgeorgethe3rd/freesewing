import { pluginBundle } from '@freesewing/plugin-bundle'
import { pctBasedOn } from '@freesewing/core'
import { draftRaglanSleeveCap } from './sleevecap.mjs'
import { sleeve as basicSleeve } from '@freesewing/basicsleeve'

export const sleeve = {
  name: 'basicraglansleeve.sleeve',
  measurements: ['shoulderToElbow', 'shoulderToWrist', 'biceps', 'elbow', 'wrist'],
  options: {
    //Imported
    ...basicSleeve.options,
    //Constants
    cfNeck: 0.55191502449,
    neckSaWidth: 0.01,
    //Fit
    bicepsEase: { pct: 20.6, min: 0, max: 25, menu: 'fit' },
    elbowEase: { pct: 19.7, min: 0, max: 25, menu: 'fit' },
    wristEase: { pct: 18, min: 0, max: 50, menu: 'fit' },
    sleeveGuides: { bool: false, menu: 'fit' },
    //Sleeves
    fitSleeveWidth: { bool: true, menu: 'sleeves' },
    sleeveLength: { pct: 100, min: 0, max: 100, menu: 'sleeves' },
    sleeveLengthBonus: { pct: 0, min: -20, max: 20, menu: 'sleeves' },
    sleeveBands: { bool: false, menu: 'sleeves' },
    sleeveBandWidth: {
      pct: 9.5,
      min: 1,
      max: 17.4,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    },
    sleeveFlounces: { dflt: 'none', list: ['flounce', 'ruffle', 'none'], menu: 'sleeves' },
    raglanNeckWidth: { pct: 42.1, min: 15, max: 50, menu: 'sleeves' },
    //Construction
    neckSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    sleeveHemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  plugins: [pluginBundle, ...basicSleeve.plugins],
  draft: (sh) => {
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
      absoluteOptions,
      log,
    } = sh
    //void stores
    if (options.useVoidStores) {
      void store.setIfUnset('shoulderLength', 144)
      void store.setIfUnset('neckFrontWidth', 99)
      void store.setIfUnset('neckFrontDepth', 111)
      void store.setIfUnset('neckFrontAngle', 69)

      void store.setIfUnset('neckBackCpAngleDiag', 111)
      void store.setIfUnset('neckBackCpDistDiag', 44)
      void store.setIfUnset('neckBackCpAngle', 159)
      void store.setIfUnset('neckBackCpDist', 70)

      void store.setIfUnset('backArmholeSplitLength', 62)
      void store.setIfUnset('backArmholeSplitDepth', 221)
      void store.setIfUnset('backArmholeSplitWidth', 133)

      void store.setIfUnset('frontArmholeSplitLength', 96)
      void store.setIfUnset('frontArmholeSplitDepth', 161)
      void store.setIfUnset('frontArmholeSplitWidth', 104)

      void store.setIfUnset('backRaglanLength', 333)
      void store.setIfUnset('frontRaglanLength', 306)
    }
    //draft basicSleeve
    basicSleeve.draft(sh)
    for (let i in snippets) delete snippets[i]
    delete paths.sa
    draftRaglanSleeveCap(part)
    if (options.sleeveGuides) {
      paths.sleeveGuide = paths.setSleeve.clone().attr('class', 'various lashed').unhide()
    }

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.midAnchor.x, points.hps.y)
      points.grainlineTo = points.bottomAnchor
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.frontNotch = paths.sleeveCapFront.shiftFractionAlong(0.5)
      points.backTopNotch = paths.sleeveCapBack.shiftFractionAlong(0.25)
      points.backBottomNotch = paths.sleeveCapBack.shiftFractionAlong(0.75)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontNotch', 'hps'],
      })
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['backTopNotch', 'backBottomNotch'],
      })

      // title
      macro('title', {
        nr: 3,
        title: 'Sleeve',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const hemSa =
          options.sleeveBands || options.sleeveFlounces != 'none'
            ? sa
            : sa * options.sleeveHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        points.saCfNeckSplit = utils.beamIntersectsX(
          paths.neck.offset(neckSa).start(),
          paths.neck.offset(neckSa).shiftFractionAlong(0.005),
          points.cfNeckSplit.x + armholeSa
        )

        points.saCbNeckSplit = utils.beamIntersectsX(
          paths.neck.offset(neckSa).shiftFractionAlong(0.995),
          paths.neck.offset(neckSa).end(),
          points.cbNeckSplit.x - armholeSa
        )

        paths.sa = paths.sleeveCapFront
          .offset(armholeSa)
          .line(points.saCfNeckSplit)
          .join(paths.neck.offset(neckSa))
          .line(points.saCbNeckSplit)
          .join(paths.sleeveCapBack.offset(armholeSa))
          .line(points.saSleeveCapLeft)
          .line(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomLeftCorner)
          .line(points.saBottomRightCorner)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saSleeveCapRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
