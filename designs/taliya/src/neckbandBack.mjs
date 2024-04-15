import { backBase } from './backBase.mjs'

export const neckbandBack = {
  name: 'taliya.neckbandBack',
  from: backBase,
  hide: {
    from: true,
    inherited: true,
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
    const keepThese = ['cbNeck', 'daisyGuide']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measures
    const neckbandWidth = store.get('neckbandWidth')
    //let's begin
    points.shoulderNeckband = points.shoulderTop.shift(
      points.shoulder.angle(points.hps),
      neckbandWidth
    )
    points.cbNeckband = points.cbNeck.shift(90, neckbandWidth)
    //paths
    paths.saBottom = paths.cbNeck.reverse().hide()

    paths.saTop = paths.cbNeck.offset(neckbandWidth).hide()

    paths.seam = paths.saBottom
      .clone()
      .line(points.shoulderNeckband)
      .join(paths.saTop)
      .line(points.cbNeck)
      .close()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cbNeckband.shiftFractionTowards(points.cbNeck, 0.2)
      points.cutOnFoldTo = points.cbNeck.shiftFractionTowards(points.cbNeckband, 0.2)
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //notches
      snippets.raglanNeckSplit = new Snippet('bnotch', points.raglanNeckSplit)
      //title
      points.title = points.cbNeck
        .shiftFractionTowards(points.cbNeckCp1, 0.25)
        .shift(90, neckbandWidth / 2)
      macro('title', {
        at: points.title,
        nr: '5',
        title: 'Neckband back',
        scale: 0.25,
      })
      if (sa) {
        let bandSa = sa
        if (sa > neckbandWidth / 2) {
          bandSa = neckbandWidth / 4
          paths.saBottom
            .attr('class', 'fabric hidden')
            .attr('data-text', utils.units(bandSa) + ' Seam Allowance')
            .attr('data-text-class', 'center')
            .unhide()
        }
        points.saShoulderTop = points.shoulderTop
          .shift(points.shoulderNeckband.angle(points.shoulderTop), bandSa)
          .shift(points.shoulderTopCp2.angle(points.shoulderTop), bandSa)

        points.saShoulderNeckband = points.shoulderNeckband
          .shift(points.shoulderTop.angle(points.shoulderNeckband), sa)
          .shift(points.shoulderTop.angle(points.shoulderNeckband) - 90, sa)

        points.saCbNeckband = new Point(points.saCbNeck.x, points.cbNeckband.y - sa)
        points.saCbNeck = new Point(points.saCbNeck.x, points.cbNeck.y + bandSa)

        paths.sa = paths.saBottom
          .offset(bandSa)
          .line(points.saShoulderTop)
          .line(points.saShoulderNeckband)
          .join(paths.saTop.offset(sa))
          .line(points.saCbNeckband)
          .line(points.saCbNeck)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
