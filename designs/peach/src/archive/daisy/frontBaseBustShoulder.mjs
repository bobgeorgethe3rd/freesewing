import { frontBase as frontBaseDaisy } from '@freesewing/daisy'
import { frontBustShoulderDart } from '@freesewing/daisy'
import { pluginMirror } from '@freesewing/plugin-mirror'

export const frontBaseBustShoulder = {
  name: 'peach.frontBaseBustShoulder',
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
  plugins: [pluginMirror],
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

    frontBustShoulderDart(sh)

    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('scalebox', false)
    //let's begin
    points.bustDartMidCp = points.bust.shiftFractionTowards(points.bustDartMid, 0.25)
    points.waistDartMidCp = points.bustDartMid.shiftOutwards(
      points.bust,
      points.bust.dist(points.waistDartMid) * 0.25
    )
    // points.waistDartLeftCp = points.waistDartLeft.shiftTowards(points.bust, points.waistDartMid.dist(points.bust) * 0.25)
    points.waistDartLeftCp = points.waistDartLeft.shift(
      90,
      points.waistDartMid.dist(points.bust) * 0.5
    )
    points.waistDartRightCp = points.waistDartLeftCp.flipX(points.bust)
    points.bustDartBottomCp = points.bustDartBottom.shift(
      points.shoulder.angle(points.armholePitchCp2),
      points.shoulder.dist(points.armholePitchCp2)
    )

    macro('mirror', {
      mirror: [points.bust, points.bustDartMid],
      points: ['bustDartBottomCp'],
      prefix: 'm',
    })

    points.bustDartTopCp = points.mBustDartBottomCp
    //guides

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

    paths.frontGuide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .curve(points.waistDartLeftCp, points.waistDartMidCp, points.bust)
      .curve(points.bustDartMidCp, points.bustDartTopCp, points.bustDartTop)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .close()
      .attr('class', 'mark')

    paths.sideFrontGuide = new Path()
      .move(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.bustDartBottom)
      .curve(points.bustDartBottomCp, points.bustDartMidCp, points.bust)
      .curve(points.waistDartMidCp, points.waistDartRightCp, points.waistDartRight)
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

    //stores
    store.set(
      'waistDartFraction',
      points.cfWaist.dist(points.waistDartLeft) /
        (points.cfWaist.dist(points.waistDartLeft) + points.waistDartRight.dist(points.sideWaist))
    )
    store.set('shoulderPoint', points.hps.dist(points.bustDartTop))

    if (complete) {
      //notches
      snippets.bust = new Snippet('notch', points.bust)
    }

    return part
  },
}
