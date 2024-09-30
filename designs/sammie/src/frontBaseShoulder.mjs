import { frontShoulderDart } from '@freesewing/daisy'
import { backBase } from './backBase.mjs'

export const frontBaseShoulder = {
  name: 'sammie.frontBaseShoulder',
  after: backBase,
  draft: (sh) => {
    const {
      store,
      sa,
      Point,
      points,
      Path,
      paths,
      options,
      absoluteOptions,
      complete,
      paperless,
      macro,
      utils,
      measurements,
      part,
      snippets,
      Snippet,
    } = sh
    //draft
    frontShoulderDart(sh)
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('scalebox', false)
    //daisy guide
    paths.daisyGuides = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.waistDartTip)
      .line(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.bustDartBottom)
      .line(points.bust)
      .line(points.bustDartTop)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .attr('class', 'various lashed')
    //measures
    const bustDartAngle = store.get('bustDartAngle')
    // const contourWidth = absoluteOptions.frontContour
    //let's begin
    //neckline
    // points.neckFrontCfAnchor = points.cfNeck.shiftFractionTowards(points.cArmhole, options.neckDrop)

    // points.neckFrontDartAnchor = utils.beamsIntersect(
    // points.neckFrontCfAnchor,
    // points.neckFrontCfAnchor.shift(0, 1),
    // points.bust,
    // points.bustDartTop
    // )
    // points.neckFront = points.neckFrontDartAnchor.shift(180 - options.frontAngle, contourWidth / 2)

    // const contourAngle =
    // points.bust.angle(points.neckFront) - points.bust.angle(points.neckFrontDartAnchor)

    // points.neckSideFront = points.neckFront.rotate(-bustDartAngle - contourAngle * 2, points.bust)

    // points.cfTopAnchor = utils.beamsIntersect(
    // points.neckFront,
    // points.neckFrontCfAnchor.rotate(options.frontAngle * -1, points.neckFront),
    // points.cfNeck,
    // points.cfWaist
    // )

    points.cfTopAnchor = points.cfNeck.shiftFractionTowards(points.cArmhole, options.neckDrop)

    points.neckFront = utils.beamIntersectsY(
      points.bustDartTop,
      points.bustDartTop.shift(points.bustDartMid.angle(points.bust), 1),
      points.cfTopAnchor.y
    )

    points.neckSideFront = points.bustDartBottom.shift(
      points.bustDartMid.angle(points.bust),
      points.bustDartTop.dist(points.neckFront)
    )

    const contourAngle =
      points.bust.angle(points.neckFront) - points.bust.angle(points.neckSideFront)

    points.neckFrontCp = points.neckFront.shiftFractionTowards(
      points.cfTopAnchor,
      options.frontCurve
    )

    if (options.sweetheart) {
      points.cfTop = points.cfTopAnchor.shiftFractionTowards(points.cfChest, options.heartDrop)
    } else {
      points.cfTop = new Point(points.cfNeck.x, points.neckFrontCp.y)
    }

    //top curve
    points.armholeDrop = points.armhole.shiftFractionTowards(points.sideWaist, options.armholeDrop)

    const armholeDropCpFraction =
      points.cfWaist.dist(points.waistDartLeft) /
      (points.cfWaist.dist(points.waistDartLeft) + points.waistDartRight.dist(points.sideWaist))

    points.armholeDropCp = points.armholeDrop
      .shiftTowards(
        points.sideWaist,
        points.waistDartRight.dist(points.sideWaist) * armholeDropCpFraction
      )
      .rotate(store.get('backSideAngle') - 180, points.armholeDrop)
    points.neckSideFrontCpAnchor = points.cfTopAnchor.rotate(-contourAngle, points.bust)

    let neckSideFrontCpFraction = options.sideFrontCurve * (1 - options.bustDartFraction)
    if (neckSideFrontCpFraction < 1 / 3 && options.guaranteeSideFrontCurve) {
      neckSideFrontCpFraction = 1 / 3
    }

    points.neckSideFrontCp = points.neckSideFront.shift(
      points.neckSideFrontCpAnchor.angle(points.neckSideFront),
      points.neckFront.dist(points.cfTopAnchor) * neckSideFrontCpFraction
    )

    //Shaping the dart curves
    points.waistDartLeftCp = points.waistDartLeft.shift(
      90,
      points.waistDartMid.dist(points.bust) * 0.5
    )
    points.waistDartRightCp = new Point(points.waistDartRight.x, points.waistDartLeftCp.y)

    points.bustCp2 = points.bust.shiftFractionTowards(
      points.neckFront.shiftFractionTowards(points.neckSideFront, 0.5),
      0.25
    )
    points.bustCp1 = points.bustCp2.shiftOutwards(
      points.bust,
      points.bust.dist(points.waistDartMid) * 0.25
    )

    //guides
    paths.centreFrontGuide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .curve(points.waistDartLeftCp, points.bustCp1, points.bust)
      .curve_(points.bustCp2, points.neckFront)
      .curve_(points.neckFrontCp, points.cfTop)
      .line(points.cfWaist)

    paths.sideFront = new Path()
      .move(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armholeDrop)
      .curve(points.armholeDropCp, points.neckSideFrontCp, points.neckSideFront)
      ._curve(points.bustCp2, points.bust)
      .curve(points.bustCp1, points.waistDartRightCp, points.waistDartRight)

    //stores
    store.set('contourAngle', contourAngle)
    store.set(
      'waistFront',
      (points.cfWaist.dist(points.waistDartLeft) + points.waistDartRight.dist(points.sideWaist)) * 4
    )
    store.set('storedWaist', (store.get('waistFront') + store.get('waistBack')) / 2)

    if (complete) {
      //notches
      snippets.bust = new Snippet('notch', points.bust)
    }

    return part
  },
}
