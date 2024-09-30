import { base } from './base.mjs'
import { centreFront } from './centreFront.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const centreBack = {
  name: 'calanthe.centreBack',
  from: base,
  after: centreFront,
  hide: {
    from: true,
  },
  plugins: [pluginLogoRG],
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
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    //let's begin
    //paths
    paths.saBottom = new Path()
      .move(points.bottom5Left)
      ._curve(points.cbBottomCp1, points.cbBottom)
      .hide()

    paths.saTop = new Path()
      .move(points.cbTop)
      .curve(points.cbTopCp2, points.topMidCp1, points.topMid)
      .curve(points.topMidCp2, points.topFrontMidCp1, points.topFrontMid)
      .split(points.top5)[0]
      .hide()

    paths.saLeft = new Path()
      .move(points.top5)
      .line(points.chest5)
      .curve(points.chest5Cp, points.waist5LeftCp1, points.waist5Left)
      .curve(points.waist5LeftCp2, points.bottom5LeftCp1, points.bottom5Left)
      .hide()

    paths.seam = paths.saBottom
      .clone()
      .line(points.cbTop)
      .join(paths.saTop)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waist5Left.x * 1.025, points.cfChest.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.waist5Left.x * 1.075, points.cbUnderbust.y)
      macro('title', {
        nr: 'B1',
        title: 'Centre Back',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = new Point(
        points.waist5Left.x * 1.1,
        points.cbUnderbust.y + ((points.cbWaist.y - points.cbUnderbust.y) * 2) / 3
      )
      macro('miniscale', {
        at: points.scalebox,
      })
      //logo
      points.logo = new Point(points.scalebox.x, (points.cbWaist.y + points.cbBottom.y) / 2)
      macro('logorg', {
        at: points.logo,
        scale: 1 / 3,
      })
      // waist
      paths.waist = new Path()
        .move(points.waist5Left)
        .line(points.cbWaist)
        .attr('data-text', 'Waist-line')
        .attr('data-text-class', 'center')
        .attr('class', 'interfacing')

      if (sa) {
        const bottomSa = sa * options.bottomSaWidth * 100
        const topSa = sa * options.topSaWidth * 100
        const sideSa = sa * options.sideSaWidth * 100

        points.saCbBottom = points.cbBottom.translate(sa, bottomSa)
        points.saCbTop = points.cbTop.translate(sa, -topSa)

        points.saTop5 = utils.beamIntersectsX(
          paths.saTop.offset(topSa).end(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.998),
          points.top5.x - sideSa
        )

        if (points.saTop5.y > paths.saLeft.offset(sideSa).start().y) {
          points.saTop5 = paths.saLeft.offset(sideSa).start()
        }

        points.saBottom5Left = utils.beamIntersectsX(
          paths.saBottom.offset(bottomSa).start(),
          paths.saBottom.offset(bottomSa).shiftFractionAlong(0.001),
          points.bottom5Left.x - sideSa
        )

        if (points.saBottom5Left.y < paths.saLeft.offset(sideSa).end().y) {
          points.saBottom5Left = paths.saLeft.offset(sideSa).end()
        }

        paths.sa = paths.saBottom
          .clone()
          .offset(bottomSa)
          .line(points.saCbBottom)
          .line(points.saCbTop)
          .join(paths.saTop.offset(topSa))
          .line(points.saTop5)
          .join(paths.saLeft.offset(sideSa))
          .line(points.saBottom5Left)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
