import { pctBasedOn } from '@freesewing/core'
import { crown } from './crown.mjs'

export const brim = {
  name: 'merlin.brim',
  after: crown,
  options: {
    //Style
    brimNumber: { count: 1, min: 1, max: 6, menu: 'style' },
    brimWidth: {
      pct: 26.2,
      min: 15,
      max: 200,
      /* snap: 6.35, ...pctBasedOn('head'), */ menu: 'style',
    },
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
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    const headCircumference = store.get('headCircumference')
    const innerRadius = headCircumference * (3 / 14)
    const brimWidth = headCircumference * options.brimWidth
    const brimAngle = utils.rad2deg(headCircumference / innerRadius) * (1 / options.brimNumber)
    const brimInnerCpDistance = (4 / 3) * innerRadius * Math.tan(utils.deg2rad(brimAngle / 16))
    const brimOuterCpDistance =
      (4 / 3) * (innerRadius + brimWidth) * Math.tan(utils.deg2rad(brimAngle / 16))

    //let's begin
    points.origin = new Point(0, 0)

    //inner
    points.innerStart = points.origin.shift(-90, innerRadius)
    points.innerEnd = points.innerStart.rotate(-brimAngle, points.origin)
    for (let i = 1; i <= 3; i++) {
      points['innerQ' + i] = points.innerStart.rotate(brimAngle * -(i / 4), points.origin)
    }

    //inner control points
    points.innerStartCp2 = points.innerStart
      .shiftTowards(points.origin, brimInnerCpDistance)
      .rotate(90, points.innerStart)

    points.innerQ1Cp1 = points.innerQ1
      .shiftTowards(points.origin, brimInnerCpDistance)
      .rotate(-90, points.innerQ1)
    points.innerQ1Cp2 = points.innerQ1
      .shiftTowards(points.origin, brimInnerCpDistance)
      .rotate(90, points.innerQ1)

    points.innerQ2Cp1 = points.innerQ2
      .shiftTowards(points.origin, brimInnerCpDistance)
      .rotate(-90, points.innerQ2)
    points.innerQ2Cp2 = points.innerQ2
      .shiftTowards(points.origin, brimInnerCpDistance)
      .rotate(90, points.innerQ2)

    points.innerQ3Cp1 = points.innerQ3
      .shiftTowards(points.origin, brimInnerCpDistance)
      .rotate(-90, points.innerQ3)
    points.innerQ3Cp2 = points.innerQ3
      .shiftTowards(points.origin, brimInnerCpDistance)
      .rotate(90, points.innerQ3)

    points.innerEndCp1 = points.innerEnd
      .shiftTowards(points.origin, brimInnerCpDistance)
      .rotate(-90, points.innerEnd)

    //outer
    points.outerStart = points.origin.shiftOutwards(points.innerEnd, brimWidth)
    points.outerEnd = points.outerStart.rotate(brimAngle, points.origin)
    for (let i = 1; i <= 3; i++) {
      points['outerQ' + i] = points.outerStart.rotate(brimAngle * (i / 4), points.origin)
    }

    //outer control points
    points.outerStartCp2 = points.outerStart
      .shiftTowards(points.origin, brimOuterCpDistance)
      .rotate(-90, points.outerStart)

    points.outerQ1Cp1 = points.outerQ1
      .shiftTowards(points.origin, brimOuterCpDistance)
      .rotate(90, points.outerQ1)
    points.outerQ1Cp2 = points.outerQ1
      .shiftTowards(points.origin, brimOuterCpDistance)
      .rotate(-90, points.outerQ1)

    points.outerQ2Cp1 = points.outerQ2
      .shiftTowards(points.origin, brimOuterCpDistance)
      .rotate(90, points.outerQ2)
    points.outerQ2Cp2 = points.outerQ2
      .shiftTowards(points.origin, brimOuterCpDistance)
      .rotate(-90, points.outerQ2)

    points.outerQ3Cp1 = points.outerQ3
      .shiftTowards(points.origin, brimOuterCpDistance)
      .rotate(90, points.outerQ3)
    points.outerQ3Cp2 = points.outerQ3
      .shiftTowards(points.origin, brimOuterCpDistance)
      .rotate(-90, points.outerQ3)

    points.outerEndCp1 = points.outerEnd
      .shiftTowards(points.origin, brimOuterCpDistance)
      .rotate(90, points.outerEnd)

    //paths
    paths.hemBase = new Path()
      .move(points.innerStart)
      .curve(points.innerStartCp2, points.innerQ1Cp1, points.innerQ1)
      .curve(points.innerQ1Cp2, points.innerQ2Cp1, points.innerQ2)
      .curve(points.innerQ2Cp2, points.innerQ3Cp1, points.innerQ3)
      .curve(points.innerQ3Cp2, points.innerEndCp1, points.innerEnd)
      .hide()

    paths.saOuter = new Path()
      .move(points.outerStart)
      .curve(points.outerStartCp2, points.outerQ1Cp1, points.outerQ1)
      .curve(points.outerQ1Cp2, points.outerQ2Cp1, points.outerQ2)
      .curve(points.outerQ2Cp2, points.outerQ3Cp1, points.outerQ3)
      .curve(points.outerQ3Cp2, points.outerEndCp1, points.outerEnd)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.outerStart)
      .join(paths.saOuter)
      .line(points.innerStart)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.innerQ2.shiftFractionTowards(points.innerQ2Cp1, 0.75)
      points.grainlineFrom = points.grainlineTo.shift(
        points.innerQ2.angle(points.outerQ2),
        brimWidth
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //guide lines & notches
      for (let i = 1; i <= 3; i++) {
        paths['quarterGuide' + i] = new Path()
          .move(points['outerQ' + (-i + 4)])
          .line(points['innerQ' + i])
          .attr('class', 'mark')
          .attr('data-text', i / 4 + ' Guide Line')
          .attr('data-text-class', 'center')
        snippets['innerQ' + i] = new Snippet('bnotch', points['innerQ' + i])
        snippets['outerQ' + i] = new Snippet('notch', points['outerQ' + i])
      }
      //title
      points.title = points.innerQ1Cp1.shiftFractionTowards(points.outerQ3Cp2, 0.5)
      macro('title', {
        at: points.title,
        nr: 2,
        title: 'Brim',
        scale: 1 / 3,
      })

      if (sa) {
        const hemSa = sa * options.crownSaWidth * 100

        points.saInnerEnd = points.innerEnd
          .shift(points.outerStart.angle(points.innerEnd), hemSa)
          .shift(points.innerEndCp1.angle(points.innerEnd), sa)

        points.saOuterStart = points.outerStart
          .shift(points.innerEnd.angle(points.outerStart), sa)
          .shift(points.outerStartCp2.angle(points.outerStart), sa)

        points.saOuterEnd = points.outerEnd.translate(sa, sa)
        points.saInnerStart = points.innerStart.translate(sa, -hemSa)

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saInnerEnd)
          .line(points.saOuterStart)
          .line(paths.saOuter.offset(sa).start())
          .join(paths.saOuter.offset(sa))
          .line(points.saOuterEnd)
          .line(points.saInnerStart)
          .line(paths.hemBase.offset(hemSa).start())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
