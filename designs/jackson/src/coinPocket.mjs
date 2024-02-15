import { frontPocketFacing } from './frontPocketFacing.mjs'

export const coinPocket = {
  name: 'jackson.coinPocket',
  from: frontPocketFacing,
  options: {
    //Constant
    coinPocketPleatWidth: 0.154,
    coinPocketPleatPlacement: 0.374,
    //Pockets
    coinPocketPleat: { bool: false, menu: 'pockets.coinPockets' },
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
  }) => {
    //set render
    if (!options.frontPocketsBool || !options.coinPocketBool) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Dalton
    const keepThese = ['daltonGuide', 'bottom']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    // if (options.daltonGuides) {
    // paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    // }
    // delete paths.seam
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Dalton
    macro('title', false)
    //let's begin
    points.coinPocketBottomOut = utils.lineIntersectsCurve(
      points.coinPocketOut,
      points.coinPocketOut.shift(points.waistIn.angle(points.waistOut) + 90, paths.bottom.length()),
      points.frontPocketFacingOut,
      points.frontPocketFacingOutCp2,
      points.frontPocketFacingWaistCp1,
      points.frontPocketFacingWaist
    )
    points.coinPocketBottomIn = utils.lineIntersectsCurve(
      points.coinPocketIn,
      points.coinPocketIn.shift(points.waistIn.angle(points.waistOut) + 90, paths.bottom.length()),
      points.frontPocketFacingOut,
      points.frontPocketFacingOutCp2,
      points.frontPocketFacingWaistCp1,
      points.frontPocketFacingWaist
    )

    const coinPleatWidth =
      points.coinPocketBottomIn.dist(points.coinPocketIn) * options.coinPocketPleatWidth

    if (options.coinPocketPleat) {
      points.coinPocketPleatBottomIn = points.coinPocketIn.shiftFractionTowards(
        points.coinPocketBottomIn,
        options.coinPocketPleatPlacement
      )
      points.coinPocketOut = points.coinPocketBottomOut.shiftOutwards(
        points.coinPocketOut,
        coinPleatWidth * 2
      )
      points.coinPocketIn = points.coinPocketBottomIn.shiftOutwards(
        points.coinPocketIn,
        coinPleatWidth * 2
      )
    }
    //paths
    paths.seam = paths.bottom
      .split(points.coinPocketBottomOut)[1]
      .split(points.coinPocketBottomIn)[0]
      .line(points.coinPocketIn)
      .line(points.coinPocketOut)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.coinPocketOut.shiftFractionTowards(points.coinPocketIn, 0.15)
      points.grainlineTo = utils.beamsIntersect(
        points.grainlineFrom,
        points.coinPocketOut.rotate(90, points.grainlineFrom),
        points.coinPocketBottomOut,
        points.coinPocketOut.rotate(-90, points.coinPocketBottomOut)
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['coinPocketOut', 'coinPocketIn'],
      })
      //title
      points.title = points.coinPocketBottomIn
        .shiftFractionTowards(points.coinPocketIn, 0.25)
        .shift(
          points.coinPocketIn.angle(points.coinPocketOut),
          (points.coinPocketIn.dist(points.coinPocketOut) * 2) / 3
        )
      macro('title', {
        nr: 5,
        title: 'Coin Pocket',
        at: points.title,
        scale: 0.25,
        rotation: 90 - points.coinPocketBottomIn.angle(points.coinPocketIn),
      })
      //pleat
      if (options.coinPocketPleat) {
        points.coinPocketPleatTopIn = points.coinPocketPleatBottomIn.shiftTowards(
          points.coinPocketIn,
          coinPleatWidth * 2
        )
        points.coinPocketPleatIn = points.coinPocketPleatBottomIn.shiftFractionTowards(
          points.coinPocketPleatTopIn,
          0.5
        )
        points.coinPocketPleatBottomOut = points.coinPocketOut.shiftTowards(
          points.coinPocketBottomOut,
          points.coinPocketIn.dist(points.coinPocketPleatBottomIn)
        )
        points.coinPocketPleatTopOut = points.coinPocketPleatBottomOut.shiftTowards(
          points.coinPocketOut,
          coinPleatWidth * 2
        )
        points.coinPocketPleatOut = points.coinPocketPleatBottomOut.shiftFractionTowards(
          points.coinPocketPleatTopOut,
          0.5
        )
        const i = ['PleatTop', 'Pleat', 'PleatBottom']
        for (const p of i) {
          paths['coinPocket' + p] = new Path()
            .move(points['coinPocket' + p + 'Out'])
            .line(points['coinPocket' + p + 'In'])
            .attr('class', 'mark')
            .attr('data-text', p)
            .attr('data-text-class', 'center')
        }
      }
      if (sa) {
        points.saCoinPocketBottomOut = utils.lineIntersectsCurve(
          points.coinPocketOut.shift(points.waistIn.angle(points.waistOut), sa),
          points.coinPocketOut
            .shift(points.waistIn.angle(points.waistOut), sa)
            .shift(points.waistIn.angle(points.waistOut) + 90, paths.bottom.length()),
          points.frontPocketFacingOut,
          points.frontPocketFacingOutCp2,
          points.frontPocketFacingWaistCp1,
          points.frontPocketFacingWaist
        )
        points.saCoinPocketBottomIn = utils.lineIntersectsCurve(
          points.coinPocketIn.shift(points.waistOut.angle(points.waistIn), sa),
          points.coinPocketIn
            .shift(points.waistOut.angle(points.waistIn), sa)
            .shift(points.waistIn.angle(points.waistOut) + 90, paths.bottom.length()),
          points.frontPocketFacingOut,
          points.frontPocketFacingOutCp2,
          points.frontPocketFacingWaistCp1,
          points.frontPocketFacingWaist
        )
        points.saCoinPocketIn = points.coinPocketIn
          .shift(points.waistOut.angle(points.waistIn), sa)
          .shift(points.waistOut.angle(points.waistIn) + 90, sa * 2)

        points.saCoinPocketOut = points.coinPocketOut
          .shift(points.waistIn.angle(points.waistOut), sa)
          .shift(points.waistIn.angle(points.waistOut) - 90, sa * 2)

        paths.sa = paths.bottom
          .split(points.saCoinPocketBottomOut)[1]
          .split(points.saCoinPocketBottomIn)[0]
          .line(points.saCoinPocketIn)
          .line(points.saCoinPocketOut)
          .line(points.saCoinPocketBottomOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
