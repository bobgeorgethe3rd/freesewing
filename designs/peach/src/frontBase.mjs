import { front as frontDaisy } from '@freesewing/daisy'

export const frontBase = {
  name: 'peach.frontBase',
  from: frontDaisy,
  hideDependencies: true,
  options: {
    //Constamt
    bustDartLength: 1,
    bustDartCurve: 1,
    waistDartLength: 1,
    //Darts
    bustDartPlacement: {
      dflt: 'armhole',
      list: ['armhole', 'shoulder'],
      menu: 'darts',
    },
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
  }) => {
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //let's begin
    points.bustDartCpBottom = points.bust
      .shiftFractionTowards(points.bustDartBottom, 2 / 3)
      .rotate(5, points.bust)

    if (options.bustDartPlacement == 'armhole') {
      points.waistDartLeftCp = utils.beamsIntersect(
        points.bustDartCpTop,
        points.bust,
        points.waistDartLeft,
        points.waistDartLeftCp
      )
      points.waistDartMiddleCp = points.bust.shiftTowards(
        points.waistDartLeftCp,
        points.bust.dist(points.waistDartEdge) * 0.25
      )
      points.waistDartRightCp = new Point(points.waistDartRight.x, points.waistDartLeftCp.y)
    } else {
      points.waistDartMiddleCp = points.bust.shiftFractionTowards(points.waistDartEdge, 0.25)
    }

    points.bustDartCpMiddle = points.waistDartMiddleCp.rotate(180, points.bust)

    //guides
    const drawBellaGuide = () => {
      if (options.bustDartPlacement == 'armhole')
        return new Path()
          .move(points.cfWaist)
          .line(points.waistDartLeft)
          .curve_(points.waistDartLeftCp, points.bust)
          ._curve(points.waistDartRightCp, points.waistDartRight)
          .line(points.sideWaist)
          .line(points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
          ._curve(points.bustDartCpBottom, points.bust)
          .curve_(points.bustDartCpTop, points.bustDartTop)
          .curve_(points.armholePitchCp2, points.shoulder)
          .line(points.hps)
          .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
          .line(points.cfWaist)
      else
        return new Path()
          .move(points.cfWaist)
          .line(points.waistDartLeft)
          .curve_(points.waistDartLeftCp, points.waistDartTip)
          ._curve(points.waistDartRightCp, points.waistDartRight)
          .line(points.sideWaist)
          .line(points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
          .line(points.bustDartBottom)
          ._curve(points.bustDartCpBottom, points.bust)
          .curve_(points.bustDartCpTop, points.bustDartTop)
          .line(points.hps)
          .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
          .line(points.cfWaist)
    }

    paths.bellaGuide = drawBellaGuide().close().attr('class', 'various lashed')

    const drawFrontSeam = () => {
      if (options.bustDartPlacement == 'armhole')
        return new Path()
          .move(points.waistDartLeft)
          .curve_(points.waistDartLeftCp, points.bust)
          .curve_(points.bustDartCpMiddle, points.bustDartTop)
      else
        return new Path()
          .move(points.waistDartLeft)
          .curve(points.waistDartLeftCp, points.waistDartMiddleCp, points.bust)
          .curve(points.bustDartCpMiddle, points.bustDartCpTop, points.bustDartTop)
    }

    paths.frontSeam = drawFrontSeam()

    paths.sideFrontSeam = new Path()
      .move(points.bustDartBottom)
      .curve(points.bustDartCpBottom, points.bustDartCpMiddle, points.bust)
      .curve(points.waistDartMiddleCp, points.waistDartRightCp, points.waistDartRight)

    return part
  },
}
