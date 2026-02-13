import { front as frontDaisy } from '@freesewing/daisy'

export const frontBase = {
  name: 'playtest.frontBase',
  from: frontDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    //Style
    waistDepth: { pct: 65, min: 25, max: 100, menu: 'style' },
    //Darts
    bustDartPlacement: { dflt: '2waist', list: ['waist', '2waist', 'french'], menu: 'darts' },
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
    const keepThese = ['seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daisyGuides) {
      paths.daisyGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //measurements
    const bustDartAngle = store.get('bustDartAngle')
    //let's begin
    //waist line
    points.cfBottom = points.cfChest.shiftFractionTowards(points.cfWaist, options.waistDepth)
    if (points.cfBottom.y < points.waistDartTip.y) {
      points.cfBottom = new Point(points.cfWaist.x, points.waistDartTip.y).shiftFractionTowards(
        points.cfWaist,
        options.waistDepth
      )
    }
    points.waistDartBottomLeft = utils.beamIntersectsY(
      points.waistDartLeft,
      points.waistDartTip,
      points.cfBottom.y
    )
    points.waistDartBottomRight = points.waistDartTip.shiftTowards(
      points.waistDartRight,
      points.waistDartTip.dist(points.waistDartBottomLeft)
    )

    if (options.bustDartPlacement == 'french') {
      points.sideWaist = points.bustDartTop
    }

    if (options.bustDartPlacement != 'waist') {
      points.waistDartAnchor = points.sideWaist.rotate(-bustDartAngle, points.bust)

      points.bustDartBottomLeft = utils.beamsIntersect(
        points.waistDartBottomRight,
        points.waistDartBottomRight.shift(points.waistDartAnchor.angle(points.waistDartRight), 1),
        points.bustDartBottom,
        points.bustDartTip
      )
      points.bustDartBottomRight = points.bustDartTip.shiftTowards(
        points.bustDartTop,
        points.bustDartTip.dist(points.bustDartBottomLeft)
      )
      points.bustDartAnchor = points.waistDartRight.rotate(bustDartAngle, points.bust)

      points.sideBottom = utils.beamsIntersect(
        points.bustDartBottomRight,
        points.bustDartBottomRight.shift(points.bustDartAnchor.angle(points.sideWaist), 1),
        points.armhole,
        points.sideWaist
      )
    } else {
      points.sideBottom = utils.beamsIntersect(
        points.waistDartBottomRight,
        points.waistDartBottomRight.shift(points.waistDartRight.angle(points.sideWaist), 1),
        points.armhole,
        points.sideWaist
      )
    }

    // paths.guide = new Path()
    // .move(options.bustDartPlacement != 'waist' ? points.bustDartBottomRight : points.waistDartBottomRight)
    // .line(points.sideBottom)

    store.set('sideSeamLength', points.armhole.dist(points.sideBottom))
    store.set(
      'sideSeamAngle',
      points.sideWaist.angle(
        options.bustDartPlacement != 'waist' ? points.bustDartAnchor : points.waistDartBottomRight
      ) - points.sideWaist.angle(points.armhole)
    )

    return part
  },
}
