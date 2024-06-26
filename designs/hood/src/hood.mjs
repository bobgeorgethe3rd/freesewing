import { pluginBundle } from '@freesewing/plugin-bundle'

export const hood = {
  name: 'hood.hood',
  options: {
    //Constant
    useVoidStores: true,
    neckSaWidth: 0.01,
    //Style
    hoodFrontNeckDrop: { pct: 97.9, min: 70, max: 100, menu: 'style.hoods' },
    hoodDepth: { pct: 72.7, min: 60, max: 100, menu: 'style.hoods' },
    hoodWidth: { pct: 25, min: 0, max: 100, menu: 'style.hoods' },
    hoodFrontWidth: { pct: 100, min: 85, max: 100, menu: 'style.hoods' },
    hoodBackDepth: { pct: 60, min: 40, max: 70, menu: 'style.hoods' },
    hoodOverlap: { pct: 106.3, min: 0, max: 150, menu: 'style.hoods' },
    hoodFrontAngle: { deg: 7.5, min: 0, max: 20, menu: 'style.hoods' },
  },
  measurements: ['head'],
  plugins: [pluginBundle],
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
    //voidStores
    if (options.useVoidStores) {
      void store.setIfUnset('neckBack', 100.8) //107
      void store.setIfUnset('neckFront', 158.9) //165
      void store.setIfUnset('neckBackAngle', 228) //40
      void store.setIfUnset('neckBackDepth', 29.5) //32.6
      void store.setIfUnset('neckBackWidth', 94) //99
      void store.setIfUnset('neckFrontDepth', 108) //111
    }
    //measurements
    const neckBack = store.get('neckBack')
    const neckFront = store.get('neckFront')
    const hoodDepth = measurements.head * options.hoodDepth
    //let's begin
    points.origin = new Point(0, 0)
    points.cb = points.origin.shift(90, store.get('neckBackDepth'))
    points.hps = points.origin.shift(0, store.get('neckBackWidth'))

    // let backTweak = 1
    // let backDelta
    // do {
    // points.cbCp2 = utils.beamIntersectsY(
    // points.hps,
    // points.hps.shift(135 * backTweak, 1),
    // points.cb.y
    // )
    // backDelta =
    // new Path()
    // .move(points.cb)
    // .curve_(points.cbCp2, points.hps)
    // .length() -
    // neckBack
    // if (backDelta > 0) backTweak = backTweak * 0.99
    // else backTweak = backTweak * 1.01
    // } while (Math.abs(backDelta) > 1)

    points.cbCp2 = utils.beamIntersectsY(
      points.hps,
      points.hps.shift(-store.get('neckBackAngle'), 1),
      points.cb.y
    )

    points.bottomRight = points.cb.translate(
      neckFront + neckBack,
      store.get('neckFrontDepth') * options.hoodFrontNeckDrop
    )
    points.bottomRightCp1 = utils.beamIntersectsY(points.cbCp2, points.hps, points.bottomRight.y)

    paths.saBottom = new Path()
      .move(points.cb)
      .curve_(points.cbCp2, points.hps)
      ._curve(points.bottomRightCp1, points.bottomRight)
      .hide()

    points.cf = paths.saBottom.shiftAlong(neckBack + neckFront)
    if (options.hoodOverlap < 1) {
      points.cfOverlap = paths.saBottom.split(points.cf)[1].shiftFractionAlong(options.hoodOverlap)
    } else {
      points.cfOverlap = points.bottomRightCp1.shiftFractionTowards(
        points.bottomRight,
        options.hoodOverlap
      )
    }

    points.cfTopRight = points.cf.shift(90, hoodDepth)
    points.topLeft = new Point(points.cb.x, points.cfTopRight.y)

    points.right = new Point(
      points.cf.x * options.hoodFrontWidth,
      points.cf.shiftFractionTowards(points.cfTopRight, 0.5).y
    )
    points.rightCp1 = points.right.shift(-90, points.cf.dist(points.right) * 0.5)
    points.rightCp2 = points.right.shift(90, points.right.dist(points.cfTopRight) * 0.5)

    points.topRight = points.cfTopRight
      .rotate(-options.hoodFrontAngle, points.right)
      .shiftFractionTowards(points.rightCp2, options.hoodFrontAngle / 50)

    points.topMid = points.topLeft.shiftFractionTowards(points.cfTopRight, 0.5)

    if (points.topRight.y > points.topMid.y) {
      points.topRightCp2 = utils.beamsIntersect(
        points.topRight,
        points.rightCp2.rotate(-90, points.topRight),
        points.topMid,
        points.cfTopRight
      )
    } else {
      points.topRightCp2 = points.topMid.shiftFractionTowards(points.cfTopRight, 0.5)
    }

    points.left = new Point(
      -(measurements.head / 2 - points.cf.x) * options.hoodWidth,
      points.topLeft.y * options.hoodBackDepth
    )
    points.leftCp1 = new Point(points.left.x, points.topMid.y)
    points.leftCp2 = new Point(points.left.x, points.left.y * 0.75)
    points.cbCp1 = new Point(points.cb.x, points.left.y * 0.75)

    //paths
    if (options.byronGuides || options.daisyGuides) {
      paths.scaffold = new Path()
        .move(points.cf)
        .line(points.cfTopRight)
        .line(points.topLeft)
        .line(points.cb)
        .attr('class', 'various dashed')
    }

    const drawSaBottom = () => {
      if (options.hoodOverlap < 1) {
        return paths.saBottom.split(points.cfOverlap)[0]
      } else {
        if (options.hoodOverlap > 1) {
          return paths.saBottom.line(points.cfOverlap)
        } else {
          return paths.saBottom
        }
      }
    }

    paths.saRight = new Path()
      .move(points.cfOverlap)
      ._curve(points.rightCp1, points.right)
      .curve_(points.rightCp2, points.topRight)
      .hide()

    paths.saCurve = new Path()
      .move(points.topRight)
      .curve_(points.topRightCp2, points.topMid)
      ._curve(points.leftCp1, points.left)
      .curve(points.leftCp2, points.cbCp1, points.cb)
      .hide()

    paths.seam = drawSaBottom().join(paths.saRight).join(paths.saCurve).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid
      points.grainlineTo = new Point(points.grainlineFrom.x, points.hps.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['hps', 'cf'],
      })
      //title
      points.title = new Point((points.cfTopRight.x * 2) / 3, points.cfTopRight.y / 2)
      macro('title', {
        nr: 1,
        title: 'Hood',
        at: points.title,
        scale: 0.5,
      })
      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100

        points.saCfOverlap = utils.beamsIntersect(
          drawSaBottom().offset(neckSa).shiftFractionAlong(0.99),
          drawSaBottom().offset(neckSa).end(),
          points.cfOverlap.shiftTowards(points.rightCp1, sa).rotate(-90, points.cfOverlap),
          points.rightCp1.shiftTowards(points.cfOverlap, sa).rotate(90, points.rightCp1)
        )

        points.saTopRight = points.topRight
          .shift(points.rightCp2.angle(points.topRight), sa)
          .shift(points.topRightCp2.angle(points.topRight), sa)

        points.saCb = points.cb.translate(-sa, neckSa)

        paths.sa = drawSaBottom()
          .offset(neckSa)
          .line(points.saCfOverlap)
          .join(paths.saRight.offset(sa))
          .line(points.saTopRight)
          .join(paths.saCurve.offset(sa))
          .line(points.saCb)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
