import { pctBasedOn } from '@freesewing/core'
import { sleeve as basicsleeve } from '@freesewing/basicsleeve'

export const sleeve = {
  name: 'rufflebutterflysleeve.sleeve',
  from: basicsleeve,
  hideDependencies: true,
  options: {
    //Constants
    cpFraction: 0.55191502449,
    sleeveBands: false, //locked
    sleeveBandWidth: 0, //locked
    flounces: 'none', //locked
    //Style
    sleeveLength: { pct: 30, min: 15, max: 100, menu: 'style' },
    sleeveSlitWidth: {
      pct: 5,
      min: 2,
      max: 7.5,
      snap: 2.5,
      ...pctBasedOn('shoulderToElbow'),
      menu: 'style',
    },
    sleeveFlounceLength: { pct: 75, min: 50, max: 90, menu: 'style' },
    sleeveTieChannel: { dflt: 'mid', list: ['mid', 'hem', 'band'], menu: 'style' },
    sleeveTiePlacement: { pct: 50, min: 40, max: 60, menu: 'style' },
    sleeveTieWidth: {
      pct: 5.9,
      min: 1.4,
      max: 15,
      snap: 2.5,
      ...pctBasedOn('wrist'),
      menu: 'style',
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
    Snippet,
    absoluteOptions,
    log,
  }) => {
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from sleevecap
    macro('title', false)
    //measures
    let sleeveTieWidth = absoluteOptions.sleeveTieWidth
    let sleeveSlitWidth = absoluteOptions.sleeveSlitWidth

    let hemA
    if (options.sleeveTieChannel == 'hem') {
      hemA = sleeveTieWidth * 1.02 + sa
    }
    if (options.sleeveTieChannel == 'band') {
      hemA = sa
    }
    if (options.sleeveTieChannel == 'mid') {
      hemA = sa * options.sleeveHemWidth * 100
    }
    if (sa == 0) {
      hemA = 0
    }
    //let's begin
    //time for the slit
    points.slitTop = points.sleeveTip.shiftTowards(points.sleeveTipBottom, sleeveSlitWidth)
    points.slitMid = points.sleeveTip.shiftFractionTowards(
      points.sleeveTipBottom,
      options.sleeveFlounceLength
    )

    points.seamSlitTopLeft = points.sleeveTip.rotate(90, points.slitTop)
    points.seamSlitTopRight = points.seamSlitTopLeft.flipX(points.slitTop)
    points.seamSlitCp1 = points.seamSlitTopRight.shiftFractionTowards(
      points.slitTop.rotate(-90, points.seamSlitTopRight),
      options.cpFraction
    )
    points.seamSlitCp2 = points.sleeveTip.shiftFractionTowards(
      points.slitTop.rotate(90, points.sleeveTip),
      options.cpFraction
    )
    points.seamSlitCp3 = points.seamSlitCp2.flipX(points.sleeveTip)
    points.seamSlitCp4 = points.seamSlitCp1.flipX(points.sleeveTip)

    points.seamSlitMidLeft = new Point(points.seamSlitTopLeft.x, points.slitMid.y)
    points.seamSlitMidRight = points.seamSlitMidLeft.flipX(points.sleeveTip)
    points.seamSlitBottomLeft = new Point(points.seamSlitTopLeft.x, points.sleeveTipBottom.y)
    points.seamSlitBottomRight = points.seamSlitBottomLeft.flipX(points.sleeveTip)

    points.slitMidLeft = utils.beamsIntersect(
      points.slitMid,
      points.slitMid.shift(180, 1),
      points.bicepsLeft,
      points.bottomLeft
    )
    points.slitMidRight = points.slitMidLeft.flipX(points.bottomAnchor)

    //paths
    let bottomLeft
    let bottomRight
    let seamSlitBottomLeft
    let seamSlitBottomRight
    let slitBottom
    if (options.sleeveTieChannel == 'band') {
      bottomLeft = points.slitMidLeft
      bottomRight = points.slitMidRight
      seamSlitBottomLeft = points.seamSlitMidLeft
      seamSlitBottomRight = points.seamSlitMidRight
      slitBottom = points.slitMid
      points.grainlineTo = new Point(points.capQ3.x, points.slitMid.y)
    } else {
      bottomLeft = points.bottomLeft
      bottomRight = points.bottomRight
      seamSlitBottomLeft = points.seamSlitBottomLeft
      seamSlitBottomRight = points.seamSlitBottomRight
      slitBottom = points.sleeveTipBottom
      points.grainlineTo = new Point(points.capQ3.x, points.bottomAnchor.y)
    }

    paths.slit = new Path()
      .move(points.slitTop)
      .line(slitBottom.shift(-90, hemA))
      .attr('data-text', 'Slit-line. Cut along line to top bnotch.')
      .attr('data-text-class', 'center')
      .attr('class', 'interfacing dashed')

    paths.seamSlitRound = new Path()
      .move(points.seamSlitMidRight)
      .line(points.seamSlitTopRight)
      .curve(points.seamSlitCp1, points.seamSlitCp2, points.sleeveTip)
      .curve(points.seamSlitCp3, points.seamSlitCp4, points.seamSlitTopLeft)
      .line(points.seamSlitMidLeft)
      .hide()

    paths.seamSlitLine = new Path()
      .move(seamSlitBottomRight.shift(-90, hemA))
      .join(paths.seamSlitRound)
      .line(seamSlitBottomLeft.shift(-90, hemA))
      .attr('data-text', 'Slit Seam - line')
      .attr('data-text-class', 'center')
      .attr('class', 'interfacing')

    //seam paths
    paths.hemBase = new Path().move(bottomLeft).line(bottomRight).hide()

    paths.saRight = new Path().move(bottomRight).line(points.bicepsRight).hide()

    paths.saLeft = new Path().move(points.bicepsLeft).line(bottomLeft).hide()

    paths.sleevecap = new Path()
      .move(points.bicepsRight)
      .curve(points.bicepsRight, points.capQ1Cp1, points.capQ1)
      .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
      .curve(points.capQ2Cp2, points.capQ3Cp1, points.capQ3)
      .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
      .curve(points.capQ4Cp2, points.bicepsLeft, points.bicepsLeft)
      .hide()

    paths.seam = paths.hemBase.join(paths.saRight).join(paths.sleevecap).join(paths.saLeft).close()

    //time for ties
    if (options.sleeveTieChannel == 'mid') {
      points.channelMid = points.slitMid.shiftFractionTowards(
        points.sleeveTipBottom,
        options.sleeveTiePlacement
      )
      points.channelTopMid = points.channelMid.shiftTowards(points.slitMid, sleeveTieWidth / 2)
      points.channelBottomMid = points.channelTopMid.rotate(180, points.channelMid)
      points.channelTopLeft = utils.beamsIntersect(
        points.channelTopMid,
        points.channelTopMid.shift(180, 1),
        points.bicepsLeft,
        points.bottomLeft
      )
      points.channelBottomLeft = utils.beamsIntersect(
        points.channelBottomMid,
        points.channelBottomMid.shift(180, 1),
        points.bicepsLeft,
        points.bottomLeft
      )
      points.channelTopRight = points.channelTopLeft.flipX(points.bottomAnchor)
      points.channelBottomRight = points.channelBottomLeft.flipX(points.bottomAnchor)

      paths.channelTop = new Path()
        .move(points.channelTopLeft)
        .line(points.channelTopRight)
        .attr('class', 'various')

      paths.channelBottom = new Path()
        .move(points.channelBottomLeft)
        .line(points.channelBottomRight)
        .attr('class', 'various')
        .attr('data-text', 'Tie Channel')

      store.set('sleeveChannelLengh', points.channelTopLeft.dist(points.channelTopRight))
    } else {
      store.set('sleeveChannelLengh', bottomLeft.dist(bottomRight))
    }
    //stores
    store.set('sleeveSlitWidth', sleeveSlitWidth)
    store.set('slitFlounceLength', paths.seamSlitRound.length())
    store.set('sleeveBandLength', points.slitMidLeft.dist(points.seamSlitMidLeft))
    store.set('sleeveBandWidth', points.seamSlitMidLeft.dist(points.seamSlitBottomLeft))
    store.set('sleeveTieWidth', sleeveTieWidth)

    if (complete) {
      //grainline
      points.grainlineFrom = points.capQ3
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontNotch', 'sleeveTip', 'slitTop', 'slitMid'],
      })
      snippets.backNotch = new Snippet('bnotch', points.backNotch)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['backNotch', 'slitTop'],
      })
      //title
      points.title = new Point(points.capQ4.x, points.slitMid.y / 2)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Ruffle Butterfly Sleeve',
        scale: 0.5,
      })

      if (sa) {
        paths.sa = paths.hemBase
          .offset(hemA)
          .join(paths.saRight.offset(sa))
          .join(paths.sleevecap.offset(sa * options.sleeveCapSaWidth * 100))
          .join(paths.saLeft.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
