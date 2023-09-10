import { pctBasedOn } from '@freesewing/core'
import { crown } from './crown.mjs'

export const brim = {
  name: 'merlin.brim',
  after: crown,
  options: {},
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
    // const outerRadius = headCircumference * options.brimWidth
    const brimAngle = utils.rad2deg(headCircumference / innerRadius)
    const brimInnerCpDistance = (4 / 3) * innerRadius * Math.tan(utils.deg2rad(brimAngle / 16))

    //let's begin
    points.origin = new Point(0, 0)

    //inner
    points.innerStart = points.origin.shift(-90, innerRadius)
    points.innerEnd = points.innerStart.rotate(-brimAngle, points.origin)
    for (let i = 1; i <= 3; i++) {
      points['innerQ' + i] = points.innerStart.rotate(brimAngle * -(i / 4), points.origin)
    }

    //inner control points
    points.innerLeftCp2 = points.innerStart
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

    //Outer

    //paths
    paths.hemBase = new Path()
      .move(points.innerStart)
      .curve(points.innerLeftCp2, points.innerQ1Cp1, points.innerQ1)
      .curve(points.innerQ1Cp2, points.innerQ2Cp1, points.innerQ2)
      .curve(points.innerQ2Cp2, points.innerQ3Cp1, points.innerQ3)
      .curve(points.innerQ3Cp2, points.innerEndCp1, points.innerEnd)

    return part
  },
}
