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
    brimSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
    // absoluteOptions,
  }) => {
    //measures
    // void store.setIfUnset('headCircumference', measurements.head + absoluteOptions.headEase)
    void store.setIfUnset('headCircumference', measurements.head + 635 * options.headEase)
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
      points.ocLeft = points.origin.shift(0, radius)
      points.ocRight = points.ocLeft.rotate(angle, points.origin)
      points.ocCp1 = points.ocLeft
        .shiftTowards(points.origin, cpDistance)
        .rotate(-90, points.ocLeft)
      points.ocCp2 = points.ocRight
        .shiftTowards(points.origin, cpDistance)
        .rotate(90, points.ocRight)
      points.icLeft = points.ocLeft.shiftTowards(points.origin, crownLength)
      points.icRight = points.ocRight.shiftTowards(points.origin, crownLength)
      points.icCp1 = utils.beamsIntersect(
        points.icRight,
        points.origin.rotate(90, points.icRight),
        points.ocCp2,
        points.origin
      )
      points.icCp2 = utils.beamsIntersect(
        points.icLeft,
        points.origin.rotate(-90, points.icLeft),
        points.ocCp1,
        points.origin
      )
    } else {
      points.ocLeft = points.origin.shift(0, crownLength)
      points.ocRight = points.ocLeft.shift(90, headCircumference / options.crownSideNumber)
      points.ocCp1 = points.ocLeft.shiftFractionTowards(points.ocRight, 0.25)
      points.ocCp2 = points.ocRight.shiftFractionTowards(points.ocLeft, 0.25)
      points.icLeft = points.origin
      points.icRight = new Point(points.icLeft.x, points.ocRight.y)
      points.icCp1 = new Point(points.icRight.x, points.ocCp2.y)
      points.icCp2 = new Point(points.icRight.x, points.ocCp1.y)
    }

    //paths
    paths.hemBase = new Path()
      .move(points.ocLeft)
      .curve(points.ocCp1, points.ocCp2, points.ocRight)
      .hide()

    paths.saBase = new Path()
      .move(points.ocRight)
      .line(points.icRight)
      .curve(points.icCp1, points.icCp2, points.icLeft)
      .line(points.ocLeft)
      .hide()

    paths.seam = paths.hemBase.join(paths.saBase).close()

    //stores
    store.set('headCircumference', headCircumference)
    store.set('headRadius', headRadius)
    store.set('crownTopRadius', crownTopRadius)

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
              snippet: 'snap-socket',
              on: ['snap0', 'snap2'],
            })
          }
          //vents 1
          if (options.vents) {
            points.vent0 = paths.vent.shiftFractionAlong(0.25 - options.ventsH)
            points.vent1 = paths.vent.shiftFractionAlong(0.25 + options.ventsH)
            points.vent2 = paths.vent.shiftFractionAlong(0.75 - options.ventsH)
            points.vent3 = paths.vent.shiftFractionAlong(0.75 + options.ventsH)
            for (let i = 0; i < 4; i++) {
              snippets['vent' + i] = new Snippet('buttonhole', points['vent' + i]).attr(
                'data-rotate',
                360 - angle * ((i + 1) / 4)
              )
            }
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
            points.snap0 = points.ocLeft.shiftFractionTowards(points.icLeft, options.snapStuds)
            points.snap1 = points.ocRight.shiftFractionTowards(points.icRight, options.snapStuds)
            macro('sprinkle', {
              snippet: 'snap-stud',
              on: ['snap0', 'snap1'],
            })
          }
          //vent 2
          if (options.vents) {
            points.vent0 = paths.vent.shiftFractionAlong(options.ventsH * options.crownSideNumber)
            points.vent1 = paths.vent.shiftFractionAlong(
              1 - options.ventsH * options.crownSideNumber
            )
            for (let i = 0; i < 2; i++) {
              snippets['vent' + i] = new Snippet('buttonhole', points['vent' + i]).attr(
                'data-rotate',
                180 - points.origin.angle(points['vent' + i])
              )
            }
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
            points.vent0 = paths.vent.shiftFractionAlong(
              1 / 4 - options.ventsH * options.crownSideNumber
            )
            points.vent1 = paths.vent.shiftFractionAlong(
              1 / 4 + options.ventsH * options.crownSideNumber
            )
            for (let i = 0; i < 2; i++) {
              snippets['vent' + i] = new Snippet('buttonhole', points['vent' + i]).attr(
                'data-rotate',
                180 - points.origin.angle(points['vent' + i])
              )
            }
          }
          break
        case 4:
          if (options.snaps) {
            points.snap = points.ocLeft.shiftFractionTowards(points.icLeft, options.snapStuds)
            snippets.snap = new Snippet('snap-stud', points.snap)
          }
          if (options.vents) {
            points.vent = paths.vent.shiftFractionAlong(options.ventsH * options.crownSideNumber)
            snippets.vent = new Snippet('buttonhole', points.vent).attr(
              'data-rotate',
              180 - points.origin.angle(points.vent)
            )
          }
      }
      //title
      points.title = paths.hemBase
        .shiftFractionAlong(0.25)
        .shift(angle / 4 + 189, crownLength * 0.75)
      macro('title', {
        at: points.title,
        nr: 2,
        title: 'Crown (Side)',
        scale: 1 / 3,
        rotation: 360 - angle / 4,
      })
      if (sa) {
        paths.sa = paths.hemBase
          .offset(sa * options.brimSaWidth * 100)
          .join(paths.saBase.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
