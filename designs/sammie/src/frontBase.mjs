import { backBase } from './backBase.mjs'
import { front as frontDaisy } from '@freesewing/daisy'

export const frontBase = {
  name: 'sammie.frontBase',
  from: frontDaisy,
  after: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    bustDartPlacement: 'shoulder', //locked for Sammie
    bustDartLength: 1, //locked for Sammie
    waistDartLength: 1, //locked for Sammie
    //Style
    necklineDrop: { pct: 66.7, min: 50, max: 75, menu: 'style' },
    frontAngle: { deg: 0, min: -20, max: 20, menu: 'style' },
    frontCurve: { pct: 75, min: 0, max: 100, menu: 'style' },
    sweetheart: { bool: true, menu: 'style' },
    sweetheartDrop: { pct: 37.5, min: 0, max: 100, menu: 'style' },
    //Darts
    bustDartFraction: { pct: 0, min: 0, max: 100, menu: 'darts' }, //Altered for Sammie
    bustDartCurve: { pct: 0, min: -100, max: 100, menu: 'darts' }, //Altered for Sammie
  },
  draft: ({
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
  }) => {
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //measures
    const bustDartAngleSide = store.get('bustDartAngleSide')
    //let's begin
    //new dart control points
    points.bustDartCpMid = points.bust.shiftFractionTowards(points.bustDartMiddle, 0.1)
    points.waistDartMiddleCp = points.bust
      .shiftTowards(points.bustDartMiddle, points.bust.dist(points.waistDartHem) * 0.25)
      .rotate(180, points.bust)

    //dart split points
    points.frontTopRightAnchor = new Point(points.cfNeck.x, points.hps.y).shiftFractionTowards(
      points.cfBust,
      options.necklineDrop
    )
    points.frontTopRight = utils.lineIntersectsCurve(
      points.frontTopRightAnchor,
      points.frontTopRightAnchor.shift(0, measurements.chest * 10),
      points.bust,
      points.bustDartCpMid,
      points.bustDartCpTop,
      points.bustDartTop
    )

    points.sideFrontTopLeft = new Path()
      .move(points.bustDartBottom)
      .curve(points.bustDartCpBottom, points.bustDartCpMid, points.bust)
      .shiftAlong(
        new Path()
          .move(points.bust)
          .curve(points.bustDartCpMid, points.bustDartCpTop, points.bustDartTop)
          .split(points.frontTopRight)[1]
          .length()
      )

    //centre front
    points.cfTopAnchor = utils.beamsIntersect(
      points.frontTopRight,
      points.frontTopRight.shift(180 - options.frontAngle, 1),
      points.cfNeck,
      points.cfWaist
    )
    points.frontTopRightCp2 = points.frontTopRight.shiftFractionTowards(
      points.cfTopAnchor,
      options.frontCurve
    )
    if (options.sweetheart) {
      points.cfTop = points.cfTopAnchor.shiftFractionTowards(points.cfBust, options.sweetheartDrop)
    } else {
      points.cfTop = new Point(points.cfNeck.x, points.frontTopRightCp2.y)
    }
    //armhole
    points.armholeDrop = points.sideWaist.shiftTowards(points.armhole, store.get('sideLength'))
    points.armholeDropCp2 = points.armholeDrop.shift(
      points.armhole.angle(points.armholeCp2) - store.get('cpAngle'),
      points.armhole.dist(points.armholeCp2) * (2 + options.armholeDrop)
    )
    points.sideFrontTopLeftCp1 = points.sideFrontTopLeft.shift(
      points.cfBust.angle(points.bust) - options.frontAngle - bustDartAngleSide,
      points.frontTopRightAnchor.dist(points.frontTopRight) * (options.bustDartFraction * -0.5 + 1)
    )

    //stores
    store.set(
      'waistFront',
      (points.cfWaist.dist(points.waistDartLeft) + points.waistDartRight.dist(points.sideWaist)) * 4
    )
    store.set('storedWaist', (store.get('waistBack') + store.get('waistFront')) / 2)

    //guides
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .curve_(points.waistDartLeftCp, points.waistDartTip)
        ._curve(points.waistDartRightCp, points.waistDartRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.bustDartBottom)
        ._curve(points.bustDartCpBottom, points.bustDartTip)
        .curve_(points.bustDartCpTop, points.bustDartTop)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.cfWaist)
        .close()
        .attr('class', 'various lashed')
    }

    paths.frontRight = new Path()
      .move(points.waistDartLeft)
      .curve(points.waistDartLeftCp, points.waistDartMiddleCp, points.bust)
      .curve(points.bustDartCpMid, points.bustDartCpTop, points.bustDartTop)

    paths.sideFrontLeft = new Path()
      .move(points.bustDartBottom)
      .curve(points.bustDartCpBottom, points.bustDartCpMid, points.bust)
      .curve(points.waistDartMiddleCp, points.waistDartRightCp, points.waistDartRight)

    paths.sideFrontCurve = new Path()
      .move(points.armholeDrop)
      .curve(points.armholeDropCp2, points.sideFrontTopLeftCp1, points.sideFrontTopLeft)

    paths.cfCurve = new Path()
      .move(points.frontTopRight)
      .curve_(points.frontTopRightCp2, points.cfTop)

    return part
  },
}
