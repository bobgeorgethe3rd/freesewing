import { frontBase as frontBaseDaisy } from '@freesewing/daisy'
import { front as frontDaisy } from '@freesewing/daisy'
import { frontBustShoulderDart } from '@freesewing/daisy'

export const frontBase = {
  name: 'scott.frontBase',
  from: frontBaseDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...frontDaisy.options,
    //Constant
    bustDartPlacement: 'bustShoulder', //Locked for Scott
    bustDartLength: 1, //Locked for Scott
    waistDartLength: 1, //Locked for Scott
    bustDartFraction: 0.5, //Locked for Scott
    //closurePosition: 'back', //Locked for Scott
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    //Style
    neckDrop: { pct: 81.2, min: 65, max: 85, menu: 'style' }, //70.3
    heartPeak: { pct: 59, min: 45, max: 75, menu: 'style' },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Unlocked for Scott
  },
  draft: (sh) => {
    const {
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
    } = sh
    //draft
    frontBustShoulderDart(sh)
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //let's begin
    //centre front
    //seam shaping
    points.waistDartLeftCp2 = points.waistDartLeft.shift(
      90,
      points.waistDartMid.dist(points.bust) * 0.5
    )
    points.neckFrontCp1 = points.bust.shiftFractionTowards(points.waistDartMid, 0.25)
    //scallop
    points.cfTop = points.cfNeck.shiftFractionTowards(points.cfChest, options.neckDrop)
    points.neckFront = new Point(points.bust.x, points.cfTop.y)
    points.heartPeakAnchor = points.cfTop.shiftFractionTowards(points.neckFront, 0.5)
    points.heartPeak = points.heartPeakAnchor
      .shiftFractionTowards(points.cfTop, options.heartPeak)
      .rotate(-90, points.heartPeakAnchor)
    points.heartPeakCp1 = new Point(points.neckFront.x * 0.9, points.heartPeak.y)
    points.heartPeakCp2 = new Point(points.neckFront.x * 0.1, points.heartPeak.y)
    //side front
    points.sideNeckFront = points.neckFront.rotate(-store.get('bustDartAngle'), points.bust)
    points.waistDartRightCp1 = new Point(points.waistDartRight.x, points.waistDartLeftCp2.y)
    points.sideNeckFrontCp2 = points.bustDartBottom.shiftOutwards(
      points.bust,
      points.waistDartMid.dist(points.bust) * 0.25
    )

    //stores
    store.set('sideShoulderLength', points.shoulder.dist(points.bustDartBottom))
    store.set(
      'waistFront',
      (points.cfWaist.dist(points.waistDartLeft) + points.waistDartRight.dist(points.sideWaist)) * 4
    )

    //guides
    //DO NOT REMOVE!!! Useful for when making changes
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.waistDartTip)
        .line(points.waistDartRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.bustDartBottom)
        .line(points.bust)
        .line(points.bustDartTop)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.cfWaist)
        .attr('class', 'various lashed')
    }
    paths.front = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .curve(points.waistDartLeftCp2, points.neckFrontCp1, points.neckFront)
      ._curve(points.heartPeakCp1, points.heartPeak)
      .curve_(points.heartPeakCp2, points.cfTop)
      .line(points.cfWaist)

    paths.sideFront = new Path()
      .move(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.bustDartBottom)
      .line(points.sideNeckFront)
      .curve(points.sideNeckFrontCp2, points.waistDartRightCp1, points.waistDartRight)

    return part
  },
}
