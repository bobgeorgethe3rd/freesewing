import { pctBasedOn } from '@freesewing/core'
import { collarBase } from '@freesewing/shirtcollar'
import { back } from './back.mjs'

export const collar = {
  name: 'shannon.collar',
  after: back,
  options: {
    //Imported
    ...collarBase.options,
    //Collar
    collarCurve: { pct: 100, min: 0, max: 100, menu: 'collar' },
    collarBandWidth: {
      pct: 7.7,
      min: 5,
      max: 10,
      snap: 5,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'collar',
    }, //altered for Shannon
  },
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
      absoluteOptions,
      snippets,
      Snippet,
    } = sh
    //draft
    collarBase.draft(sh)
    //let's begin
    points.topCorner = utils.beamsIntersect(
      points.bottom,
      points.top.rotate(store.get('collarAngle'), points.bottom),
      points.topCp2,
      points.top
    )
    points.fTopCorner = points.topCorner.flipX(points.topMid)
    points.topCurveEnd = points.topCorner.shiftTowards(
      points.topCp2,
      points.bottom.dist(points.top) * options.collarCurve
    )
    points.fTopCurveEnd = points.topCurveEnd.flipX(points.topMid)

    //paths
    paths.saBottom = new Path()
      .move(points.fBottom)
      .curve(points.fBottomCp1, points.fBottomMidCp2, points.bottomMid)
      .curve(points.bottomMidCp2, points.bottomCp1, points.bottom)
      .hide()

    paths.saRight = new Path()
      .move(points.bottom)
      ._curve(points.topCorner, points.topCurveEnd)
      .hide()

    paths.saTop = new Path()
      .move(points.topCurveEnd)
      .curve(points.topCp2, points.topMidCp1, points.topMid)
      .curve(points.fTopMidCp1, points.fTopCp2, points.fTopCurveEnd)
      .hide()

    paths.saLeft = new Path()
      .move(points.fTopCurveEnd)
      .curve_(points.fTopCorner, points.fBottom)
      .hide()

    paths.seam = paths.saBottom
      .clone()
      .join(paths.saRight)
      .join(paths.saTop)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid.shiftFractionTowards(points.topMidCp1, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bottomNotch', 'fBottomNotch'],
      })
      //title
      points.title = points.bottomMid
        .shiftFractionTowards(points.fBottomMidCp2, 0.5)
        .shift(90, absoluteOptions.collarBandWidth / 2)
      macro('title', {
        at: points.title,
        nr: '5',
        title: 'Collar',
        cutNr: 2,
        scale: 0.2,
      })
      //cb
      paths.cb = new Path()
        .move(points.topMid)
        .line(points.bottomMid)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Back')
        .attr('data-text-class', 'center')
      if (sa) {
        points.saBottom = utils.beamsIntersect(
          points.bottomCp1.shiftTowards(points.bottom, sa).rotate(-90, points.bottomCp1),
          points.bottom.shiftTowards(points.bottomCp1, sa).rotate(90, points.bottom),
          points.bottom.shiftTowards(points.topCorner, sa).rotate(-90, points.bottom),
          points.topCorner.shiftTowards(points.bottom, sa).rotate(90, points.topCorner)
        )
        points.saTopCorner = utils.beamsIntersect(
          points.bottom.shiftTowards(points.topCorner, sa).rotate(-90, points.bottom),
          points.topCorner.shiftTowards(points.bottom, sa).rotate(90, points.topCorner),
          points.topCorner.shiftTowards(points.topCp2, sa).rotate(-90, points.topCorner),
          points.topCp2.shiftTowards(points.topCorner, sa).rotate(90, points.topCp2)
        )
        points.saFBottom = points.saBottom.flipX(points.topMid)
        points.saFTopCorner = points.saTopCorner.flipX(points.topMid)

        const drawSaBase = () => {
          if (options.collarCurve == 0) {
            return paths.saBottom
              .offset(sa)
              .line(points.saBottom)
              .join(paths.saRight.offset(sa))
              .line(points.saTopCorner)
              .join(paths.saTop.offset(sa))
              .line(points.saFTopCorner)
          } else {
            return paths.saBottom
              .offset(sa)
              .line(points.saBottom)
              .join(paths.saRight.offset(sa))
              .join(paths.saTop.offset(sa))
          }
        }

        paths.sa = drawSaBase()
          .join(paths.saLeft.offset(sa))
          .line(points.saFBottom)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
