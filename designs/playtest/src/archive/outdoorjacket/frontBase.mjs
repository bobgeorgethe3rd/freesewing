import { pctBasedOn } from '@freesewing/core'
import { front as frontByron } from '@freesewing/byron'
import { back } from './back.mjs'

export const frontBase = {
  name: 'playtest.frontBase',
  from: frontByron,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Plackets
    buttonholePlacketWidth: {
      pct: 3.2,
      min: 3,
      max: 5,
      snap: 2.5,
      ...pctBasedOn('chest'),
      menu: 'plackets',
    }, //4.3
    buttonNumber: {
      count: 5,
      min: 4,
      max: 7,
      menu: 'plackets',
    },
    buttonStart: { pct: 27.3, min: 10, max: 30, menu: 'plackets' },
    buttonEnd: { pct: 39.8, min: 20, max: 45, menu: 'plackets' },
    //Pockets
    sidePocketWidth: { pct: 75, min: 40, max: 90, menu: 'pockets.sidePockets' },
    liningPocketsBool: { bool: true, menu: 'pockets' },
    liningPocketWidth: { pct: 73.7, min: 40, max: 90, menu: 'pockets.patchPockets' }, //64.2 //73.1
  },
  draft: ({
    options,
    Point,
    Path,
    points,
    paths,
    Snippet,
    snippets,
    utils,
    complete,
    store,
    sa,
    measurements,
    absoluteOptions,
    paperless,
    macro,
    part,
  }) => {
    //remove paths & snippets
    const keepThese = ['sideSeam', 'armhole', 'cfNeck', 'seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.byronGuides) {
      paths.byronGuide = paths.seam.attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    //meaures
    const buttonholePlacketWidth = absoluteOptions.buttonholePlacketWidth
    const sidePocketOpeningDepth = store.get('sidePocketOpeningDepth')
    const sidePocketOpeningWidth = store.get('sidePocketOpeningWidth')
    //let's begin
    points.cfHem = points.cWaist.shift(-90, store.get('bodyLength'))
    points.sideHem = new Point(points.sideWaist.x, points.cfHem.y)
    points.buttonholePlacketHem = points.cfHem.shift(0, buttonholePlacketWidth * 0.5)
    points.buttonholePlacketNeck = utils.curveIntersectsX(
      points.hps,
      points.hpsCp2,
      points.cfNeckCp1,
      points.cfNeck,
      points.buttonholePlacketHem.x
    )
    points.buttonholePlacketLiningHem = points.cfHem.shift(180, buttonholePlacketWidth * 0.25)
    points.buttonholePlacketLiningNeck = new Point(
      points.buttonholePlacketLiningHem.x,
      points.cfNeck.y
    )
    points.buttonholePlacketFoldHem = points.cfHem.shift(180, buttonholePlacketWidth * 0.5)
    points.buttonholePlacketFoldNeck = new Point(points.buttonholePlacketFoldHem.x, points.cfNeck.y)
    points.buttonholePlacketFacingHem = points.cfHem.shift(180, buttonholePlacketWidth * 0.75)
    points.buttonholePlacketFacingNeck = new Point(
      points.buttonholePlacketFacingHem.x,
      points.cfNeck.y
    )

    //paths
    paths.sideSeam = new Path()
      .move(points.sideHem)
      .line(points.sideWaist)
      .join(paths.sideSeam)
      .hide()

    //button & buttonholes
    points.buttonStart = points.cfNeck.shiftFractionTowards(points.cWaist, options.buttonStart)
    points.buttonEnd = points.cfHem.shiftFractionTowards(points.cWaist, options.buttonEnd)
    for (let i = 0; i <= options.buttonNumber - 1; i++) {
      points['buttonhole' + i] = points.buttonStart.shiftFractionTowards(
        points.buttonEnd,
        i / (options.buttonNumber - 1)
      )
      points['button' + i] = points.buttonStart.shiftFractionTowards(
        points.buttonEnd,
        i / (options.buttonNumber - 1)
      )
    }
    //side pocket
    if (sidePocketOpeningDepth + sidePocketOpeningWidth < paths.sideSeam.length()) {
      points.sidePocketOpeningTop = paths.sideSeam.reverse().shiftAlong(sidePocketOpeningDepth)
      points.sidePocketOpeningBottom = paths.sideSeam
        .reverse()
        .shiftAlong(sidePocketOpeningDepth + sidePocketOpeningWidth)
    }
    //patch pocket
    points.liningPocketAnchor = new Point(
      points.buttonholePlacketHem.x,
      points.cArmholePitch.shiftFractionTowards(points.cArmhole, 2 / 3).y
    )
    points.liningPocketArmholeAnchor = utils.curveIntersectsY(
      points.armhole,
      points.armholeCp2,
      points.armholePitchCp1,
      points.armholePitch,
      points.liningPocketAnchor.y
    )
    points.liningPocketMid = new Point(
      points.liningPocketAnchor.shiftFractionTowards(points.liningPocketArmholeAnchor, 0.5).x,
      points.cArmhole.shiftFractionTowards(points.cWaist, 0.556).y
    )
    const liningPocketWidth =
      points.liningPocketAnchor.dist(points.liningPocketArmholeAnchor) * options.liningPocketWidth
    points.liningPocketLeft = points.liningPocketMid.shift(180, liningPocketWidth * 0.5)
    points.liningPocketRight = points.liningPocketLeft.flipX(points.liningPocketMid)

    //stores
    store.set('buttonholePlacketWidth', buttonholePlacketWidth)
    store.set('buttonPlacketWidth', buttonholePlacketWidth)
    store.set('patchPocketWidth', liningPocketWidth)
    store.set('neckFront', paths.cfNeck.length())
    store.set(
      'sidePocketWidth',
      points.buttonholePlacketHem.dist(points.sideHem) * options.sidePocketWidth
    )

    return part
  },
}
