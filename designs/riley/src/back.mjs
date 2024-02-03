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
    ) //0.597
    // points.armholeSplit = paths.armhole.split(points.armholePitch)[0].shiftFractionAlong(2 / 3)
    points.armholeSplit = utils.curveIntersectsY(
      points.armhole,
      points.armholeCp2,
      points.armholePitchCp1,
      points.armholePitch,
      points.cArmholeSplit.y
    )
    points.neckSplit = paths.cbNeck.shiftFractionAlong(options.raglanNeckWidth)
    points.armholeSplitCp2Target = utils.beamsIntersect(
      paths.armhole.split(points.armholePitch)[0].shiftFractionAlong((2 / 3) * 0.99),
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
      .join(paths.cbNeck.split(points.neckSplit)[1])
      .line(points.cbHem)
      .close()

    //stores
    store.set('armholeSplitDepth', points.armholeSplit.y)
    store.set('neckSplitWidth', paths.cbNeck.split(points.neckSplit)[0].length())
    store.set('shoulderLength', points.shoulderTop.dist(points.shoulder))
    store.set(
      'neckBackCpAngleDiag',
      points.shoulderTop.angle(points.shoulder) - points.shoulderTop.angle(points.cbHeadCp1)
    )
    store.set('neckBackCpDistDiag', points.shoulderTop.dist(points.cbHeadCp1))
    store.set('neckBackCpAngle', points.shoulderTop.angle(points.shoulder) - 180)
    store.set('neckBackCpDist', points.cbHeadCp1.dist(points.cbHead))
    store.set(
      'neckBackRaglanAngle',
      points.shoulderTop.angle(points.shoulder) - points.neckSplit.angle(points.armholeSplitCp2)
    )
    store.set('raglanBackSplitDist', paths.armhole.split(points.armholeSplit)[0].length())
    store.set('raglanBackDist', paths.armhole.length())
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
          .line(points.saCbHead)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
