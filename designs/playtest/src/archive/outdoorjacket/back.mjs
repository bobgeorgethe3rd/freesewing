import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { back as backByron } from '@freesewing/byron'

export const back = {
  name: 'playtest.back',
  from: backByron,
  hide: {
    from: true,
  },
  options: {
    //Constants
    useVoidStores: false, //Locked for Outdoor Jacket
    fitWaist: false, //Locked for Outdoor Jacket
    closurePosition: 'front', //Locked for Outdoor Jacket
    //Fit
    chestEase: { pct: 21.7, min: 0, max: 25, menu: 'fit' }, //Altered for Outdoor Jacket
    waistEase: { pct: 25.6, min: 0, max: 30, menu: 'fit' }, //Altered for Outdoor Jacket
    neckEase: { pct: 12.9, min: 0, max: 20, menu: 'fit' }, //Altered for Outdoor Jacket
    byronGuides: { bool: false, menu: 'fit' },
    //Style
    bodyLength: { pct: 100, min: 0, max: 100, menu: 'style' },
    bodyLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    //Pockets
    sidePocketsBool: { bool: true, menu: 'pockets' },
    sidePocketOpeningWidth: { pct: 100, min: 80, max: 120, menu: 'pockets.sidePockets' },
    sidePocketOpeningDepth: { pct: 45, min: 15, max: 50, menu: 'pockets.sidePockets' },
    sidePocketDepth: { pct: 100, min: 50, max: 100, menu: 'pockets.sidePockets' },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Outdoor Jacket
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Outdoor Jacket
    armholeSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Outdoor Jacket
    hemWidth: { pct: 2.5, min: 1, max: 3, menu: 'construction' }, //Altered for Outdoor Jacket
  },
  measurements: ['waistToHips', 'waistToSeat', 'waistToUpperLeg', 'wrist'],
  plugins: [pluginBundle, pluginLogoRG],
  draft: ({
    options,
    Point,
    Path,
    points,
    paths,
    Snippet,
    snippets,
    complete,
    store,
    sa,
    measurements,
    paperless,
    macro,
    part,
  }) => {
    //remove paths & snippets
    const keepThese = ['sideSeam', 'armhole', 'cbNeck', 'seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.byronGuides) {
      paths.byronGuide = paths.seam.attr('class', 'various lashed')
    }
    delete paths.seam
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    macro('cutonfold', false)
    //measurements
    const bodyLength =
      (options.bodyLength < 0.5
        ? measurements.waistToHips * (-2 * options.bodyLength + 1) +
          measurements.waistToSeat * options.bodyLength * 2
        : measurements.waistToSeat * (-2 * options.bodyLength + 2) +
          measurements.waistToUpperLeg * (2 * options.bodyLength - 1)) *
      (1 + options.bodyLengthBonus)
    //let's begin
    points.cbHem = points.cWaist.shift(-90, bodyLength)
    points.sideHem = new Point(points.sideWaist.x, points.cbHem.y)

    //paths
    paths.sideSeam = new Path()
      .move(points.sideHem)
      .line(points.sideWaist)
      .join(paths.sideSeam)
      .hide()

    paths.seam = new Path()
      .move(points.cbHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(points.hps)
      .join(paths.cbNeck)
      .line(points.cbHem)
      .close()

    //pockets
    const sidePocketOpeningDepth = paths.sideSeam.length() * options.sidePocketOpeningDepth
    const sidePocketOpeningWidth = measurements.wrist * options.sidePocketOpeningWidth

    //stores
    store.set('bodyLength', bodyLength)
    store.set('neckBack', paths.cbNeck.length())
    store.set('sidePocketOpeningDepth', sidePocketOpeningDepth)
    store.set('sidePocketOpeningWidth', sidePocketOpeningWidth)
    store.set(
      'sidePocketDepth',
      (paths.sideSeam.length() - sidePocketOpeningDepth - sidePocketOpeningWidth) *
        options.sidePocketDepth
    )
    store.set('sidePocketMaxDepth', paths.sideSeam.length())

    if (complete) {
      //grainline
      let titleCutNum
      if (options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      snippets.cWaist = new Snippet('bnotch', points.cWaist)
      snippets.sideWaist = new Snippet('notch', points.sideWaist)
      if (
        options.sidePocketsBool &&
        sidePocketOpeningDepth + sidePocketOpeningWidth < paths.sideSeam.length()
      ) {
        points.sidePocketOpeningTop = paths.sideSeam.reverse().shiftAlong(sidePocketOpeningDepth)
        points.sidePocketOpeningBottom = paths.sideSeam
          .reverse()
          .shiftAlong(sidePocketOpeningDepth + sidePocketOpeningWidth)
        macro('sprinkle', {
          snippet: 'bnotch',
          on: ['sidePocketOpeningTop', 'sidePocketOpeningBottom'],
        })
      }
      //title
      points.title = new Point(points.hps.x * 0.8, points.cbHem.y * 0.25)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(points.hps.x, points.cbHem.y * 0.5)
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = new Point(points.hps.x, points.cbHem.y * 0.75)
      macro('scalebox', {
        at: points.scalebox,
      })

      if (sa) {
        points.saSideHem = new Point(
          points.saSideWaist.x,
          points.sideHem.y + sa * options.hemWidth * 100
        )
        points.saCbHem = new Point(points.saCWaist.x, points.saSideHem.y)

        paths.sa = new Path()
          .move(points.saCbHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sa * options.sideSeamSaWidth * 100))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saHps)
          .join(paths.cbNeck.offset(sa * options.neckSaWidth * 100))
          .line(points.saCbNeck)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
