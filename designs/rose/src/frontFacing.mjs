import { front } from './front.mjs'

export const frontFacing = {
  name: 'rose.frontFacing',
  from: front,
  options: {
    //Construction
    bodiceFacings: { bool: false, menu: 'construction' },
    bodiceFacingHemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
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
    absoluteOptions,
    log,
  }) => {
    //set render
    if (!options.bodiceFacings) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Daisy
    const keepThese = ['daisyGuide', 'cfNeck']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    macro('title', false)
    macro('scalebox', false)
    //measures
    const facingWidth = points.shoulder.dist(points.shoulderTop)
    const bustDartAngle = store.get('bustDartAngle')
    //rotate
    if (options.bodiceStyle == 'seam' || options.bustDartPlacement == 'armholePitch') {
      const rot = ['armhole', 'armholeCp2', 'armholePitchCp1']
      for (const p of rot) points[p] = points[p].rotate(bustDartAngle, points.bust)
    }
    //let's begin
    points.cfFacing = points.cfNeck.shift(-90, facingWidth)
    points.sideFacing = points.armhole.shiftTowards(points.sideWaistInitial, facingWidth)
    points.cfFacingCp2 = new Point(points.bust.x, points.cfFacing.y)
    points.sideFacingCp1 = new Point(points.bust.x, points.sideFacing.y)
    //paths
    paths.hemBase = new Path()
      .move(points.cfFacing)
      .curve(points.cfFacingCp2, points.sideFacingCp1, points.sideFacing)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.armhole)
      .join(paths.armhole)
      .line(points.shoulderTop)
      .join(paths.cfNeck)
      .line(points.cfFacing)

    //stores
    store.set('bodiceFacingWidth', facingWidth)
    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfNeck.shiftFractionTowards(points.cfFacing, 0.1)
        points.cutOnFoldTo = points.cfFacing.shiftFractionTowards(points.cfNeck, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cfFacing.shiftFractionTowards(points.cfFacingCp2, 0.15)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfNeck.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      snippets.notch = new Snippet('notch', points.armholePitch)
      //title
      points.title = new Point(points.cfNeckCp1.x, (points.cfNeck.y + points.cfFacing.y) / 2)
      macro('title', {
        at: points.title,
        nr: '12',
        title: 'Front Facing',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      if (sa) {
        const bodiceFacingHem = sa * options.bodiceFacingHemWidth * 100

        if (options.bodiceStyle == 'seam' || options.bustDartPlacement == 'armholePitch') {
          // const rot = ['saArmholeCorner', 'saArmhole', 'saArmholeCp2', 'saArmholePitchCp1']
          // for (const p of rot) points[p] = points[p].rotate(bustDartAngle, points.bust)
          points.saArmholeCorner = points.saArmholeCorner.rotate(bustDartAngle, points.bust)
        }
        points.saSideFacing = utils.beamIntersectsY(
          points.saArmholeCorner,
          points.saArmholeCorner.shift(points.armhole.angle(points.sideWaistInitial), 1),
          points.sideFacing.shift(-90, bodiceFacingHem).y
        )

        points.saCfFacing = new Point(points.saCfWaist.x, points.cfFacing.y + bodiceFacingHem)

        paths.sa = paths.hemBase
          .offset(bodiceFacingHem)
          .line(points.saSideFacing)
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(paths.cfNeck.offset(sa * options.neckSaWidth * 100))
          .line(points.saCfNeck)
          .line(points.saCfFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
