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
    points.armholeSplit = utils.lineIntersectsCurve(
      new Point(points.cfHead.x, armholeSplitDepth),
      new Point(points.armhole.x, armholeSplitDepth),
      points.armhole,
      points.armholeCp2,
      points.armholePitchCp1,
      points.armholePitch
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
    store.set('neckFrontWidth', points.shoulderTop.x)
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
          .line(points.saCfHead)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
