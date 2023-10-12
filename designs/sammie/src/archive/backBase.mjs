import { back as backDaisy } from '@freesewing/daisy'

export const backBase = {
  name: 'sammie.backBase',
  from: backDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Fit
    daisyGuide: { bool: false, menu: 'fit' },
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
    //guides
    paths.daisyGuide = new Path()
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

    const topLeftI = utils.lineIntersectsCurve(
      points.dartBottomLeft,
      points.dartTip,
      points.cbTop,
      points.cbTopAnchorCp,
      points.armholeDrop,
      points.armholeDrop
    )

    if (topLeftI) {
      points.dartTopLeft = topLeftI
    } else {
      points.dartTopLeft = points.dartTip
    }

    points.dartTopRight = points.dartTopLeft.flipX(points.dartTip)

    paths.initialCurve = new Path()
      .move(points.cbTop)
      .curve_(points.cbTopAnchorCp, points.armholeDrop)
      .split(points.dartTopLeft)[0]
      .hide()

    if (options.backDrop == 0) {
      points.dartTopLeftCp = points.cbTop.shiftFractionTowards(points.dartTopLeft, 0.4)
    } else {
      points.dartTopLeftCp = utils.beamsIntersect(
        paths.initialCurve.end(),
        paths.initialCurve.shiftFractionAlong(0.99),
        points.cbTop,
        points.cbTop.shift(0, 1)
      )
    }

    points.dartTopRightCp = utils.beamsIntersect(
      points.dartTopRight,
      points.dartTopRight.shift(points.dartTopLeftCp.angle(points.dartTopLeft), 1),
      points.dartTip.shiftFractionTowards(points.armhole, 0.5),
      points.dartTip.shiftFractionTowards(points.armhole, 0.5).shift(-90, 1)
    )

    //guides
    paths.centreBack = new Path()
      .move(points.cbWaist)
      .line(points.dartBottomLeft)
      .line(points.dartTopLeft)
      ._curve(points.dartTopLeftCp, points.cbTop)
      .line(points.cbWaist)

    paths.sideBack = new Path()
      .move(points.dartBottomRight)
      .line(points.sideWaist)
      .line(points.armholeDrop)
      .curve_(points.dartTopRightCp, points.dartTopRight)
      .line(points.dartBottomRight)

    //stores
    store.set(
      'backSideAngle',
      points.armhole.angle(points.sideWaist) - points.armholeDrop.angle(points.dartTopRightCp)
    )

    return part
  },
}
