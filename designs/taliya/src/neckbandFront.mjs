import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const neckbandFront = {
  name: 'taliya.neckbandFront',
  from: frontBase,
  hide: {
    // from: true,
    // inherited: true,
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
    //removing paths and snippets not required from Bella
    const keepThese = 'daisyGuides'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //measures
    const neckbandWidth = store.get('neckbandWidth')
    //let's begin
    points.shoulderNeckband = points.shoulderTop.shiftTowards(points.hps, neckbandWidth)
    points.neckbandEndF = points.neckbandEnd.flipX()
    //paths
    paths.saRight = new Path()
      .move(points.neckbandEnd)
      .line(points.neckbandArmhole)
      .curve(points.neckbandArmholeCp1, points.shoulderTopCp2, points.shoulderTop)
      .hide()

    paths.saLeft = paths.saRight.clone().reverse().offset(neckbandWidth).hide()
    paths.seam = new Path()
      .move(points.neckbandEndF)
      .line(points.neckbandEnd)
      .join(paths.saRight)
      .line(points.shoulderNeckband)
      .join(paths.saLeft)
      .close()

    if (complete) {
      if (sa) {
        let bandSa = sa
        if (sa > neckbandWidth / 2) {
          bandSa = neckbandWidth / 4
          paths.saRight
            .attr('class', 'fabric hidden')
            .attr('data-text', utils.units(bandSa) + ' Seam Allowance')
            .attr('data-text-class', 'center')
            .unhide()
          paths.saLeft
            .attr('class', 'fabric hidden')
            .attr('data-text', utils.units(bandSa) + ' Seam Allowance')
            .attr('data-text-class', 'center')
            .unhide()
        }

        points.saNeckBandEndF = points.neckbandEndF.translate(-bandSa, sa)
        points.saNeckBandEnd = points.neckbandEnd.translate(bandSa, sa)
        points.saShoulderTop = points.shoulderTop
          .shift(points.shoulderTopCp2.angle(points.shoulderTop), sa)
          .shift(points.shoulderNeckband.angle(points.shoulderTop), bandSa)
        points.saShoulderNeckband = points.shoulderNeckband
          .shift(points.shoulderTopCp2.angle(points.shoulderTop), sa)
          .shift(points.shoulderTop.angle(points.shoulderNeckband), bandSa)

        paths.sa = new Path()
          .move(points.saNeckBandEndF)
          .line(points.saNeckBandEnd)
          .join(paths.saRight.offset(bandSa))
          .line(points.saShoulderTop)
          .line(points.saShoulderNeckband)
          .join(paths.saLeft.offset(bandSa))
          .line(points.saNeckBandEndF)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
