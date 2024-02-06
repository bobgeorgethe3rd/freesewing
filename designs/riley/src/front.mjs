import { front as terryFront } from '@freesewing/terry'
import { back } from './back.mjs'

export const front = {
  name: 'riley.front',
  after: back,
  from: terryFront,
  hide: {
    from: true,
    inherited: true,
  },
  options: {},
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
    absoluteOptions,
    log,
  }) => {
    //delete certain paths
    delete paths.seam
    delete paths.sa
    delete snippets.armholePitch
    //measurements
    const armholeSplitDepth = store.get('armholeSplitDepth')
    //let's begin
    points.armholeSplit = utils.curveIntersectsY(
      points.armhole,
      points.armholeCp2,
      points.armholePitchCp1,
      points.armholePitch,
      armholeSplitDepth
    )
    points.neckSplit = paths.cfNeck.shiftAlong(store.get('neckSplitWidth'))
    points.armholeSplitCp2Target = utils.beamsIntersect(
      paths.armhole.split(points.armholeSplit)[0].shiftFractionAlong(0.99),
      points.armholeSplit,
      points.neckSplit,
      points.neckSplit.shift(points.shoulderTop.angle(points.shoulder), 1)
    )
    points.armholeSplitCp2 = points.armholeSplit.shiftFractionTowards(
      points.armholeSplitCp2Target,
      0.85
    )

    //paths
    paths.armhole = paths.armhole
      .split(points.armholeSplit)[0]
      .curve_(points.armholeSplitCp2, points.neckSplit)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.cfNeck.split(points.neckSplit)[1])
      .line(points.cfHem)
      .close()
    //stores
    points.raglanAnchor = utils.beamsIntersect(
      points.neckSplit,
      points.neckSplit.shift(points.shoulderTop.angle(points.shoulder), 1),
      points.armholeSplit,
      points.armholeSplit.shift(points.shoulderTop.angle(points.shoulder) + 90, 1)
    )
    points.raglanArmholeAnchor = points.armhole.rotate(
      180,
      utils.beamsIntersect(
        points.armholeSplitCp2,
        points.armholeSplit,
        points.armhole,
        points.armhole.shift(points.armholeSplit.angle(points.armholeSplitCp2) + 90, 1)
      )
    )
    points.raglanShoulderAnchor = utils.beamsIntersect(
      points.shoulderTop,
      points.shoulder,
      points.raglanArmholeAnchor,
      points.raglanArmholeAnchor.shift(points.shoulderTop.angle(points.shoulder) + 90, 1)
    )
    store.set('neckFrontWidth', points.shoulderTop.x)
    store.set('neckFrontAngle', points.shoulderTop.angle(points.shoulder) - 270)
    store.set(
      'raglanNeckFrontAngle',
      points.shoulderTop.angle(points.shoulder) - points.neckSplit.angle(points.armholeSplitCp2)
    )
    store.set(
      'raglanArmholeFrontAngle',
      90 -
        (points.shoulder.angle(points.shoulderTop) -
          points.armholeSplit.angle(points.armholeSplitCp2))
    )
    store.set('frontRaglanLength', paths.armhole.length())
    store.set('raglanFrontWidth', points.armholeSplit.dist(points.raglanAnchor))
    store.set('raglanFrontDepth', points.neckSplit.dist(points.raglanAnchor))
    store.set('raglanScyeFrontWidth', points.raglanArmholeAnchor.dist(points.raglanShoulderAnchor))
    store.set('raglanScyeFrontDepth', points.raglanShoulderAnchor.dist(points.shoulderTop))
    if (complete) {
      //notches
      points.armholeNotch = paths.armhole.shiftFractionAlong(0.5)
      snippets.armholeNotch = new Snippet('notch', points.armholeNotch)
      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100
        points.saShoulderTop = utils.beamsIntersect(
          paths.cfNeck.split(points.neckSplit)[1].offset(neckSa).start(),
          paths.cfNeck.split(points.neckSplit)[1].offset(neckSa).shiftFractionAlong(0.01),
          points.armholeSplitCp2
            .shiftTowards(points.neckSplit, sa)
            .rotate(-90, points.armholeSplitCp2),
          points.neckSplit.shiftTowards(points.armholeSplitCp2, sa).rotate(90, points.neckSplit)
        )

        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sa * options.sideSeamSaWidth * 100))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa))
          .line(points.saShoulderTop)
          .join(paths.cfNeck.split(points.neckSplit)[1].offset(sa * options.neckSaWidth * 100))
          .line(points.saCfTop)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
