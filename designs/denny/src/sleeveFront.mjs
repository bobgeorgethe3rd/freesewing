import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { sleeveBase } from './sleeveBase.mjs'

export const sleeveFront = {
  name: 'denny.sleeveFront',
  from: sleeveBase,
  hide: {
    from: true,
    inherited: true,
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
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
    log,
    utils,
  }) => {
    //removing paths and snippets not required from Byron
    const keepPaths = ['sleeveGuide', 'sleevecap']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    //paths
    paths.sleevecap = paths.sleevecap.split(points.sleevecapSplit)[0].hide()

    paths.seam = new Path()
      .move(points.frontBottomLeft)
      .line(points.bottomRight)
      .line(points.sleeveCapRight)
      .join(paths.sleevecap)
      .line(points.frontBottomLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.sleeveTip
      points.grainlineTo = points.sleeveTipBottom
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontNotch', 'sleeveTip', 'sleeveFrontVent'],
      })
      snippets.backNotch = new Snippet('bnotch', points.backNotch)
      //title
      points.capQ2Bottom = new Point(points.capQ2.x, points.bottomRight.y)
      points.title = points.capQ2.shiftFractionTowards(points.capQ2Bottom, 0.25)
      macro('title', {
        at: points.title,
        nr: '10',
        title: 'Sleeve Front',
        cutNr: 2,
        scale: 0.5,
      })
      //logorg
      points.logo = points.capQ2.shiftFractionTowards(points.capQ2Bottom, 0.5)
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = points.capQ2.shiftFractionTowards(points.capQ2Bottom, 0.75)
      macro('scalebox', { at: points.scalebox })
      // pleats
      if (options.sleevePleats) {
        paths.pleatFrom = new Path()
          .move(points.sleevePleatBottomRight)
          .line(points.sleevePleatTopRight)
          .attr('class', 'mark')
          .attr('data-text', 'Pleat - From')
          .attr('data-text-class', 'center')

        paths.pleatTo = new Path()
          .move(points.sleevePleatBottomLeft)
          .line(points.sleevePleatTopLeft)
          .attr('class', 'mark help')
          .attr('data-text', 'Pleat - To')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        const sleevePanelSa = sa * options.sleevePanelSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saFrontBottomLeft = utils.beamIntersectsY(
          points.sleevecapSplit
            .shiftTowards(points.frontBottomLeft, sleevePanelSa)
            .rotate(-90, points.sleevecapSplit),
          points.frontBottomLeft
            .shiftTowards(points.sleevecapSplit, sleevePanelSa)
            .rotate(90, points.frontBottomLeft),
          points.frontBottomLeft.y + sa
        )

        if (points.midAnchor.dist(points.bottomAnchor) <= 0 || !options.fitSleeveWidth) {
          points.saBottomRight = points.bottomRight.shift(0, sideSeamSa)
          points.saTopRight = points.sleeveCapRight.shift(0, sideSeamSa)
        } else {
          points.saBottomRight = points.bottomRight
            .shiftTowards(points.sleeveCapRight, sideSeamSa)
            .rotate(-90, points.bottomRight)

          points.saTopRight = utils.beamIntersectsY(
            points.bottomRight
              .shiftTowards(points.sleeveCapRight, sideSeamSa)
              .rotate(-90, points.bottomRight),
            points.sleeveCapRight
              .shiftTowards(points.bottomRight, sideSeamSa)
              .rotate(90, points.sleeveCapRight),
            points.sleeveCapRight.y
          )

          points.saSleeveCapRight = utils.beamIntersectsY(
            points.saTopRight,
            points.saTopRight.shift(90, 1),
            paths.sleevecap.offset(armholeSa).start().y
          )
          points.saBottomRightCorner = new Point(points.saBottomRight.x, points.bottomRight.y + sa)

          points.saSleevecapSplit = utils.beamsIntersect(
            paths.sleevecap.offset(armholeSa).shiftFractionAlong(0.995),
            paths.sleevecap.offset(armholeSa).end(),
            points.sleevecapSplit
              .shiftTowards(points.frontBottomLeft, sleevePanelSa)
              .rotate(-90, points.sleevecapSplit),
            points.frontBottomLeft
              .shiftTowards(points.sleevecapSplit, sleevePanelSa)
              .rotate(90, points.frontBottomLeft)
          )

          paths.sa = new Path()
            .move(points.saFrontBottomLeft)
            .line(points.saBottomRightCorner)
            .line(points.saBottomRight)
            .line(points.saTopRight)
            .line(points.saSleeveCapRight)
            .join(paths.sleevecap.offset(armholeSa))
            .line(points.saSleevecapSplit)
            .line(points.saFrontBottomLeft)
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
