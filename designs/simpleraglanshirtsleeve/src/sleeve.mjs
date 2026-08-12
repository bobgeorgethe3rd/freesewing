import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { draftRaglanSleeveCap } from '@freesewing/basicraglansleeve'
import { sleeve as simpleShirtSleeve } from '@freesewing/simpleshirtsleeve'

export const sleeve = {
  name: 'simpleraglanshirtsleeve.sleeve',
  measurements: [...simpleShirtSleeve.measurements],
  options: {
    //Imported
    ...simpleShirtSleeve.options,
    //Constants
    sleeveFlounces: 'none', //Locked for Simpleraglanshirtsleeve
    sleeveBands: false, //Locked for Simpleraglanshirtsleeve
    cfNeck: 0.55191502449,
    neckSaWidth: 0.01,
    //Fit
    sleeveGuides: { bool: false, menu: 'fit' },
    //Sleeves
    sleeveHemStyle: { dflt: 'cuffed', list: ['cuffed', 'band', 'turnover'], menu: 'sleeves' },
    sleeveLength: { pct: 25, min: 10, max: 100, menu: 'sleeves' },
    sleeveSideCurve: { pct: 50, min: 0, max: 100, menu: 'sleeves' },
    sleeveTurnoverDoubleFold: { bool: true, menu: 'sleeves' },
    raglanNeckWidth: { pct: 42.1, min: 15, max: 50, menu: 'sleeves' },
    //Advanced
    sleeveSideCurveDepth: { pct: 50, min: 30, max: 70, menu: 'advanced.sleeves' },
  },
  plugins: [pluginBundle, pluginMirror],
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
    //draft base sleeves
    simpleShirtSleeve.draft(sh)
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
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        const drawSaLeft = () => {
          if (options.sleeveHemStyle != 'band' && points.bottomAnchor.y > 0) {
            if (options.sleeveHemStyle == 'cuffed') {
              return paths.saLeft
                .join(paths.saLeft1)
                .offset(sideSeamSa)
                .join(paths.mSaLeft1.offset(-sideSeamSa).reverse())
            } else {
              return paths.saLeft.join(paths.saLeft1).offset(sideSeamSa)
            }
          } else {
            if (points.bottomAnchor.y > 0) {
              return paths.saLeft.offset(sideSeamSa)
            } else {
              return new Path().move(points.saSleeveCapLeft)
            }
          }
        }

        points.saCfNeckSplit = utils.beamIntersectsX(
          paths.neck.offset(neckSa).start(),
          paths.neck.offset(neckSa).shiftFractionAlong(0.005),
          points.cfNeckSplit.x + neckSa
        )

        const drawSaRight = () => {
          if (options.sleeveHemStyle != 'band' && points.bottomAnchor.y > 0) {
            if (options.sleeveHemStyle == 'cuffed') {
              return paths.mSaRight1
                .offset(-sideSeamSa)
                .reverse()
                .join(paths.saRight1.offset(sideSeamSa))
                .join(paths.saRight.offset(sideSeamSa))
            } else {
              return paths.saRight1.join(paths.saRight).offset(sideSeamSa)
            }
          } else {
            if (points.bottomAnchor.y > 0) {
              return paths.saRight.offset(sideSeamSa)
            } else {
              return new Path().move(points.saSleeveCapRight)
            }
          }
        }

        points.saCbNeckSplit = utils.beamIntersectsX(
          paths.neck.offset(neckSa).shiftFractionAlong(0.995),
          paths.neck.offset(neckSa).end(),
          points.cbNeckSplit.x - neckSa
        )

        paths.sa = new Path()
          .move(points.saHemLeft)
          .line(points.saHemRight)
          .join(drawSaRight())
          .line(points.saSleeveCapRight)
          .join(paths.sleeveCapFront.offset(armholeSa))
          .line(points.saCfNeckSplit)
          .join(paths.neck.offset(neckSa))
          .line(points.saCbNeckSplit)
          .join(paths.sleeveCapBack.offset(armholeSa))
          .line(points.saSleeveCapLeft)
          .join(drawSaLeft())
          .line(points.saHemLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
