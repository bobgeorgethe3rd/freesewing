import { frontBase as frontBaseDaisy } from '@freesewing/daisy'
import { front as frontDaisy } from '@freesewing/daisy'
import { frontBustSideDart } from '@freesewing/daisy'

export const front = {
  name: 'bernice.front',
  from: frontBaseDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...frontDaisy.options,
    //Constant
    bustDartPlacement: 'bustSide', //Locked for Bernice
    waistDartLength: 1, //Locked for Bernice
    bustDartFraction: 0.5, //Locked for Bernice
    closurePosition: 'front', //Locked for Bernice
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    //Style
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
    frontBustSideDart(sh)
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    const bustDartAngle = store.get('bustDartAngle')
    const waistDartAngle =
      points.bust.angle(points.waistDartRight) - points.bust.angle(points.waistDartLeft)
    points.bustDartTop = utils.beamsIntersect(
      points.bust,
      points.bustDartTop,
      points.armhole,
      points.sideWaistInitial.rotate(-waistDartAngle / 2, points.armhole)
    )
    points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
    points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)
    points.bustDartTip = points.bustDartMid.shiftFractionTowards(
      points.bust,
      options.bustDartLength
    )
    points.sideWaist = utils.beamsIntersect(
      points.armhole.rotate(-bustDartAngle, points.bust),
      points.bustDartBottom,
      points.waistDartRight,
      points.sideWaist
    )
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .curve(points.waistDartMid, points.waistDartMid, points.sideWaist)
        .line(points.bustDartBottom)
        .line(points.bustDartTip)
        .line(points.bustDartTop)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.cfWaist)
        .close()
        .attr('class', 'various lashed')
    }

    return part
  },
}
