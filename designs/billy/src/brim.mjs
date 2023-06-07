import { crownSide } from './crownSide.mjs'

export const brim = {
  name: 'billy.brim',
  after: crownSide,
  options: {
    //Style
    brimAngle: { count: 315, min: 270, max: 360, menu: 'style' },
    brimNumber: { count: 2, min: 1, max: 8, menu: 'style' },
    brimWidth: { pct: 66.7, min: 50, max: 200, menu: 'style' },
    stitchingGuides: { bool: true, menu: 'style' },
    stitchingNumber: { count: 6, min: 2, max: 10, menu: 'style' },
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
    // absoluteOptions,
    log,
  }) => {
    //measures
    // void store.setIfUnset('headCircumference', measurements.head + absoluteOptions.headEase)
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      'Head Ease has been set at ' + utils.units(635 * options.headEase)
    )
    void store.setIfUnset('headRadius', store.get('headCircumference') / 2 / Math.PI)
    const headCircumference = store.get('headCircumference')
    const angle = options.brimAngle / options.brimNumber
    const radius = headCircumference / utils.deg2rad(options.brimAngle)
    const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 16)
    const brimWidth = store.get('headRadius') * options.brimWidth
    //let's begin
    points.origin = new Point(0, 0)
    points.icEnd = points.origin.shift(0, radius)
    points.icQ2 = points.icEnd.rotate(angle / 4, points.origin)
    points.icMid = points.icEnd.rotate(angle / 2, points.origin)
    points.icQ1 = points.icEnd.rotate(angle * (3 / 4), points.origin)
    points.icStart = points.icEnd.rotate(angle, points.origin)
    points.icCp1 = points.icStart.shiftTowards(points.origin, cpDistance).rotate(90, points.icStart)
    points.icCp2 = points.icQ1.shiftTowards(points.origin, cpDistance).rotate(-90, points.icQ1)
    points.icCp3 = points.icCp2.rotate(180, points.icQ1)
    points.icCp4 = points.icMid.shiftTowards(points.origin, cpDistance).rotate(-90, points.icMid)
    points.icCp5 = points.icCp4.rotate(180, points.icMid)
    points.icCp6 = points.icQ2.shiftTowards(points.origin, cpDistance).rotate(-90, points.icQ2)
    points.icCp7 = points.icCp6.rotate(180, points.icQ2)
    points.icCp8 = points.icEnd.shiftTowards(points.origin, cpDistance).rotate(-90, points.icEnd)

    points.ocStart = points.origin.shiftOutwards(points.icEnd, brimWidth)
    points.ocQ1 = points.origin.shiftOutwards(points.icQ2, brimWidth)
    points.ocMid = points.origin.shiftOutwards(points.icMid, brimWidth)
    points.ocQ2 = points.origin.shiftOutwards(points.icQ1, brimWidth)
    points.ocEnd = points.origin.shiftOutwards(points.icStart, brimWidth)
    points.ocCp1 = utils.beamsIntersect(
      points.ocStart,
      points.origin.rotate(90, points.ocStart),
      points.origin,
      points.icCp8
    )

    points.ocCp2 = utils.beamsIntersect(
      points.ocQ1,
      points.origin.rotate(90, points.ocQ1),
      points.origin,
      points.icCp7
    )

    points.ocCp3 = points.ocCp2.rotate(180, points.ocQ1)

    points.ocCp4 = utils.beamsIntersect(
      points.ocMid,
      points.origin.rotate(90, points.ocMid),
      points.origin,
      points.icCp5
    )

    points.ocCp5 = points.ocCp4.rotate(180, points.ocMid)

    points.ocCp6 = utils.beamsIntersect(
      points.ocQ2,
      points.origin.rotate(90, points.ocQ2),
      points.origin,
      points.icCp3
    )

    points.ocCp7 = points.ocCp6.rotate(180, points.ocQ2)

    points.ocCp8 = utils.beamsIntersect(
      points.ocEnd,
      points.origin.rotate(90, points.ocEnd),
      points.origin,
      points.icCp1
    )
    //paths
    paths.hemBase = new Path()
      .move(points.icStart)
      .curve(points.icCp1, points.icCp2, points.icQ1)
      .curve(points.icCp3, points.icCp4, points.icMid)
      .curve(points.icCp5, points.icCp6, points.icQ2)
      .curve(points.icCp7, points.icCp8, points.icEnd)
      .hide()

    if (options.brimAngle == 360 && options.brimNumber == 1) {
      paths.hemBase.unhide()
    }

    const drawHem = () => {
      if (options.brimAngle == 360 && options.brimNumber == 1) {
        return new Path().move(points.ocEnd).line(points.ocStart)
      } else {
        return new Path()
          .move(points.ocEnd)
          .line(points.icStart)
          .join(paths.hemBase)
          .line(points.ocStart)
      }
    }

    paths.oc = new Path()
      .move(points.ocStart)
      .curve(points.ocCp1, points.ocCp2, points.ocQ1)
      .curve(points.ocCp3, points.ocCp4, points.ocMid)
      .curve(points.ocCp5, points.ocCp6, points.ocQ2)
      .curve(points.ocCp7, points.ocCp8, points.ocEnd)
      .hide()

    paths.seam = paths.oc.join(drawHem())

    if (complete) {
      //stitchlines
      if (options.stitchingGuides) {
        let j
        let k
        for (let i = 0; i < options.stitchingNumber; i++) {
          j = i + 1
          k = options.stitchingNumber + 1
          paths['stitch' + i] = paths.hemBase
            .offset(brimWidth * -(j / k))
            .attr('class', 'interfacing')
            .attr('data-text', 'Stitching Line')
            .attr('data-text-class', 'left')
        }
      }
      //grainline
      points.grainlineFrom = points.icMid
      points.grainlineTo = points.ocMid
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      switch (options.brimNumber) {
        case 1:
          macro('sprinkle', {
            snippet: 'bnotch',
            on: ['icQ1', 'icMid', 'icQ2'],
          })
          if (options.brimAngle == 360) {
            snippets.icStart = new Snippet('bnotch', points.icStart)
          }
          //snaps 1
          if (options.snaps) {
            points.snap0 = points.ocQ2.shiftFractionTowards(points.icQ1, options.snapSockets)
            points.snap1 = points.ocQ1.shiftFractionTowards(points.icQ2, options.snapSockets)
            macro('sprinkle', {
              snippet: 'snap-socket',
              on: ['snap0', 'snap1'],
            })
          }
          break
        case 2:
          snippets.bnotch = new Snippet('bnotch', points.icMid)
          //snaps 2
          if (options.snaps) {
            points.snap0 = points.ocEnd.shiftFractionTowards(points.icStart, options.snapSockets)
            points.snap1 = points.ocStart.shiftFractionTowards(points.icEnd, options.snapSockets)
            macro('sprinkle', {
              snippet: 'snap-socket',
              on: ['snap0', 'snap1'],
            })
          }
          break
        case 3:
          snippets.bnotch = new Snippet('bnotch', points.icQ2)
          if (options.snaps) {
            points.snap = points.ocQ1.shiftFractionTowards(points.icQ2, options.snapSockets)
            snippets.snap = new Snippet('snap-socket', points.snap)
          }
          break
        case 4:
          if (options.snaps) {
            points.snap = points.ocStart.shiftFractionTowards(points.icEnd, options.snapSockets)
            snippets.snap = new Snippet('snap-socket', points.snap)
          }
      }
      //title
      points.title = paths.oc.shiftFractionAlong(0.25).shiftTowards(points.origin, brimWidth * 0.75)
      macro('title', {
        at: points.title,
        nr: 3,
        title: 'Brim',
        scale: 0.5 / options.brimNumber,
        rotation: 360 - points.origin.angle(points.icQ2),
      })

      if (options.brimAngle == 360 && options.brimNumber == 1) {
        points.cutoutFrom = points.origin
        points.cutoutTo = points.icMid.shiftFractionTowards(points.origin, 1 / 3)
        paths.cutoutGrainline = new Path()
          .move(points.cutoutFrom)
          .line(points.cutoutTo)
          .attr('class', 'note')
          .attr('data-text', 'Grainline')
          .attr('data-text-class', 'fill-note center')
          .attr('marker-start', 'url(#grainlineFrom)')
          .attr('marker-end', 'url(#grainlineTo)')

        points.cutoutTitle = points.origin.shiftFractionTowards(points.icQ2, 0.1)
        macro('title', {
          at: points.cutoutTitle,
          nr: 'Cut-out',
          title: 'Brim (Cut-out) PLEASE KEEP!!!',
          scale: 0.25,
          rotation: 360 - points.origin.angle(points.icQ2),
          prefix: 'cutout',
        })
      }

      if (sa) {
        paths.hemSa = paths.hemBase
          .offset(sa * options.brimSaWidth * 100)
          .attr('class', 'fabric sa')
          .hide()
        if (options.brimAngle == 360 && options.brimNumber == 1) {
          paths.hemSa.unhide().close()
          paths.sa = paths.oc.offset(sa).attr('class', 'fabric sa').close()
        } else {
          paths.sa = paths.oc
            .line(points.icStart)
            .offset(sa)
            .join(paths.hemSa)
            .join(new Path().move(points.icEnd).line(points.ocStart).offset(sa))
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
