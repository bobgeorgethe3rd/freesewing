import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const crownSide = {
  name: 'billy.crownSide',
  options: {
    //Fit
    // headEase: { pct: 3.1, min: 0, max: 9.4, snap: 6.35, ...pctBasedOn('head'), menu: 'fit' },
    headEase: { pct: 3, min: 0, max: 9, menu: 'fit' },
    headReduction: { pct: 15.8, min: 0, max: 20, menu: 'fit' },
    crownLengthBonus: { pct: 0, min: -30, max: 30, menu: 'fit' },
    //Style
    crownSideNumber: { count: 2, min: 1, max: 8, menu: 'style' },
    snaps: { bool: false, menu: 'style.snaps' },
    snapStuds: { pct: 40, min: 30, max: 60, menu: 'style.snaps' },
    vents: { bool: false, menu: 'style.vents' },
    ventsV: { pct: 70, min: 50, max: 80, menu: 'style.vents' },
    ventsH: { pct: 6, min: 0, max: 10, menu: 'style.vents' },
    //Construction
    crownSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
    log,
    // absoluteOptions,
  }) => {
    //measures
    // void store.setIfUnset('headCircumference', measurements.head + absoluteOptions.headEase)
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    const headCircumference = store.get('headCircumference')
    const headRadius = headCircumference / 2 / Math.PI
    const crownTopCircumference = headCircumference * (1 - options.headReduction)
    const crownTopRadius = crownTopCircumference / 2 / Math.PI
    const crownLength = Math.sqrt(
      Math.pow(headRadius * (1 + options.crownLengthBonus), 2) +
        Math.pow(headRadius - crownTopRadius, 2)
    )
    const angleRads = (headCircumference - crownTopCircumference) / crownLength
    const radius = headCircumference / angleRads
    const angle = utils.rad2deg(angleRads) / options.crownSideNumber
    const cpDistance = (4 / 3) * radius * Math.tan(angleRads / options.crownSideNumber / 4)
    //let's begin
    points.origin = new Point(0, 0)

    if (options.headReduction > 0) {
      points.outerLeft = points.origin.shift(0, radius)
      points.outerRight = points.outerLeft.rotate(angle, points.origin)
      points.outerLeftCp2 = points.outerLeft
        .shiftTowards(points.origin, cpDistance)
        .rotate(-90, points.outerLeft)
      points.outerRightCp1 = points.outerRight
        .shiftTowards(points.origin, cpDistance)
        .rotate(90, points.outerRight)
      points.innerLeft = points.outerLeft.shiftTowards(points.origin, crownLength)
      points.innerRight = points.outerRight.shiftTowards(points.origin, crownLength)
      points.innerLeftCp2 = utils.beamsIntersect(
        points.innerRight,
        points.origin.rotate(90, points.innerRight),
        points.outerRightCp1,
        points.origin
      )
      points.innerRightCp1 = utils.beamsIntersect(
        points.innerLeft,
        points.origin.rotate(-90, points.innerLeft),
        points.outerLeftCp2,
        points.origin
      )
    } else {
      points.outerLeft = points.origin.shift(0, crownLength)
      points.outerRight = points.outerLeft.shift(90, headCircumference / options.crownSideNumber)
      points.outerLeftCp2 = points.outerLeft.shiftFractionTowards(points.outerRight, 0.25)
      points.outerRightCp1 = points.outerRight.shiftFractionTowards(points.outerLeft, 0.25)
      points.innerLeft = points.origin
      points.innerRight = new Point(points.innerLeft.x, points.outerRight.y)
      points.innerLeftCp2 = new Point(points.innerRight.x, points.outerRightCp1.y)
      points.innerRightCp1 = new Point(points.innerRight.x, points.outerLeftCp2.y)
    }

    //paths
    paths.hemBase = new Path()
      .move(points.outerLeft)
      .curve(points.outerLeftCp2, points.outerRightCp1, points.outerRight)
      .hide()

    paths.saBase = new Path()
      .move(points.innerRight)
      .curve(points.innerLeftCp2, points.innerRightCp1, points.innerLeft)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.innerRight)
      .join(paths.saBase)
      .line(points.outerLeft)
      .close()

    //stores
    store.set('headCircumference', headCircumference)
    store.set('headRadius', headRadius)
    store.set('crownTopRadius', crownTopRadius)
    store.set('crownLength', crownLength)
    store.set('radius', radius)
    store.set('angle', angle)

    if (complete) {
      //grainline
      points.grainlineTo = paths.hemBase.shiftFractionAlong(0.5)
      points.grainlineFrom = points.grainlineTo.shift(angle / 2 + 180, crownLength)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches, vents & snaps
      if (options.vents) {
        paths.vent = paths.hemBase.offset(crownLength * -options.ventsV).hide()
      }

      switch (options.crownSideNumber) {
        case 1:
          //notches 1
          let j
          for (let i = 0; i < 3; i++) {
            j = i + 1
            points['bnotch' + i] = paths.hemBase.shiftFractionAlong(j / 4)
            snippets['bnotch' + i] = new Snippet('bnotch', points['bnotch' + i])
            points['notch' + i] = points['bnotch' + i].shift(angle * (j / 4) + 180, crownLength)
            snippets['notch' + i] = new Snippet('notch', points['notch' + i])
          }
          //snaps 1
          if (options.snaps) {
            points.snap0 = points.bnotch0.shiftFractionTowards(points.notch0, options.snapStuds)
            points.snap2 = points.bnotch2.shiftFractionTowards(points.notch2, options.snapStuds)
            macro('sprinkle', {
              snippet: 'snap-souterket',
              on: ['snap0', 'snap2'],
            })
          }
          //vents 1
          if (options.vents) {
            points.vent0 = paths.vent
              .shiftFractionAlong(0.25 - options.ventsH)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
            points.vent1 = paths.vent
              .shiftFractionAlong(0.25 + options.ventsH)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
            points.vent2 = paths.vent
              .shiftFractionAlong(0.75 - options.ventsH)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
            points.vent3 = paths.vent
              .shiftFractionAlong(0.75 + options.ventsH)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
          }
          break
        case 2:
          //notch 2
          points.bnotch = paths.hemBase.shiftFractionAlong(0.5)
          points.notch = points.bnotch.shift(angle / 2 + 180, crownLength)
          snippets.notch = new Snippet('notch', points.notch)
          snippets.bnotch = new Snippet('bnotch', points.bnotch)
          //snap 2
          if (options.snaps) {
            points.snap0 = points.outerLeft.shiftFractionTowards(
              points.innerLeft,
              options.snapStuds
            )
            points.snap1 = points.outerRight.shiftFractionTowards(
              points.innerRight,
              options.snapStuds
            )
            macro('sprinkle', {
              snippet: 'snap-stud',
              on: ['snap0', 'snap1'],
            })
          }
          //vent 2
          if (options.vents) {
            points.vent0 = paths.vent
              .shiftFractionAlong(options.ventsH * options.crownSideNumber)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
            points.vent1 = paths.vent
              .shiftFractionAlong(1 - options.ventsH * options.crownSideNumber)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
          }
          break
        case 3:
          //notch 3
          points.bnotch = paths.hemBase.shiftFractionAlong(1 / 4)
          points.notch = points.bnotch.shift(angle / 4 + 180, crownLength)
          snippets.notch = new Snippet('notch', points.notch)
          snippets.bnotch = new Snippet('bnotch', points.bnotch)
          //snap 3
          if (options.snaps) {
            points.snap = points.bnotch.shiftFractionTowards(points.notch, options.snapStuds)
            snippets.snap = new Snippet('snap-stud', points.snap)
          }
          //vent
          if (options.vents) {
            points.vent0 = paths.vent
              .shiftFractionAlong(1 / 4 - options.ventsH * options.crownSideNumber)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
            points.vent1 = paths.vent
              .shiftFractionAlong(1 / 4 + options.ventsH * options.crownSideNumber)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
          }
          break
        case 4:
          if (options.snaps) {
            points.snap = points.outerLeft.shiftFractionTowards(points.innerLeft, options.snapStuds)
            snippets.snap = new Snippet('snap-stud', points.snap)
          }
          if (options.vents) {
            points.vent = paths.vent
              .shiftFractionAlong(options.ventsH * options.crownSideNumber)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
          }
      }
      //title
      points.title = paths.hemBase
        .shiftFractionAlong(0.25)
        .shift(angle / 4 + 180, crownLength * 0.6)
      macro('title', {
        at: points.title,
        nr: 2,
        title: 'Crown (Side)',
        cutNr: options.crownSideNumber,
        scale: 1 / 3,
        rotation: 360 - angle / 4,
      })
      if (sa) {
        const crownSa = sa * options.crownSaWidth * 100

        points.saOuterRight = points.outerRight
          .shift(points.outerRightCp1.angle(points.outerRight), sa)
          .shift(points.innerRight.angle(points.outerRight), crownSa)
        points.saInnerRight = points.innerRight
          .shift(points.innerLeftCp2.angle(points.innerRight), sa)
          .shift(points.outerRight.angle(points.innerRight), sa)

        points.saInnerLeft = points.innerLeft.translate(-sa, sa)
        points.saOuterLeft = points.outerLeft.translate(crownSa, sa)

        paths.sa = paths.hemBase
          .offset(crownSa)
          .line(points.saOuterRight)
          .line(points.saInnerRight)
          .line(paths.saBase.offset(sa).start())
          .join(paths.saBase.offset(sa))
          .line(points.saInnerLeft)
          .line(points.saOuterLeft)
          .line(paths.hemBase.offset(crownSa).start())
          .close()
          .attr('class', 'fabrinner sa')
      }
    }

    return part
  },
}
