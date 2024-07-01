import { back as terryBack } from '@freesewing/terry'

export const back = {
  name: 'riley.back',
  from: terryBack,
  hide: {
    after: true,
    from: true,
    inherited: true,
  },
  options: {
    //Sleeves
    raglanNeckWidth: { pct: 42.1, min: 15, max: 50, menu: 'sleeves' },
    raglanArmholeDepth: { pct: 59.7, min: 50, max: 70, menu: 'sleeves' },
    raglanCurveDepth: { pct: 85, min: 50, max: 100, menu: 'sleeves' },
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
    absoluteOptions,
    log,
  }) => {
    //delete certain paths
    delete paths.seam
    delete paths.sa
    delete snippets.armholePitch
    //let's begin
    points.cArmholeSplit = points.cArmhole.shiftFractionTowards(
      points.cArmholePitch,
      options.raglanArmholeDepth
    )
    // points.armholeSplit = paths.armhole.split(points.armholePitch)[0].shiftFractionAlong(2 / 3)
    points.armholeSplit = utils.curveIntersectsY(
      points.armhole,
      points.armholeCp2,
      points.armholePitchCp1,
      points.armholePitch,
      points.cArmholeSplit.y
    )
    points.neckSplit = paths.cbNeck.shiftFractionAlong(options.raglanNeckWidth)
    // points.armholeSplitCp2Target = utils.beamsIntersect(
    // paths.armhole.split(points.armholePitch)[0].shiftFractionAlong((2 / 3) * 0.99),
    // points.armholeSplit,
    // points.neckSplit,
    // points.neckSplit.shift(points.shoulderTop.angle(points.shoulder), 1)
    // )
    // points.armholeSplitCp2 = points.armholeSplit.shiftFractionTowards(
    // points.armholeSplitCp2Target,
    // options.raglanCurveDepth
    // )

    points.armholeSplitCp2 = points.armholeSplit.shiftFractionTowards(
      utils.beamsIntersect(
        points.armholeCp2,
        points.armholeSplit,
        points.neckSplit,
        points.neckSplit.shift(points.hps.angle(points.shoulder), 1)
      ),
      options.raglanCurveDepth
    )

    //paths
    paths.armhole = new Path()
      .move(points.armhole)
      .curve_(points.armholeCp2, points.armholeSplit)
      .curve_(points.armholeSplitCp2, points.neckSplit)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.cbNeck.split(points.neckSplit)[1])
      .line(points.cbHem)
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
    store.set('armholeSplitDepth', points.armholeSplit.y)
    store.set('neckSplitWidth', paths.cbNeck.split(points.neckSplit)[0].length())
    store.set('shoulderLength', points.shoulderTop.dist(points.shoulder))
    store.set(
      'neckBackCpAngleDiag',
      points.shoulderTop.angle(points.shoulder) - points.shoulderTop.angle(points.cbTopCp1)
    )
    store.set('neckBackCpDistDiag', points.shoulderTop.dist(points.cbTopCp1))
    store.set('neckBackCpAngle', points.shoulderTop.angle(points.shoulder) - 180)
    store.set('neckBackCpDist', points.cbTopCp1.dist(points.cbTop))
    store.set(
      'raglanNeckBackAngle',
      points.shoulderTop.angle(points.shoulder) - points.neckSplit.angle(points.armholeSplitCp2)
    )
    store.set(
      'raglanArmholeBackAngle',
      90 -
        (points.shoulder.angle(points.shoulderTop) -
          points.armholeSplit.angle(points.armholeSplitCp2))
    )
    store.set('backRaglanLength', paths.armhole.length())
    store.set('raglanBackWidth', points.armholeSplit.dist(points.raglanAnchor))
    store.set('raglanBackDepth', points.neckSplit.dist(points.raglanAnchor))
    store.set('raglanScyeBackWidth', points.raglanArmholeAnchor.dist(points.raglanShoulderAnchor))
    store.set('raglanScyeBackDepth', points.raglanShoulderAnchor.dist(points.shoulderTop))
    if (complete) {
      //notches
      points.armholeBottomNotch = paths.armhole.shiftFractionAlong(0.25)
      points.armholeTopNotch = paths.armhole.shiftFractionAlong(0.75)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['armholeBottomNotch', 'armholeTopNotch'],
      })
      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100
        points.saShoulderTop = utils.beamsIntersect(
          paths.cbNeck.split(points.neckSplit)[1].offset(neckSa).start(),
          paths.cbNeck.split(points.neckSplit)[1].offset(neckSa).shiftFractionAlong(0.01),
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
          .join(paths.cbNeck.split(points.neckSplit)[1].offset(sa * options.neckSaWidth * 100))
          .line(points.saCbTop)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
