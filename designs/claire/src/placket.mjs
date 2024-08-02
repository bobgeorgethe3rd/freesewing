import { placket as placketClaude } from '@freesewing/claude'
import { legFront } from './legFront.mjs'
import { legBack } from './legBack.mjs'

export const placket = {
  name: 'claire.placket',
  after: [legFront, legBack],
  options: {
    ...placketClaude.options,
  },
  draft: (sh) => {
    const {
      macro,
      points,
      Point,
      paths,
      Path,
      snippets,
      Snippet,
      utils,
      options,
      measurements,
      complete,
      sa,
      store,
      part,
    } = sh

    if (!options.placket || options.waistbandElastic) {
      store.set('waistbandPlacketWidth', 0)
    } else {
      if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
        placketClaude.draft(sh)
      } else {
        if (
          options.closurePosition == 'front' ||
          (options.closurePosition == 'back' &&
            !options.separateBack &&
            !options.useBackMeasures &&
            !options.independentSkirtFullness &&
            !options.independentSkirtGathering &&
            !options.useCrossSeamFront)
        ) {
          legFront.from.draft(sh)
          legFront.draft(sh)
        } else {
          legBack.from.draft(sh)
          legBack.draft(sh)
        }

        const keepThese = ['crossSeam', 'crotchSeam']
        for (const name in paths) {
          if (keepThese.indexOf(name) === -1) delete paths[name]
        }

        const crossSeam = paths.crotchSeam || paths.crossSeam
        const cSeat = points.cfSeat || points.cbSeat

        points.waistRight = crossSeam.start().shift(0, measurements.waist * options.placketWidth)
        points.crossSplit = crossSeam.split(cSeat)[1].shiftFractionAlong(options.placketLength)
        points.bottomLeft = new Point(cSeat.x, points.crossSplit.y)
        points.bottomCorner = new Point(points.waistRight.x, points.bottomLeft.y)
        points.bottomLeftCp2 = points.bottomLeft.shiftFractionTowards(
          points.bottomCorner,
          options.cpFraction
        )
        points.bottomRight = points.bottomLeft.rotate(-90, points.bottomCorner)
        points.bottomRightCp1 = points.bottomLeftCp2.rotate(-90, points.bottomCorner)
        //paths
        paths.placketCurve = new Path()
          .move(points.crossSplit)
          .line(points.bottomLeft)
          .curve(points.bottomLeftCp2, points.bottomRightCp1, points.bottomRight)
          .line(points.waistRight)
          .hide()

        paths.crossSeam = crossSeam.split(points.crossSplit)[0].hide()

        paths.seam = paths.placketCurve
          .clone()
          .line(points.waistRight)
          .join(paths.crossSeam)
          .close()

        //stores
        store.set('waistbandPlacketWidth', crossSeam.start().dist(points.waistRight))
        if (complete) {
          //grainline
          points.grainlineFrom = new Point(points.waistRight.x / 5, points.waistRight.y)
          points.grainlineTo = new Point(points.grainlineFrom.x, cSeat.y)
          macro('grainline', {
            from: points.grainlineFrom,
            to: points.grainlineTo,
          })
        }
        //notches
        if (
          !options.separateBack &&
          !options.useBackMeasures &&
          !options.independentSkirtFullness &&
          !options.independentSkirtGathering &&
          !options.useCrossSeamFront
        ) {
          snippets.cSeat = new Snippet('notch', cSeat)
        } else {
          snippets.cSeat = new Snippet('bnotch', cSeat)
        }
        //title
        points.title = new Point(
          points.waistRight.x / 2.5,
          (points.waistRight.y + points.crossSplit.y) / 2
        )
        macro('title', {
          at: points.title,
          nr: '4',
          title: 'Placket',
          scale: 1 / 3,
        })
        if (sa) {
          let waistSa = sa
          if (options.waistbandStyle == 'none') waistSa = store.get('waistSa')
          const closureSa = sa * options.closureSaWidth * 100

          points.saWaistRight = points.waistRight.translate(sa, -waistSa)
          points.saCWaist = paths.crossSeam.start().translate(-closureSa, -waistSa)

          points.saCrotchSplit = utils.beamIntersectsY(
            paths.crossSeam.offset(closureSa).shiftFractionAlong(0.995),
            paths.crossSeam.offset(closureSa).end(),
            points.bottomLeft.y + sa
          )

          paths.sa = paths.placketCurve
            .clone()
            .offset(sa)
            .line(points.saWaistRight)
            .line(points.saCWaist)
            .join(paths.crossSeam.offset(closureSa))
            .line(points.saCrotchSplit)
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
