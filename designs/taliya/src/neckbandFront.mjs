import { frontBase } from './frontBase.mjs'

export const neckbandFront = {
  name: 'taliya.neckbandFront',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Plackets
    buttonNumber: { count: 3, min: 3, max: 7, menu: 'plackets' },
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
    const keepThese = ['cfNeck', 'daisyGuide']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measures
    const neckbandWidth = store.get('neckbandWidth')
    //let's begin
    points.shoulderNeckband = points.shoulderTop.shiftTowards(points.hps, neckbandWidth)
    points.neckbandEndF = points.neckbandEnd.flipX()

    points.neckbandArmholeF = points.neckbandArmhole.flipX()
    points.neckbandArmholeFCp1 = new Point(points.neckbandArmholeF.x, points.neckbandArmholeCp1.y)
    points.shoulderNeckbandCp2 = points.shoulderNeckband.shift(
      points.shoulderTop.angle(points.shoulderTopCp2),
      points.shoulderTop.dist(points.shoulderTopCp2)
    )
    //paths
    paths.saRight = new Path()
      .move(points.neckbandEnd)
      .line(points.neckbandArmhole)
      .join(paths.cfNeck.reverse())
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
      //grainline
      points.grainlineFrom = points.cArmhole.shiftFractionTowards(points.neckbandArmholeF, 0.75)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfNeckbandEnd.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['neckbandEndF', 'neckbandEnd', 'neckbandArmhole', 'neckbandArmholeF'],
      })
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['gatherNeckSplit', 'raglanNeckSplit'],
      })
      //title
      points.title = points.cArmhole.shift(180, neckbandWidth / 4).shift(90, neckbandWidth / 2)
      macro('title', {
        at: points.title,
        nr: '6',
        title: 'Neckband Front',
        cutNr: 4,
        scale: 0.25,
      })
      //buttons
      points.buttonEnd = points.cfNeckbandEnd.shift(90, neckbandWidth)
      for (let i = 0; i < options.buttonNumber; i++) {
        points['button' + i] = points.cArmhole.shiftFractionTowards(
          points.buttonEnd,
          i / (options.buttonNumber - 1)
        )
        snippets['button' + i] = new Snippet('button', points['button' + i])
      }

      if (sa) {
        let bandSa = sa
        if (sa > neckbandWidth / 2) {
          bandSa = neckbandWidth / 4
          paths.saRight
            .attr('class', 'fabric hidden')
            .attr('data-text', utils.units(bandSa) + ' Seam Allowance')
            .attr('data-text-class', 'center')
            .unhide()
        }

        points.saNeckBandEndF = points.neckbandEndF.translate(-sa, sa)
        points.saNeckBandEnd = points.neckbandEnd.translate(bandSa, sa)
        points.saShoulderTop = points.shoulderTop
          .shift(points.shoulderTopCp2.angle(points.shoulderTop), sa)
          .shift(points.shoulderNeckband.angle(points.shoulderTop), bandSa)
        points.saShoulderNeckband = points.shoulderNeckband
          .shift(points.shoulderTopCp2.angle(points.shoulderTop), sa)
          .shift(points.shoulderTop.angle(points.shoulderNeckband), sa)

        paths.sa = new Path()
          .move(points.saNeckBandEndF)
          .line(points.saNeckBandEnd)
          .join(paths.saRight.offset(bandSa))
          .line(points.saShoulderTop)
          .line(points.saShoulderNeckband)
          .join(paths.saLeft.offset(sa))
          .line(points.saNeckBandEndF)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
