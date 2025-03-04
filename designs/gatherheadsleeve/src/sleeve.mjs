import { sleeve as basicsleeve } from '@freesewing/basicsleeve'

export const sleeve = {
  name: 'gatherheadsleeve.sleeve',
  options: {
    //Imported
    ...basicsleeve.options,
    //Fit
    basicSleeveGuides: { bool: false, menu: 'fit' },
    //Sleeves
    spread: { pct: 60, min: 0, max: 120, menu: 'sleeves' },
  },
  measurements: [...basicsleeve.measurements],
  plugins: [...basicsleeve.plugins],
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
      Snippet,
      absoluteOptions,
      log,
    } = sh
    //draft basic sleeve
    basicsleeve.draft(sh)
    //remove paths & snippets
    const keepThese = ['seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.basicSleeveGuides) {
      paths.basicSleeveGuide = paths.seam.attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //removing macros not required from sleevecap
    macro('title', false)
    //measurements
    const spreadAngle = options.spread * 0.5 * 100
    //setting the stage
    for (let i = 1; i <= 4; i++) {
      points['capQ' + i + 'Bottom'] = new Point(points['capQ' + i].x, points.sleeveCapLeft.y)
    }
    points.sleeveTipLeft = points.sleeveTip
    points.sleeveTipRight = points.sleeveTip
    points.sleeveTipLeftBottom = new Point(points.sleeveTip.x, points.sleeveCapLeft.y)
    points.sleeveTipRightBottom = new Point(points.sleeveTip.x, points.sleeveCapLeft.y)
    //let's begin
    //left rotate
    const rotLeft0 = [
      'sleeveTipLeft',
      'capQ3Cp1',
      'capQ3',
      'capQ3Cp2',
      'capQ4Cp1',
      'capQ4',
      'capQ4Cp2',
      'capQ4Bottom',
      'capQ3Bottom',
      'sleeveTipLeftBottom',
    ]
    for (const p of rotLeft0) points[p] = points[p].rotate(spreadAngle, points.sleeveCapLeft)

    // paths.rotLeft0 = new Path()
    // .move(points.sleeveTipLeft)
    // ._curve(points.capQ3Cp1, points.capQ3)
    // .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
    // .curve_(points.capQ4Cp2, points.sleeveCapLeft)
    // .attr('class', 'contrast dashed')

    const spreadAngleLeft = points.sleeveTipLeftBottom.angle(points.sleeveTipLeft) - 90

    const rotLeft1 = [
      'sleeveTipLeft',
      'capQ3Cp1',
      'capQ3',
      'capQ3Cp2',
      'capQ4Cp1',
      'capQ3Bottom',
      'sleeveTipLeftBottom',
    ]
    for (const p of rotLeft1) points[p] = points[p].rotate(spreadAngleLeft / -3, points.capQ4Bottom)
    points.capQ4R = points.capQ4.rotate(spreadAngleLeft / -3, points.capQ4Bottom)

    // paths.rotLeft1 = new Path()
    // .move(points.sleeveTipLeft)
    // ._curve(points.capQ3Cp1, points.capQ3)
    // .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4R)
    // .attr('class', 'mark dashed')
    // .hide()

    const rotLeft2 = ['sleeveTipLeft', 'capQ3Cp1', 'sleeveTipLeftBottom']
    for (const p of rotLeft2) points[p] = points[p].rotate(spreadAngleLeft / -3, points.capQ3Bottom)
    points.capQ3R = points.capQ3.rotate(spreadAngleLeft / -3, points.capQ3Bottom)

    paths.rotLeft2 = new Path()
      .move(points.sleeveTipLeft)
      ._curve(points.capQ3Cp1, points.capQ3R)
      .attr('class', 'lining dashed')
      .hide()

    points.sleeveTipLeftR = points.sleeveTipLeft
    points.sleeveTipLeft = points.sleeveTipLeft.rotate(
      spreadAngleLeft / -3,
      points.sleeveTipLeftBottom
    )

    // paths.sleeveGuideLeft = new Path()
    // .move(points.sleeveTipLeft)
    // .line(points.sleeveTipLeftBottom)
    // .line(points.sleeveTipLeftR)
    // ._curve(points.capQ3Cp1, points.capQ3R)
    // .line(points.capQ3Bottom)
    // .line(points.capQ3)
    // .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4R)
    // .line(points.capQ4Bottom)
    // .line(points.capQ4)
    // .curve_(points.capQ4Cp2, points.sleeveCapLeft)
    // .attr('class', 'note dashed')

    //right rotate
    const rotRight0 = [
      'capQ1Cp1',
      'capQ1',
      'capQ1Cp2',
      'capQ2Cp1',
      'capQ2',
      'capQ2Cp2',
      'sleeveTipRight',
      'sleeveTipRightBottom',
      'capQ2Bottom',
      'capQ1Bottom',
    ]
    for (const p of rotRight0) points[p] = points[p].rotate(-spreadAngle, points.sleeveCapRight)

    points.capQ1R = points.capQ1

    // paths.rotRight0 = new Path()
    // .move(points.sleeveCapRight)
    // ._curve(points.capQ1Cp1, points.capQ1)
    // .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
    // .curve_(points.capQ2Cp2, points.sleeveTipRight)
    // .attr('class', 'contrast dashed')

    const spreadAngleRight = 90 - points.sleeveTipRightBottom.angle(points.sleeveTipRight)

    const rotRight1 = [
      'capQ1',
      'capQ1Cp2',
      'capQ2Cp1',
      'capQ2',
      'capQ2Cp2',
      'sleeveTipRight',
      'sleeveTipRightBottom',
      'capQ2Bottom',
    ]
    for (const p of rotRight1)
      points[p] = points[p].rotate(spreadAngleRight / 3, points.capQ1Bottom)

    points.capQ2R = points.capQ2

    // paths.rotRight1 = new Path()
    // .move(points.capQ1)
    // .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
    // .curve_(points.capQ2Cp2, points.sleeveTipRight)
    // .attr('class', 'mark dashed')
    // .hide()

    const rotRight2 = ['capQ2', 'capQ2Cp2', 'sleeveTipRight', 'sleeveTipRightBottom']
    for (const p of rotRight2)
      points[p] = points[p].rotate(spreadAngleRight / 3, points.capQ2Bottom)
    points.sleeveTipRightR = points.sleeveTipRight

    // paths.rotRight2 = new Path()
    // .move(points.capQ2)
    // .curve_(points.capQ2Cp2, points.sleeveTipRight)
    // .attr('class', 'lining dashed')
    // .hide()

    points.sleeveTipRight = points.sleeveTipRight.rotate(
      spreadAngleLeft / 3,
      points.sleeveTipRightBottom
    )

    // paths.sleeveGuideRight = new Path()
    // .move(points.sleeveCapRight)
    // ._curve(points.capQ1Cp1, points.capQ1R)
    // .line(points.capQ1Bottom)
    // .line(points.capQ1)
    // .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2R)
    // .line(points.capQ2Bottom)
    // .line(points.capQ2)
    // .curve_(points.capQ2Cp2, points.sleeveTipRightR)
    // .line(points.sleeveTipRightBottom)
    // .line(points.sleeveTipRight)
    // .attr('class', 'note dashed')

    //sleevecap
    points.capQ1Cp2 = points.capQ1R.shift(
      points.capQ1Cp1.angle(points.capQ1R),
      points.capQ1R.dist(points.capQ1Cp2)
    )

    points.sleeveTipRight = utils.beamIntersectsX(
      points.capQ2Bottom,
      points.sleeveTipRight,
      points.sleeveTip.x
    )

    points.sleeveTipLeft = utils.beamIntersectsX(
      points.capQ3Bottom,
      points.sleeveTipLeft,
      points.sleeveTip.x
    )
    points.sleeveTip = points.sleeveTipRight.shiftFractionTowards(points.sleeveTipLeft, 0.5)

    points.capQ2Cp2 = utils.beamIntersectsY(points.capQ2Cp1, points.capQ2R, points.sleeveTip.y)

    points.capQ3Cp1 = utils.beamIntersectsY(points.capQ3Cp2, points.capQ3, points.sleeveTip.y)

    points.capQ4Cp1 = points.capQ4.shift(
      points.capQ4Cp2.angle(points.capQ4),
      points.capQ4.dist(points.capQ4Cp1)
    )
    //paths
    paths.sleevecap = new Path()
      .move(points.sleeveCapRight)
      ._curve(points.capQ1Cp1, points.capQ1R)
      .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2R)
      .curve_(points.capQ2Cp2, points.sleeveTip)
      ._curve(points.capQ3Cp1, points.capQ3)
      .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
      .curve_(points.capQ4Cp2, points.sleeveCapLeft)
      .hide()

    paths.seam = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.sleeveCapRight)
      .join(paths.sleevecap)
      .line(points.bottomLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.midAnchor.x, points.sleeveTip.y)
      points.grainlineTo = points.bottomAnchor
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.frontNotch = paths.sleevecap.shiftAlong(store.get('frontArmholeToArmholePitch'))
      points.backNotch = paths.sleevecap
        .reverse()
        .shiftAlong(store.get('backArmholeToArmholePitch'))
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontNotch', 'sleeveTip'],
      })
      snippets.backNotch = new Snippet('bnotch', points.backNotch)
      //title
      points.title = new Point(
        points.sleeveCapLeft.x * 0.5,
        (points.grainlineTo.y + points.grainlineFrom.y) / 2
      )
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'sleeve',
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100

        points.saSleeveCapRight = utils.beamIntersectsY(
          points.saTopRight,
          points.saTopRight.shift(90, 1),
          paths.sleevecap.offset(armholeSa).start().y
        )

        points.saSleeveCapLeft = utils.beamIntersectsY(
          points.saTopLeft,
          points.saTopLeft.shift(90, 1),
          paths.sleevecap.offset(armholeSa).end().y
        )

        paths.sa = paths.sleevecap
          .offset(armholeSa)
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
