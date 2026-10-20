import { back as backSarah } from '@freesewing/sarah'
import { pctBasedOn } from '@freesewing/core'

export const skirtBack = {
  name: 'portia.skirtBack',
  from: backSarah,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constant
    useVoidStores: false, //Locked for Portia
    //maxSkirtBackDartNum: 2, //Locked for Portia
    //shapeSkirtBackDarts: false, //Locked for Portia
    //skirtBackDartPlacement: 0.5, //Locked for Portia
    // skirtBackDartLength: 0.653, //Locked for Portia
    //Fit
    fitGuides: { bool: false, menu: 'fit' }, //Altered for Portia
    sarahGuides: { bool: false, menu: 'fit' },
    //Style
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved', 'none'], menu: 'style' }, //Altered for Portia
    waistbandWidth: {
      pct: 2.4,
      min: 1,
      max: 6,
      snap: 2.5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Portia
    skirtSegmentNum: { count: 5, min: 2, max: 10, menu: 'style' },
    skirtPleatWidth: { pct: 200, min: 50, max: 400, menu: 'style' },
    skirtLength: { pct: 50, min: 0, max: 100, menu: 'style' },
    skirtLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Portia
    closurePosition: {
      dflt: 'sideLeft',
      list: ['front', 'sideLeft', 'sideRight', 'back'],
      menu: 'construction',
    }, //Altered for Portia
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Portia
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Portia
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
    let skirtLength
    if (options.skirtLength < 0.5) {
      skirtLength = (measurements.waistToKnee - measurements.waistToSeat) * 2 * options.skirtLength
    } else {
      skirtLength =
        (measurements.waistToKnee - measurements.waistToSeat) * (2 - 2 * options.skirtLength) +
        (measurements.waistToFloor - measurements.waistToSeat) * (-1 + 2 * options.skirtLength)
    }
    skirtLength = skirtLength * (1 + options.skirtLengthBonus)
    const styleWaistBack = store.get('styleWaistBack') * 0.5
    const skirtBackSegmentWidth = styleWaistBack / (options.skirtSegmentNum - 1)
    const skirtBackDartWidth = store.get('skirtBackDartWidth') / (options.skirtSegmentNum - 1)
    const skirtBackDartLength = store.get('skirtBackDartLength')
    const backPleatWidth = (styleWaistBack * options.skirtPleatWidth) / options.skirtSegmentNum
    //let's begin
    points.cbHem = points.cbSeat.shift(-90, skirtLength)
    points.sideHem = new Point(points.sideKnee.x, points.cbHem.y)

    points.cbWaistM = points.cbWaist
    points.sideWaistBackM = points.sideWaistBack

    for (let i = 0; i < options.skirtSegmentNum - 1; i++) {
      points['waistSplitLeft' + i] = paths.waistBase
        .reverse()
        .shiftAlong(skirtBackSegmentWidth * (i + 0.5) + skirtBackDartWidth * i)
      points['waistSplitRight' + i] = paths.waistBase
        .reverse()
        .shiftAlong(skirtBackSegmentWidth * (i + 0.5) + skirtBackDartWidth * (i + 1))

      points['hemSplitRight' + i] = new Point(points['waistSplitRight' + i].x, points.cbHem.y)
      points['hemSplitLeft' + i] = new Point(points['waistSplitLeft' + i].x, points.cbHem.y)

      // paths['splitRight' + i] = new Path()
      // .move(points['hemSplitRight' + i])
      // .line(points['waistSplitRight' + i])

      // paths['splitLeft' + i] = new Path()
      // .move(points['hemSplitLeft' + i])
      // .line(points['waistSplitLeft' + i])
    }

    let j
    for (let i = 0; i < options.skirtSegmentNum - 1; i++) {
      j = i * -1 + (options.skirtSegmentNum - 2)

      const shiftDist =
        backPleatWidth - points['hemSplitRight' + j].dist(points['hemSplitLeft' + j])

      points['waistSplitLeft' + j] = points['waistSplitLeft' + j].shift(180, shiftDist)

      if (i > 0) {
        const shiftWaist = ['cbWaistM', 'cbWaistCp2I', 'sideWaistBackCp1I', 'sideWaistBackM']
        for (const p of shiftWaist) points[p] = points[p].shift(180, shiftDist)
      }

      paths.waistBase = new Path()
        .move(points.cbWaistM)
        .curve(points.cbWaistCp2I, points.sideWaistBackCp1I, points.sideWaistBackM)
        .hide()

      paths['waistSplit' + i] = paths.waistBase.split(points['waistSplitRight' + j])[0].hide()
      if (i > 0) {
        paths['waistSplit' + i] = paths.waistBase
          .split(points['waistSplitRight' + j])[0]
          .split(points['waistSplitLeft' + (j + 1)])[1]
          .hide()
      }

      for (let k = 0; k <= j - 1; k++) {
        points['waistSplitLeft' + k] = points['waistSplitLeft' + k].shift(180, shiftDist)
        points['waistSplitRight' + k] = points['waistSplitRight' + k].shift(180, shiftDist)
      }
    }

    const shiftWaist = ['cbWaistM', 'cbWaistCp2I', 'sideWaistBackCp1I', 'sideWaistBackM']
    for (const p of shiftWaist)
      points[p] = points[p].shift(
        180,
        backPleatWidth - points.hemSplitRight0.dist(points.hemSplitLeft0)
      )

    paths['waistSplit' + (options.skirtSegmentNum - 1)] = new Path()
      .move(points.cbWaistM)
      .curve(points.cbWaistCp2I, points.sideWaistBackCp1I, points.sideWaistBackM)
      .split(points.waistSplitLeft0)[1]
      .hide()

    const shiftSideSeamDist = points.sideWaistBack.dist(points.sideWaistBackM)
    const shiftSideSeam = [
      'sideWaistBack',
      'sideCurveStart',
      'sideCurveStartCp2',
      'sideSeatCp1',
      'sideSeat',
      'sideKnee',
      'sideHem',
    ]
    for (const p of shiftSideSeam) points[p] = points[p].shift(180, shiftSideSeamDist)
    //paths
    for (let i = 0; i < options.skirtSegmentNum - 1; i++) {
      paths.waistSplit0 = paths.waistSplit0
        .line(paths['waistSplit' + (i + 1)].start())
        .join(paths['waistSplit' + (i + 1)])
        .hide()

      // if (i < options.skirtSegmentNum - 1) {
      // points['hemSplitRight' + i] = new Point(points['waistSplitRight' + i].x, points.cbHem.y)
      // points['hemSplitLeft' + i] = new Point(points['waistSplitLeft' + i].x, points.cbHem.y)

      // paths['splitRight' + i] = new Path()
      // .move(points['hemSplitRight' + i])
      // .line(points['waistSplitRight' + i])

      // paths['splitLeft' + i] = new Path()
      // .move(points['hemSplitLeft' + i])
      // .line(points['waistSplitLeft' + i])
      // }
    }

    paths.waist = paths.waistSplit0.hide()

    paths.sideSeam = new Path()
      .move(points.sideWaistBack)
      .line(points.sideCurveStart)
      .curve(points.sideCurveStartCp2, points.sideSeatCp1, points.sideSeat)
      .line(points.sideHem)
      .hide()

    paths.seam = new Path()
      .move(points.sideHem)
      .line(points.cbHem)
      .line(points.cbWaist)
      .join(paths.waist)
      .join(paths.sideSeam)
      .close()

    //stores
    store.set('skirtLength', skirtLength)

    if (complete) {
      //grainline
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbHem
        points.cutOnFoldTo = points.cbWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.cbHem.shiftFractionTowards(points.sideHem, 0.03)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      if (options.skirtLength > 0) snippets.cbSeat = new Snippet('bnotch', points.cbSeat)
      //title
      points.title = paths.waist
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(points.sideHem.shiftFractionTowards(points.cbHem, 0.5), 0.35)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Skirt Back',
        cutNr: options.closurePosition != 'back' && options.cbSaWidth == 0 ? 1 : 2,
        scale: 2 / 3,
      })
      //pleats
      for (let i = 0; i < options.skirtSegmentNum - 1; i++) {
        points['pleatRight' + i] = points['waistSplitRight' + i].shift(-90, skirtBackDartLength)
        points['pleatLeft' + i] = points['waistSplitLeft' + i].shift(-90, skirtBackDartLength)

        points['hemSplitRight' + i] = new Point(points['waistSplitRight' + i].x, points.cbHem.y)
        points['hemSplitLeft' + i] = new Point(points['waistSplitLeft' + i].x, points.cbHem.y)

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
        const cbSa = options.closurePosition == 'back' ? closureSa : sa * options.cbSaWidth * 100
        const sideSeamSa =
          options.closurePosition == 'side' ? closureSa : sa * options.sideSeamSaWidth * 100

        points.saSideHem = points.sideHem.translate(-sideSeamSa, hemSa)
        points.saCbHem = points.cbHem.translate(cbSa, hemSa)

        points.saSideWaistBack = points.sideWaistBack
          .shift(points.sideCurveStart.angle(points.sideWaistBack), sa)
          .shift(points.sideWaistBackCp1I.angle(points.sideWaistBack), sideSeamSa)

        paths.sa = new Path()
          .move(points.saSideHem)
          .line(points.saCbHem)
          .line(points.saCbWaist)
          .join(paths.waist.offset(sa))
          .line(points.saSideWaistBack)
          .join(paths.sideSeam.split(points.sideSeat)[0].offset(sideSeamSa))
          .line(points.saSideHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
