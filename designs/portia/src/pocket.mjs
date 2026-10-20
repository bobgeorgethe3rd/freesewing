import { front as frontSarah } from '@freesewing/sarah'
import { skirtFront } from './skirtFront.mjs'

export const pocket = {
  name: 'portia.pocket',
  from: frontSarah,
  after: skirtFront,
  options: {
    //Pockets
    pocketWidth: { pct: 75, min: 40, max: 75, menu: 'pockets' },
    //Construction
    pocketBagSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
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
    log,
    part,
    snippets,
    Snippet,
  }) => {
    //set render
    if (!options.pocketsBool) {
      part.hide()
      return part
    }
    //remove paths & snippets
    const keepPaths = ['sideSeam', 'seam']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.sarahGuides) {
      paths.sarahGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Sarah
    macro('title', false)
    macro('scalebox', false)
    macro('cutonfold', false)
    //measures
    const pocketDepth = store.get('pocketDepth')
    const pocketOpening = store.get('pocketOpening')
    const pocketOpeningLength = store.get('pocketOpeningLength')

    points.sideHem = points.sideSeat.shift(-90, store.get('skirtLength'))

    paths.sideSeam = new Path()
      .move(points.sideHem)
      .line(points.sideSeat)
      .curve(points.sideSeatCp2, points.sideCurveEndCp1, points.sideCurveEnd)
      .line(points.sideWaistFront)
      .hide()

    if (pocketOpening + pocketOpeningLength + pocketDepth >= paths.sideSeam.length()) {
      log.warning('Pocket to big so is not drafted.')
      part.hide()
      return part
    }
    //let's begin
    paths.waistBase = new Path()
      .move(points.sideWaistFront)
      .curve(points.sideWaistFrontCp2I, points.cfWaistCp1I, points.cfWaist)
      .hide()
    points.waistPocket = paths.waistBase.shiftAlong(
      store.get('styleWaistFront') * 0.5 * options.pocketWidth
    )
    points.pocketOpeningTop = paths.sideSeam.reverse().shiftAlong(pocketOpening)
    points.pocketOpeningBottom = paths.sideSeam
      .reverse()
      .shiftAlong(pocketOpening + pocketOpeningLength)
    points.pocketBottom = paths.sideSeam
      .reverse()
      .shiftAlong(pocketOpening + pocketOpeningLength + pocketDepth)
    points.pocketCorner = new Point(points.waistPocket.x, points.pocketBottom.y)
    //paths
    paths.sideSeam = paths.sideSeam.split(points.pocketBottom)[1].hide()

    paths.waist = paths.waistBase.split(points.waistPocket)[0].hide()

    paths.seam = new Path()
      .move(points.waistPocket)
      .line(points.pocketCorner)
      .line(points.pocketBottom)
      .join(paths.sideSeam)
      .join(paths.waist)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = paths.waist.shiftFractionAlong(0.75)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.pocketCorner.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['pocketOpeningTop', 'pocketOpeningBottom'],
      })
      //title
      points.title = paths.waist
        .shiftFractionAlong(0.5)
        .shift(-90, points.waistPocket.dist(points.pocketCorner) * 0.5)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Pocket',
        cutNr: 4,
        scale: 0.5,
      })
      if (sa) {
        const sideSeamSa =
          options.closurePosition == 'side'
            ? sa * options.closureSaWidth * 100
            : sa * options.sideSeamSaWidth * 100
        const pocketBagSa = sa * options.pocketBagSaWidth * 100

        points.saPocketCorner = points.pocketCorner.translate(-pocketBagSa, pocketBagSa)
        points.saPocketBottom = utils.beamIntersectsY(
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.005),
          paths.sideSeam.offset(sideSeamSa).start(),
          points.saPocketCorner.y
        )
        points.saWaistPocket = utils.beamIntersectsX(
          paths.waist.offset(sa).shiftFractionAlong(0.995),
          paths.waist.offset(sa).end(),
          points.saPocketCorner.x
        )

        points.saSideWaistFront = points.sideWaistFront
          .shift(points.sideCurveEnd.angle(points.sideWaistFront), sa)
          .shift(points.sideWaistFrontCp2I.angle(points.sideWaistFront), sideSeamSa)

        paths.sa = new Path()
          .move(points.saWaistPocket)
          .line(points.saPocketCorner)
          .line(points.saPocketBottom)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistFront)
          .join(paths.waist.offset(sa))
          .line(points.saWaistPocket)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
