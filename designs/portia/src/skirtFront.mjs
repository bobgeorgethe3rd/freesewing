import { front as frontSarah } from '@freesewing/sarah'
import { skirtBack } from './skirtBack.mjs'

export const skirtFront = {
  name: 'portia.skirtFront',
  from: frontSarah,
  after: skirtBack,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constant
    maxSkirtFrontDartNum: 2, //Locked for Portia
    shapeSkirtFrontDarts: false, //Locked for Portia
    skirtFrontDartPlacement: 0.5, //Locked for Portia
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    pocketOpening: { pct: 7.2, min: 5, max: 15, menu: 'pockets' },
    pocketOpeningLength: { pct: 85, min: 40, max: 100, menu: 'pockets' },
    pocketDepth: { pct: 10, min: 5, max: 40, menu: 'pockets' },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Portia
  },
  measurements: ['wrist'],
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
  }) => {
    //remove paths & snippets
    const keepPaths = ['hipsGuide', 'seatGuide', 'sideSeam', 'seam', 'waistBase']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.sarahGuides) {
      paths.sarahGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    const keepSnippets = [
      'hipsGuideLeft-notch',
      'hipsGuideRight-notch',
      'seatGuideLeft-notch',
      'seatGuideRight-notch',
    ]
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //removing macros not required from Sarah
    macro('title', false)
    macro('scalebox', false)
    macro('cutonfold', false)
    //measures
    const skirtLength = store.get('skirtLength')
    const styleWaistFront = store.get('styleWaistFront') * 0.5
    const skirtFrontSegmentWidth = styleWaistFront / (options.skirtSegmentNum - 1)
    const skirtFrontDartWidth = store.get('skirtFrontDartWidth') / (options.skirtSegmentNum - 1)
    const skirtFrontDartLength = store.get('skirtFrontDartLength')
    const frontPleatWidth = (styleWaistFront * options.skirtPleatWidth) / options.skirtSegmentNum
    const pocketDepth = measurements.waistToFloor * options.pocketDepth
    const pocketOpening =
      measurements.waistToFloor * options.pocketOpening - store.get('waistbandWidth')
    const pocketOpeningLength = measurements.wrist * options.pocketOpeningLength
    //let's begin
    points.cfHem = points.cfSeat.shift(-90, skirtLength)
    points.sideHem = new Point(points.sideKnee.x, points.cfHem.y)

    points.cfWaistM = points.cfWaist
    points.sideWaistFrontM = points.sideWaistFront

    for (let i = 0; i < options.skirtSegmentNum - 1; i++) {
      points['waistSplitLeft' + i] = paths.waistBase.shiftAlong(
        skirtFrontSegmentWidth * (i + 0.5) + skirtFrontDartWidth * (i + 1)
      )
      points['waistSplitRight' + i] = paths.waistBase.shiftAlong(
        skirtFrontSegmentWidth * (i + 0.5) + skirtFrontDartWidth * i
      )

      points['hemSplitLeft' + i] = new Point(points['waistSplitLeft' + i].x, points.cfHem.y)
      points['hemSplitRight' + i] = new Point(points['waistSplitRight' + i].x, points.cfHem.y)

      // paths['splitLeft' + i] = new Path()
      // .move(points['hemSplitLeft' + i])
      // .line(points['waistSplitLeft' + i])

      // paths['splitRight' + i] = new Path()
      // .move(points['hemSplitRight' + i])
      // .line(points['waistSplitRight' + i])
    }

    let j
    for (let i = 0; i < options.skirtSegmentNum - 1; i++) {
      j = i * -1 + (options.skirtSegmentNum - 2)

      const shiftDist =
        frontPleatWidth - points['hemSplitLeft' + j].dist(points['hemSplitRight' + j])

      points['waistSplitRight' + j] = points['waistSplitRight' + j].shift(0, shiftDist)

      if (i > 0) {
        const shiftWaist = ['sideWaistFrontM', 'sideWaistFrontCp2I', 'cfWaistCp1I', 'cfWaistM']
        for (const p of shiftWaist) points[p] = points[p].shift(0, shiftDist)
      }

      paths.waistBase = new Path()
        .move(points.sideWaistFrontM)
        .curve(points.sideWaistFrontCp2I, points.cfWaistCp1I, points.cfWaistM)
        .hide()

      paths['waistSplit' + i] = paths.waistBase.split(points['waistSplitLeft' + j])[1] //.hide()

      if (i > 0) {
        paths['waistSplit' + i] = paths.waistBase
          .split(points['waistSplitLeft' + j])[1]
          .split(points['waistSplitRight' + (j + 1)])[0]
          .hide()
      }

      for (let k = 0; k <= j - 1; k++) {
        points['waistSplitRight' + k] = points['waistSplitRight' + k].shift(0, shiftDist)
        points['waistSplitLeft' + k] = points['waistSplitLeft' + k].shift(0, shiftDist)
      }
    }

    const shiftWaist = ['sideWaistFrontM', 'sideWaistFrontCp2I', 'cfWaistCp1I', 'cfWaistM']
    for (const p of shiftWaist)
      points[p] = points[p].shift(
        0,
        frontPleatWidth - points.hemSplitRight0.dist(points.hemSplitLeft0)
      )

    paths['waistSplit' + (options.skirtSegmentNum - 1)] = new Path()
      .move(points.sideWaistFrontM)
      .curve(points.sideWaistFrontCp2I, points.cfWaistCp1I, points.cfWaistM)
      .split(points.waistSplitRight0)[0]
      .hide()

    const shiftSideSeamDist = points.sideWaistFront.dist(points.sideWaistFrontM)
    const shiftSideSeam = [
      'sideHem',
      'sideKnee',
      'sideSeat',
      'sideSeatCp2',
      'sideCurveEndCp1',
      'sideCurveEnd',
      'sideWaistFront',
    ]
    for (const p of shiftSideSeam) points[p] = points[p].shift(0, shiftSideSeamDist)
    //paths
    paths.sideSeam = new Path()
      .move(points.sideHem)
      .line(points.sideSeat)
      .curve(points.sideSeatCp2, points.sideCurveEndCp1, points.sideCurveEnd)
      .line(points.sideWaistFront)
      .hide()

    let l
    for (let i = 0; i < options.skirtSegmentNum - 1; i++) {
      l = i * -1 + (options.skirtSegmentNum - 1)

      paths['waistSplit' + (options.skirtSegmentNum - 1)] = paths[
        'waistSplit' + (options.skirtSegmentNum - 1)
      ]
        .line(paths['waistSplit' + (l - 1)].start())
        .join(paths['waistSplit' + (l - 1)])
        .hide()
    }

    paths.waist = paths['waistSplit' + (options.skirtSegmentNum - 1)].hide()

    paths.seam = new Path()
      .move(points.cfHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .join(paths.waist)
      .line(points.cfHem)
      .close()

    //stores
    store.set('pocketOpening', pocketOpening)
    store.set('pocketOpeningLength', pocketOpeningLength)
    store.set('pocketDepth', pocketDepth)

    if (complete) {
      //grainline
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldTo = points.cfHem
        points.cutOnFoldFrom = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.cfHem.shiftFractionTowards(points.sideHem, 0.03)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      if (options.skirtLength > 0) snippets.cfSeat = new Snippet('notch', points.cfSeat)
      if (
        options.pocketsBool &&
        pocketOpening + pocketOpeningLength + pocketDepth < paths.sideSeam.length()
      ) {
        points.pocketOpeningTop = paths.sideSeam.reverse().shiftAlong(pocketOpening)
        points.pocketOpeningBottom = paths.sideSeam
          .reverse()
          .shiftAlong(pocketOpening + pocketOpeningLength)
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      points.title = paths.waist
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(points.cfHem.shiftFractionTowards(points.sideHem, 0.5), 0.35)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Skirt Front',
        cutNr: options.closurePosition != 'front' && options.cbSaWidth == 0 ? 1 : 2,
        scale: 2 / 3,
      })
      //pleats
      for (let i = 0; i < options.skirtSegmentNum - 1; i++) {
        points['pleatRight' + i] = points['waistSplitRight' + i].shift(-90, skirtFrontDartLength)
        points['pleatLeft' + i] = points['waistSplitLeft' + i].shift(-90, skirtFrontDartLength)

        points['hemSplitRight' + i] = new Point(points['waistSplitRight' + i].x, points.cfHem.y)
        points['hemSplitLeft' + i] = new Point(points['waistSplitLeft' + i].x, points.cfHem.y)

        paths['pleatLeft' + i] = new Path()
          .move(points['waistSplitLeft' + i])
          .line(points['pleatLeft' + i])
          .attr('class', 'mark')
          .attr('data-text', 'Pleat From')
          .attr('data-text-class', 'center')

        paths['pleatRight' + i] = new Path()
          .move(points['waistSplitRight' + i])
          .line(points['pleatRight' + i])
          .attr('class', 'mark')
          .attr('data-text', 'Pleat To')
          .attr('data-text-class', 'center')

        paths['pleatHemLeft' + i] = new Path()
          .move(points['pleatLeft' + i])
          .line(points['hemSplitLeft' + i])
          .attr('class', 'mark help')

        paths['pleatHemRight' + i] = new Path()
          .move(points['pleatRight' + i])
          .line(points['hemSplitRight' + i])
          .attr('class', 'mark help')

        snippets['pleatLeft' + i] = new Snippet('notch', points['pleatLeft' + i])
        snippets['pleatRight' + i] = new Snippet('notch', points['pleatRight' + i])
      }
      if (sa) {
        const closureSa = sa * options.closureSaWidth * 100
        const hemSa = sa * options.hemWidth * 100
        const cfSa = options.closurePosition == 'front' ? closureSa : sa * options.cfSaWidth * 100
        const sideSeamSa =
          options.closurePosition == 'side' ? closureSa : sa * options.sideSeamSaWidth * 100

        points.saCfHem = points.cfHem.translate(-cfSa, hemSa)
        points.saSideHem = points.sideHem.translate(sideSeamSa, hemSa)

        points.saSideWaistFront = points.sideWaistFront
          .shift(points.sideCurveEnd.angle(points.sideWaistFront), sa)
          .shift(points.sideWaistFrontCp2I.angle(points.sideWaistFront), sideSeamSa)

        paths.sa = new Path()
          .move(points.saCfHem)
          .line(points.saSideHem)
          .line(paths.sideSeam.split(points.sideSeat)[1].offset(sideSeamSa).start())
          .join(paths.sideSeam.split(points.sideSeat)[1].offset(sideSeamSa))
          .line(points.saSideWaistFront)
          .join(paths.waist.offset(sa))
          .line(points.saCfWaist)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
