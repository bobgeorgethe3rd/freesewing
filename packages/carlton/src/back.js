import { calculateRatios } from './shared'

export default function(part) {
  let {
    paperless,
    sa,
    snippets,
    Snippet,
    store,
    complete,
    points,
    measurements,
    options,
    macro,
    Point,
    paths,
    Path
  } = part.shorthand()

  calculateRatios(part)
  // Belt width
  let bw = measurements.centerBackNeckToWaist * options.beltWidth
  store.set('beltWidth', bw)

  // Box pleat (bp)
  points.bpStart = new Point(0, points.armholePitch.y)
  points.bpTop = new Point(
    measurements.chestCircumference * options.backPleat * -1,
    points.armholePitch.y
  )
  points.bpBottom = new Point(points.bpTop.x, points.cbWaist.y - bw / 2)
  points.bpTriangleEdge = points.bpStart.shift(0, points.bpTop.dx(points.bpStart) * 0.6)
  points.bpTriangleTip = points.bpStart.shift(90, points.bpStart.dx(points.bpTriangleEdge))

  // Waist shaping
  points.waist = new Point(
    store.get('chest') / 4 - store.get('waistReduction') / 8,
    points.bpBottom.y
  )
  points.waistCp2 = points.waist.shift(90, points.armhole.dy(points.waist) / 3)
  points.cbWaist = new Point(0, points.bpBottom.y)

  // Dart
  points.dartCenter = points.cbWaist.shiftFractionTowards(points.waist, 0.4)
  points.dartTip = points.dartCenter.shift(90, points.armhole.dy(points.dartCenter) * 0.85)
  points.dartRight = points.dartCenter.shift(0, store.get('waistReduction') / 8)
  points.dartLeft = points.dartRight.flipX(points.dartCenter)
  points.dartLeftCp = points.dartLeft.shift(90, points.dartTip.dy(points.dartCenter) * 0.6)
  points.dartRightCp = points.dartLeftCp.flipX(points.dartCenter)

  store.set('cbToDart', points.dartLeft.x)
  store.set('dartToSide', points.dartRight.dx(points.waist))

  // Back stay (bs)
  points.bsCp1 = points.bpStart.shiftFractionTowards(points.armholePitch, 0.5)
  points.bsCp2 = points.armhole.shiftFractionTowards(points.cbArmhole, 0.3)

  // Store collar length
  store.set(
    'backCollarLength',
    new Path()
      .move(points.cbNeck)
      ._curve(points.neckCp2, points.neck)
      .length()
  )

  // Clean up
  for (let i in paths) delete paths[i]
  for (let i in snippets) delete snippets[i]

  // Paths
  paths.seam1 = new Path()
    .move(points.cbNeck)
    .line(points.bpStart)
    .line(points.bpTop)
    .line(points.bpBottom)
  paths.dart = new Path()
    .move(points.dartLeft)
    .curve_(points.dartLeftCp, points.dartTip)
    ._curve(points.dartRightCp, points.dartRight)
  paths.seam2 = new Path()
    .move(points.waist)
    .curve_(points.waistCp2, points.armhole)
    .curve(points.armholeCp2, points.armholeHollowCp1, points.armholeHollow)
    .curve(points.armholeHollowCp2, points.armholePitchCp1, points.armholePitch)
    .curve(points.armholePitchCp2, points.shoulderCp1, points.shoulder)
    .line(points.neck)
    .curve_(points.neckCp2, points.cbNeck)
  paths.seam = paths.seam1
    .join(paths.dart)
    .join(paths.seam2)
    .close()
    .attr('class', 'fabric')

  paths.backStay = new Path()
    .move(points.bpStart)
    .curve(points.bsCp1, points.bsCp2, points.armhole)
    .attr('class', 'canvas lashed')

  paths.triangle = new Path()
    .move(points.bpTriangleTip)
    .line(points.bpTriangleEdge)
    .line(points.bpStart)
    .attr('class', 'dashed')

  if (complete) {
    macro('sprinkle', {
      snippet: 'notch',
      on: ['armholePitch', 'bpTriangleTip']
    })

    macro('grainline', {
      from: points.cbWaist,
      to: points.bpStart
    })

    points.logo = new Point(points.armhole.x * 0.7, points.dartTip.y)
    snippets.logo = new Snippet('logo', points.logo)

    if (sa) {
      paths.sa = paths.seam1
        .line(points.waist)
        .offset(sa)
        .join(paths.seam2.offset(sa))
        .close()
        .trim()
        .close()
        .attr('class', 'fabric sa')
    }

    if (paperless) {
      macro('hd', {
        from: points.bpBottom,
        to: points.cbWaist,
        y: points.cbWaist.y + 15 + sa
      })
      macro('hd', {
        from: points.cbWaist,
        to: points.dartLeft,
        y: points.cbWaist.y + 15 + sa
      })
      macro('hd', {
        from: points.dartLeft,
        to: points.dartRight,
        y: points.cbWaist.y + 15 + sa
      })
      macro('hd', {
        from: points.dartRight,
        to: points.waist,
        y: points.cbWaist.y + 15 + sa
      })
      macro('hd', {
        from: points.cbWaist,
        to: points.waist,
        y: points.cbWaist.y + 30 + sa
      })
      macro('hd', {
        from: points.bpBottom,
        to: points.waist,
        y: points.cbWaist.y + 45 + sa
      })
      macro('vd', {
        from: points.waist,
        to: points.armhole,
        x: points.armhole.x + 15 + sa
      })
      macro('vd', {
        from: points.armhole,
        to: points.armholePitch,
        x: points.armhole.x + 15 + sa
      })
      macro('vd', {
        from: points.armhole,
        to: points.shoulder,
        x: points.armhole.x + 30 + sa
      })
      macro('vd', {
        from: points.waist,
        to: points.shoulder,
        x: points.armhole.x + 45 + sa
      })
      macro('vd', {
        from: points.dartRight,
        to: points.dartTip,
        x: points.dartRight.x + 15
      })
      macro('vd', {
        from: points.bpBottom,
        to: points.bpTop,
        x: points.bpTop.x - 15 - sa
      })
      macro('vd', {
        from: points.bpTop,
        to: points.cbNeck,
        x: points.bpTop.x - 15 - sa
      })
      macro('vd', {
        from: points.bpBottom,
        to: points.neck,
        x: points.bpTop.x - 30 - sa
      })
      macro('vd', {
        from: points.bpStart,
        to: points.bpTriangleTip,
        x: points.bpTriangleEdge.x + 15
      })
      macro('hd', {
        from: points.bpStart,
        to: points.bpTriangleEdge,
        y: points.bpTriangleEdge.y + 15
      })
      macro('hd', {
        from: points.cbNeck,
        to: points.neck,
        y: points.neck.y - 15 - sa
      })
      macro('hd', {
        from: points.cbNeck,
        to: points.armholePitch,
        y: points.neck.y - 30 - sa
      })
      macro('hd', {
        from: points.cbNeck,
        to: points.shoulder,
        y: points.neck.y - 45 - sa
      })
      macro('hd', {
        from: points.cbNeck,
        to: points.armhole,
        y: points.neck.y - 60 - sa
      })
    }
  }

  return part
}
