import { crownTop } from './crownTop.mjs'

export const crownSide = {
  name: 'playtest.crownSide',
  after: crownTop,
  options: {
    //Style
    crownSideNumber: { count: 2, min: 1, max: 8, menu: 'style' },
    //Construction
    crownSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    utils,
    snippets,
    Snippet,
  }) => {
    //measures
    const headCircumference = store.get('headCircumference')
    const crownSideWidth = store.get('crownCircumference') * 0.25 - store.get('crownTopRadius')
    const crownTopCircumference = store.get('crownTopCircumference')

    const angleRads = (headCircumference - crownTopCircumference) / crownSideWidth
    const angleDeg = utils.rad2deg(angleRads) * (1 / options.crownSideNumber)
    const radius = headCircumference / angleRads

    const bottomCpDist =
      (4 / 3) * radius * Math.tan((angleRads / 8) * (1 / options.crownSideNumber))
    const topCpDist =
      (4 / 3) *
      (radius - crownSideWidth) *
      Math.tan((angleRads / 8) * (1 / options.crownSideNumber))
    const width = crownTopCircumference > headCircumference ? crownSideWidth * -1 : crownSideWidth

    //let's begin
    points.origin = new Point(0, 0)
    points.bottomLeft = points.origin.shift(0, radius)
    points.bottomMid = points.bottomLeft.rotate(angleDeg * 0.5, points.origin)
    points.bottomRight = points.bottomMid.rotate(angleDeg * 0.5, points.origin)
    points.topLeft = points.bottomLeft.shiftTowards(points.origin, width)
    points.topMid = points.bottomMid.shiftTowards(points.origin, width)
    points.topRight = points.bottomRight.shiftTowards(points.origin, width)
    points.bottomLeftCp2 = points.bottomLeft.shift(90, bottomCpDist)
    points.bottomMidCp1 = points.bottomMid.shift(
      points.bottomMid.angle(points.topMid) + 90,
      bottomCpDist
    )
    points.bottomMidCp2 = points.bottomMid.shift(
      points.bottomMid.angle(points.topMid) - 90,
      bottomCpDist
    )
    points.bottomRightCp1 = points.bottomRight.shift(
      points.bottomRight.angle(points.topRight) + 90,
      bottomCpDist
    )
    points.topRightCp2 = points.topRight.shift(
      points.topRight.angle(points.bottomRight) - 90,
      topCpDist
    )
    points.topMidCp1 = points.topMid.shift(points.topMid.angle(points.bottomMid) + 90, topCpDist)
    points.topMidCp2 = points.topMid.shift(points.topMid.angle(points.bottomMid) - 90, topCpDist)
    points.topLeftCp1 = points.topLeft.shift(
      points.topLeft.angle(points.bottomLeft) + 90,
      topCpDist
    )
    //paths
    paths.hemBase = new Path()
      .move(points.bottomLeft)
      .curve(points.bottomLeftCp2, points.bottomMidCp1, points.bottomMid)
      .curve(points.bottomMidCp2, points.bottomRightCp1, points.bottomRight)
      .hide()

    paths.saTop = new Path()
      .move(points.topRight)
      .curve(points.topRightCp2, points.topMidCp1, points.topMid)
      .curve(points.topMidCp2, points.topLeftCp1, points.topLeft)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.topRight)
      .join(paths.saTop)
      .line(points.bottomLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid
      points.grainlineTo = points.bottomMid
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      switch (options.crownSideNumber) {
        case 1:
          //notches 1
          let j
          for (let i = 0; i < 3; i++) {
            j = i + 1
            points['bnotch' + i] = paths.hemBase.shiftFractionAlong(j / 4)
            snippets['bnotch' + i] = new Snippet('bnotch', points['bnotch' + i])
            points['notch' + i] = points['bnotch' + i].shift(
              angleDeg * (j / 4) + 180,
              crownSideWidth
            )
            snippets['notch' + i] = new Snippet('notch', points['notch' + i])
          }
          break
        case 2:
          //notch 2
          points.bnotch = paths.hemBase.shiftFractionAlong(0.5)
          points.notch = points.bnotch.shift(angleDeg / 2 + 180, crownSideWidth)
          snippets.notch = new Snippet('notch', points.notch)
          snippets.bnotch = new Snippet('bnotch', points.bnotch)
          break
        case 3:
          //notch 3
          points.bnotch = paths.hemBase.shiftFractionAlong(1 / 4)
          points.notch = points.bnotch.shift(angleDeg / 4 + 180, crownSideWidth)
          snippets.notch = new Snippet('notch', points.notch)
          snippets.bnotch = new Snippet('bnotch', points.bnotch)
      }
      //title
      points.title = paths.hemBase
        .shiftFractionAlong(0.25)
        .shift(angleDeg / 4 + 180, crownSideWidth * 0.6)
      macro('title', {
        at: points.title,
        nr: 2,
        title: 'Crown (Side)',
        cutNr: options.crownSideNumber,
        scale: 1 / 3,
        rotation: 360 - angleDeg / 4,
      })
      if (sa) {
        const crownSa = sa * options.crownSaWidth * 100

        points.saBottomRight = points.bottomRight
          .shift(points.bottomRightCp1.angle(points.bottomRight), sa)
          .shift(points.topRight.angle(points.bottomRight), crownSa)
        points.saTopRight = points.topRight
          .shift(points.topRightCp2.angle(points.topRight), sa)
          .shift(points.bottomRight.angle(points.topRight), sa)

        points.saTopLeft = points.topLeft.translate(-sa, sa)
        points.saBottomLeft = points.bottomLeft.translate(crownSa, sa)

        paths.sa = paths.hemBase
          .offset(crownSa)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(paths.saTop.offset(sa).start())
          .join(paths.saTop.offset(sa))
          .line(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(paths.hemBase.offset(crownSa).start())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
