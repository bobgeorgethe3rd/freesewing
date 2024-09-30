import { belt } from './belt.mjs'

export const cummerbund = {
  name: 'shannon.cummerbund',
  after: belt,
  options: {
    //Style
    cummerbund: { bool: true, menu: 'style' },
    cummerbundStyle: { dflt: 'curved', list: ['curved', 'straight'], menu: 'style' },
    cummerbundLengthBonus: { pct: 0, min: -50, max: 50, menu: 'style' },
    cummerbundWidth: { pct: 44, min: 0, max: 50, menu: 'style' },
    cummerbundCurve: { pct: (2 / 3) * 100, min: 0, max: 100, menu: 'style' },
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
    //render
    if (!options.belt || !options.cummerbund) {
      part.hide()
      return part
    }
    //measures
    const cummerbundLength = store.get('cummerbundLength') * (1 + options.cummerbundLengthBonus)
    const beltWidth = store.get('beltWidth')
    const cummerbundWidth = beltWidth * options.cummerbundWidth
    //let's begin
    points.topMidAnchor = new Point(0, 0)
    points.bottomMidAnchor = points.topMidAnchor.shift(-90, beltWidth)
    points.topLeft = points.topMidAnchor.shift(180, cummerbundLength)
    points.bottomLeft = new Point(points.topLeft.x, points.bottomMidAnchor.y)
    points.topRight = points.topLeft.flipX(points.topMidAnchor)
    points.bottomRight = points.bottomLeft.flipX(points.topMidAnchor)
    points.topMid = points.topMidAnchor.shift(90, cummerbundWidth)
    points.bottomMid = points.bottomMidAnchor.shift(-90, cummerbundWidth)

    points.topMidCp2 = new Point(points.topLeft.x * options.cummerbundCurve, points.topMid.y)
    points.bottomMidCp1 = new Point(points.topMidCp2.x, points.bottomMid.y)
    points.bottomMidCp2 = points.bottomMidCp1.flipX(points.bottomMid)
    points.topMidCp1 = points.topMidCp2.flipX(points.topMid)

    const drawSeam = () => {
      if (options.cummerbundStyle == 'curved') {
        return new Path()
          .move(points.topMid)
          .curve_(points.topMidCp2, points.topLeft)
          .line(points.bottomLeft)
          ._curve(points.bottomMidCp1, points.bottomMid)
          .curve_(points.bottomMidCp2, points.bottomRight)
          .line(points.topRight)
          ._curve(points.topMidCp1, points.topMid)
      } else {
        return new Path()
          .move(points.topMid)
          .line(points.topMidCp2)
          .line(points.topLeft)
          .line(points.bottomLeft)
          .line(points.bottomMidCp1)
          .line(points.bottomMid)
          .line(points.bottomMidCp2)
          .line(points.bottomRight)
          .line(points.topRight)
          .line(points.topMidCp1)
          .line(points.topMid)
      }
    }

    paths.seam = drawSeam()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid
      points.grainlineTo = points.bottomMid
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
      })
      //title
      points.title = new Point(points.topRight.x / 4, points.bottomRight.y / 2)
      macro('title', {
        nr: 7,
        title: 'Cummerbund',
        at: points.title,
        cutNr: 2,
        scale: 0.25,
      })
      if (sa) {
        points.saTopMid = points.topMid.shift(90, sa)
        if (options.cummerbundCurve == 1 && options.cummerbundStyle == 'straight') {
          points.saTopLeft = points.topMidCp2.translate(-sa, -sa)
        } else {
          if (options.cummerbundCurve == 1) {
            points.saTopLeft = points.topLeft.shift(180, sa)
          } else {
            points.saTopLeft = utils.beamIntersectsX(
              points.topMidCp2.shiftTowards(points.topLeft, sa).rotate(-90, points.topMidCp2),
              points.topLeft.shiftTowards(points.topMidCp2, sa).rotate(90, points.topLeft),
              points.topLeft.x - sa
            )
          }
        }

        points.flipAnchor = points.topLeft.shiftFractionTowards(points.bottomLeft, 0.5)
        points.saBottomMid = points.saTopMid.flipY(points.flipAnchor)
        points.saBottomLeft = points.saTopLeft.flipY(points.flipAnchor)

        points.saTopMidCp2 = utils.beamIntersectsY(
          points.topMidCp2.shiftTowards(points.topLeft, sa).rotate(-90, points.topMidCp2),
          points.topLeft.shiftTowards(points.topMidCp2, sa).rotate(90, points.topLeft),
          points.topMid.y - sa
        )
        points.saBottomMidCp1 = points.saTopMidCp2.flipY(points.flipAnchor)

        const drawSa = () => {
          if (options.cummerbundStyle == 'curved') {
            return new Path()
              .move(points.topMid)
              .curve_(points.topMidCp2, points.topLeft)
              .offset(sa)
              .line(points.saTopLeft)
              .line(points.saBottomLeft)
              .join(
                new Path()
                  .move(points.bottomLeft)
                  ._curve(points.bottomMidCp1, points.bottomMid)
                  .offset(sa)
              )
          } else {
            return new Path()
              .move(points.saTopMid)
              .line(points.saTopMidCp2)
              .line(points.saTopLeft)
              .line(points.saBottomLeft)
              .line(points.saBottomMidCp1)
              .line(points.saBottomMid)
          }
        }

        paths.sa = drawSa().hide()

        macro('mirror', {
          mirror: [points.topMid, points.bottomMid],
          paths: ['sa'],
          prefix: 'm',
        })

        paths.sa = paths.sa.join(paths.mSa.reverse()).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
