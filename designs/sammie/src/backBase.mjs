import { back as backDaisy } from '@freesewing/daisy'

export const backBase = {
  name: 'sammie.backBase',
  from: backDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    backArmholeDepth: 0.552, //Locked for Sammie
    backArmholePitchDepth: 0.5, //Locked for Sammie
    backArmholePitchWidth: 0.97, //Locked for Sammie
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    //Style
    armholeDrop: { pct: 10, min: 0, max: 50, menu: 'style' },
    backDrop: { pct: 25, min: 0, max: 100, menu: 'style' },
    //Construction
    closurePosition: { dflt: 'back', list: ['front', 'side', 'back'], menu: 'construction' },
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    styleLinesSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
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
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    //measures
    const backDartAngle =
      points.dartTip.angle(points.dartBottomRight) - points.dartTip.angle(points.dartBottomLeft)
    //guides
    paths.daisyGuides = new Path()
      .move(points.cbWaist)
      .line(points.dartBottomLeft)
      .line(points.dartTip)
      .line(points.dartBottomRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .line(points.cbWaist)
      .attr('class', 'various lashed')
    //let's begin
    points.armholeDrop = points.armhole.shiftFractionTowards(points.sideWaist, options.armholeDrop)
    points.cbArmholeDrop = new Point(points.cbNeck.x, points.armholeDrop.y)
    points.cbTop = points.cbArmholeDrop.shiftFractionTowards(points.cbWaist, options.backDrop)
    points.cbTopAnchorCp = new Point(points.dartTip.x, points.cbTop.y)

    points.dartTopLeftCp = utils.beamsIntersect(
      (points.dartTopLeftCp = points.cbTop.shiftFractionTowards(points.dartBottomLeft, 0.75)),
      (points.dartTopLeftCp = points.cbTop
        .shiftFractionTowards(points.dartBottomLeft, 0.75)
        .shift(-90, 1)),
      points.cbTop,
      points.cbTop.shift(0, 1)
    )

    points.dartTopRightCp = utils
      .beamsIntersect(
        points.dartTopLeftCp,
        points.armholeDrop.rotate(-backDartAngle, points.dartTip),
        points.dartTip.shiftFractionTowards(points.armhole, 0.25),
        points.dartTip.shiftFractionTowards(points.armhole, 0.25).shift(-90, 1)
      )
      .rotate(backDartAngle, points.dartTip)

    points.dartTopLeft = utils.lineIntersectsCurve(
      points.dartBottomLeft,
      points.dartTip,
      points.armholeDrop.rotate(-backDartAngle, points.dartTip),
      points.dartTopRightCp.rotate(-backDartAngle, points.dartTip),
      points.dartTopLeftCp,
      points.cbTop
    )

    points.dartTopRight = points.dartTopLeft.flipX(points.dartTip)

    //guides
    paths.centreBack = new Path()
      .move(points.armholeDrop.rotate(-backDartAngle, points.dartTip))
      .curve(
        points.dartTopRightCp.rotate(-backDartAngle, points.dartTip),
        points.dartTopLeftCp,
        points.cbTop
      )
      .split(points.dartTopLeft)[1]
      .line(points.cbWaist)
      .line(points.dartBottomLeft)
      .line(points.dartTopLeft)

    paths.sideBack = new Path()
      .move(points.armholeDrop)
      .curve(
        points.dartTopRightCp,
        points.dartTopLeftCp.rotate(backDartAngle, points.dartTip),
        points.cbTop.rotate(backDartAngle, points.dartTip)
      )
      .split(points.dartTopRight)[0]

    //stores
    store.set(
      'backSideAngle',
      points.armhole.angle(points.sideWaist) - points.armholeDrop.angle(points.dartTopRightCp)
    )

    return part
  },
}
