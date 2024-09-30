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
    const brimWidth = store.get('headRadius') * options.brimWidth
    const innerCpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 16)
    const outerCpDistance = (4 / 3) * (radius + brimWidth) * Math.tan(utils.deg2rad(angle) / 16)
    //let's begin
    points.origin = new Point(0, 0)
    points.innerEnd = points.origin.shift(0, radius)
    points.innerQ2 = points.innerEnd.rotate(angle / 4, points.origin)
    points.innerMid = points.innerEnd.rotate(angle / 2, points.origin)
    points.innerQ1 = points.innerEnd.rotate(angle * (3 / 4), points.origin)
    points.innerStart = points.innerEnd.rotate(angle, points.origin)
    points.innerStartCp2 = points.innerStart
      .shiftTowards(points.origin, innerCpDistance)
      .rotate(90, points.innerStart)
    points.innerQ1Cp1 = points.innerQ1
      .shiftTowards(points.origin, innerCpDistance)
      .rotate(-90, points.innerQ1)
    points.innerQ1Cp2 = points.innerQ1Cp1.rotate(180, points.innerQ1)
    points.innerMidCp1 = points.innerMid
      .shiftTowards(points.origin, innerCpDistance)
      .rotate(-90, points.innerMid)
    points.innerMidCp2 = points.innerMidCp1.rotate(180, points.innerMid)
    points.innerQ2Cp1 = points.innerQ2
      .shiftTowards(points.origin, innerCpDistance)
      .rotate(-90, points.innerQ2)
    points.innerQ2Cp2 = points.innerQ2Cp1.rotate(180, points.innerQ2)
    points.innerEndCp1 = points.innerEnd
      .shiftTowards(points.origin, innerCpDistance)
      .rotate(-90, points.innerEnd)

    points.outerStart = points.origin.shiftOutwards(points.innerEnd, brimWidth)
    points.outerQ1 = points.origin.shiftOutwards(points.innerQ2, brimWidth)
    points.outerMid = points.origin.shiftOutwards(points.innerMid, brimWidth)
    points.outerQ2 = points.origin.shiftOutwards(points.innerQ1, brimWidth)
    points.outerEnd = points.origin.shiftOutwards(points.innerStart, brimWidth)
    points.outerStartCp2 = points.outerStart
      .shiftTowards(points.origin, outerCpDistance)
      .rotate(-90, points.outerStart)
    points.outerQ1Cp1 = points.outerQ1
      .shiftTowards(points.origin, outerCpDistance)
      .rotate(90, points.outerQ1)
    points.outerQ1Cp2 = points.outerQ1Cp1.rotate(180, points.outerQ1)
    points.outerMidCp1 = points.outerMid
      .shiftTowards(points.origin, outerCpDistance)
      .rotate(90, points.outerMid)
    points.outerMidCp2 = points.outerMidCp1.rotate(180, points.outerMid)
    points.outerQ2Cp1 = points.outerQ2
      .shiftTowards(points.origin, outerCpDistance)
      .rotate(90, points.outerQ2)
    points.outerQ2Cp2 = points.outerQ2Cp1.rotate(180, points.outerQ2)
    points.outerEndCp1 = points.outerEnd
      .shiftTowards(points.origin, outerCpDistance)
      .rotate(90, points.outerEnd)
    //paths
    paths.hemBase = new Path()
      .move(points.innerStart)
      .curve(points.innerStartCp2, points.innerQ1Cp1, points.innerQ1)
      .curve(points.innerQ1Cp2, points.innerMidCp1, points.innerMid)
      .curve(points.innerMidCp2, points.innerQ2Cp1, points.innerQ2)
      .curve(points.innerQ2Cp2, points.innerEndCp1, points.innerEnd)
      .hide()

    if (options.brimAngle == 360 && options.brimNumber == 1) {
      paths.hemBase.unhide()
    }

    const drawHem = () => {
      if (options.brimAngle == 360 && options.brimNumber == 1) {
        return new Path().move(points.outerEnd).line(points.outerStart)
      } else {
        return new Path()
          .move(points.outerEnd)
          .line(points.innerStart)
          .join(paths.hemBase)
          .line(points.outerStart)
      }
    }

    paths.saOuter = new Path()
      .move(points.outerStart)
      .curve(points.outerStartCp2, points.outerQ1Cp1, points.outerQ1)
      .curve(points.outerQ1Cp2, points.outerMidCp1, points.outerMid)
      .curve(points.outerMidCp2, points.outerQ2Cp1, points.outerQ2)
      .curve(points.outerQ2Cp2, points.outerEndCp1, points.outerEnd)
      .hide()

    paths.seam = paths.saOuter.join(drawHem())

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
      points.grainlineFrom = points.innerMid
      points.grainlineTo = points.outerMid
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      switch (options.brimNumber) {
        case 1:
          macro('sprinkle', {
            snippet: 'bnotch',
            on: ['innerQ1', 'innerMid', 'innerQ2'],
          })
          if (options.brimAngle == 360) {
            snippets.innerStart = new Snippet('bnotch', points.innerStart)
          }
          //snaps 1
          if (options.snaps) {
            points.snap0 = points.outerQ2.shiftFractionTowards(
              points.innerQ1,
              options.snapSouterkets
            )
            points.snap1 = points.outerQ1.shiftFractionTowards(
              points.innerQ2,
              options.snapSouterkets
            )
            macro('sprinkle', {
              snippet: 'snap-souterket',
              on: ['snap0', 'snap1'],
            })
          }
          break
        case 2:
          snippets.bnotch = new Snippet('bnotch', points.innerMid)
          //snaps 2
          if (options.snaps) {
            points.snap0 = points.outerEnd.shiftFractionTowards(
              points.innerStart,
              options.snapSouterkets
            )
            points.snap1 = points.outerStart.shiftFractionTowards(
              points.innerEnd,
              options.snapSouterkets
            )
            macro('sprinkle', {
              snippet: 'snap-souterket',
              on: ['snap0', 'snap1'],
            })
          }
          break
        case 3:
          snippets.bnotch = new Snippet('bnotch', points.innerQ2)
          if (options.snaps) {
            points.snap = points.outerQ1.shiftFractionTowards(
              points.innerQ2,
              options.snapSouterkets
            )
            snippets.snap = new Snippet('snap-souterket', points.snap)
          }
          break
        case 4:
          if (options.snaps) {
            points.snap = points.outerStart.shiftFractionTowards(
              points.innerEnd,
              options.snapSouterkets
            )
            snippets.snap = new Snippet('snap-souterket', points.snap)
          }
      }
      //title
      points.title = paths.saOuter
        .shiftFractionAlong(0.25)
        .shiftTowards(points.origin, brimWidth * 0.75)
      macro('title', {
        at: points.title,
        nr: 3,
        title: 'Brim',
        cutNr: options.brimNumber,
        scale: 0.5 / options.brimNumber,
        rotation: 360 - points.origin.angle(points.innerQ2),
      })

      if (options.brimAngle == 360 && options.brimNumber == 1) {
        points.cutoutFrom = points.origin
        points.cutoutTo = points.innerMid.shiftFractionTowards(points.origin, 1 / 3)
        paths.cutoutGrainline = new Path()
          .move(points.cutoutFrom)
          .line(points.cutoutTo)
          .attr('class', 'note')
          .attr('data-text', 'Grainline')
          .attr('data-text-class', 'fill-note center')
          .attr('marker-start', 'url(#grainlineFrom)')
          .attr('marker-end', 'url(#grainlineTo)')

        points.cutoutTitle = points.origin.shiftFractionTowards(points.innerQ2, 0.1)
        macro('title', {
          at: points.cutoutTitle,
          nr: 'Cut-out',
          title: 'Brim (Cut-out) PLEASE KEEP!!!',
          scale: 0.25,
          rotation: 360 - points.origin.angle(points.innerQ2),
          prefix: 'cutout',
        })
      }

      if (sa) {
        const crownSa = sa * options.crownSaWidth * 100

        paths.crownSa = paths.hemBase.offset(crownSa).attr('class', 'fabrinner sa').hide()

        if (options.brimAngle == 360 && options.brimNumber == 1) {
          paths.crownSa.unhide().close()
          paths.sa = paths.saOuter.offset(sa).attr('class', 'fabrinner sa').close()
        } else {
          points.saInnerEnd = points.innerEnd.translate(-crownSa, sa)
          points.saOuterStart = points.outerStart.translate(sa, sa)
          points.saOuterEnd = points.outerEnd
            .shift(points.outerEndCp1.angle(points.outerEnd), sa)
            .shift(points.innerStart.angle(points.outerEnd), sa)

          points.saInnerStart = points.innerStart
            .shift(points.innerStartCp2.angle(points.innerStart), sa)
            .shift(points.outerEnd.angle(points.innerStart), crownSa)

          paths.sa = paths.saOuter
            .offset(sa)
            .line(points.saOuterEnd)
            .line(points.saInnerStart)
            .line(paths.crownSa.start())
            .join(paths.crownSa)
            .line(points.saInnerEnd)
            .line(points.saOuterStart)
            .line(paths.saOuter.offset(sa).start())
            .close()
            .attr('class', 'fabrinner sa')
        }
      }
    }

    return part
  },
}
