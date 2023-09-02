import { frontBase as frontBaseDaisy } from '@freesewing/daisy'
import { frontArmholeDart } from '@freesewing/daisy'

export const frontBaseArmhole = {
  name: 'peach.frontBaseArmhole',
  from: frontBaseDaisy,
  hide: {
    from: true,
  },
  options: {
    //Constant
    armholeSaWidth: 0.01,
    shoulderSaWidth: 0.01,
    sideSeamSaWidth: 0.01,
    neckSaWidth: 0.01,
    bustDartLength: 1,
    waistDartLength: 1,
    //Darts
    bustDartFraction: { pct: 50, min: 0, max: 100, menu: 'darts' },
    bustDartPlacement: {
      dflt: 'armhole',
      list: ['armhole', 'armholePitch', 'shoulder', 'bustshoulder'],
      menu: 'darts',
    },
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

    frontArmholeDart(sh)

    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('scalebox', false)
    //let's begin

    points.bustDartTopCp = utils.beamsIntersect(
      points.waistDartLeft,
      points.bust,
      points.bustDartTop,
      points.bustDartTop.shift(180, 1)
    )

    // points.bustDartTopCp1 = points.bust.shiftFractionTowards(points.bustDartTopCp2, 0)
    points.bustDartBottomCp = points.bustDartTopCp.rotate(-store.get('bustDartAngle'), points.bust)
    // points.bustDartBottomCp2 = points.bustDartTopCp1.rotate(-store.get('bustDartAngle'), points.bust)
    points.bustCp2 = points.bustDartBottomCp.shiftOutwards(
      points.bust,
      points.bust.dist(points.waistDartMid) * 0.25
    )
    points.waistDartRightCp = points.waistDartRight.shiftTowards(
      points.bust,
      points.bust.dist(points.waistDartMid) * 0.5
    )
    //guides

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.armholeR = new Path()
      .move(points.armholeR)
      .curve(points.armholeCp2R, points.armholePitchCp1R, points.armholePitchR)
      .curve_(points.armholePitchCp2R, points.shoulderR)
      .hide()

    if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
      paths.armhole = paths.armhole.split(points.bustDartTop)[1]
      paths.armholeR = paths.armholeR.split(points.bustDartBottom)[0]
    } else {
      if (options.bustDartFraction <= 0.01) {
        paths.armhole = new Path().move(points.bustDartTop).line(points.shoulder).hide()
      } else {
        paths.armholeR = new Path().move(points.armholeR).line(points.bustDartBottom).hide()
      }
    }

    paths.daisyGuide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.waistDartTip)
      .line(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armholeR)
      .join(paths.armholeR)
      .line(points.bust)
      .line(points.bustDartTop)
      .join(paths.armhole)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .attr('class', 'various lashed')

    paths.frontGuide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.bust)
      .curve_(points.bustDartTopCp, points.bustDartTop)
      .join(paths.armhole)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .close()
      .attr('class', 'mark')

    paths.sideFrontGuide = new Path()
      .move(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armholeR)
      .join(paths.armholeR)
      ._curve(points.bustDartBottomCp, points.bust)
      .curve(points.bustCp2, points.waistDartRightCp, points.waistDartRight)
      .close()
      .attr('class', 'mark')

    paths.test = new Path()
      .move(points.waistDartLeft)
      .curve(points.bust, points.bust, points.bustDartTop)
      .move(points.bustDartBottom)
      .curve(
        points.bustDartBottom.shiftFractionTowards(points.bust, 4 / 3),
        points.bust,
        points.waistDartRight
      )

    if (complete) {
      //notches
      snippets.bust = new Snippet('notch', points.bust)
    }

    return part
  },
}
