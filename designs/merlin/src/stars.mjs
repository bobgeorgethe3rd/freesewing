import { pctBasedOn } from '@freesewing/core'
import { apBase } from './apBase.mjs'

export const stars = {
  name: 'merlin.stars',
  options: {
    //Appliques
    appliques: { bool: true, menu: 'appliques' },
    appliqueNumber: { count: 5, min: 3, max: 20, menu: 'appliques' },
    appliqueLength: {
      pct: 4.9,
      min: 4.9,
      max: 8.2,
      snap: 5,
      ...pctBasedOn('head'),
      menu: 'appliques',
    },
    appliqueIncrement: {
      pct: 3.3,
      min: 1.5,
      max: 8.2,
      snap: 5,
      ...pctBasedOn('head'),
      menu: 'appliques',
    },
    //Construction
    appliqueSaWidth: { pct: 1, min: 0, max: 1.5, menu: 'construction' },
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
    //set render
    if (!options.appliques) {
      part.hide()
      return part
    }
    //measures
    const appliqueNumber = options.appliqueNumber
    const appliqueLength = absoluteOptions.appliqueLength
    const appliqueIncrement = absoluteOptions.appliqueIncrement
    const appliqueSa = sa * options.appliqueSaWidth * 100
    //draft base
    apBase(part, appliqueNumber, appliqueLength, appliqueIncrement, appliqueSa, true)

    //star points
    for (let i = 0; i < appliqueNumber; i++) {
      //the goal is for the star width to be what the snap options decide hence the /Math.sin(72)
      const starWidth = appliqueLength + appliqueIncrement * i
      points['starTip1' + i] = points['origin' + i].shift(
        90,
        starWidth / 2 / Math.sin(utils.deg2rad(72))
      )

      for (let j = 1; j <= 4; j++) {
        points['starTip' + (j + 1) + i] = points['starTip1' + i].rotate(
          72 * j,
          points['origin' + i]
        )

        if (j == 1) {
          const starLegLength =
            points['starTip1' + i].dist(points['starTip2' + i]) /
            2 /
            Math.cos(utils.deg2rad(points['starTip2' + i].angle(points['starTip1' + i])))
          points['starCorner1' + i] = points['starTip2' + i].shift(0, starLegLength)
        }

        points['starCorner' + (j + 1) + i] = points['starCorner1' + i].rotate(
          72 * j,
          points['origin' + i]
        )
      }

      //paths
      paths['seam' + i] = new Path()
        .move(points['starTip1' + i])
        .line(points['starCorner1' + i])
        .line(points['starTip2' + i])
        .line(points['starCorner2' + i])
        .line(points['starTip3' + i])
        .line(points['starCorner3' + i])
        .line(points['starTip4' + i])
        .line(points['starCorner4' + i])
        .line(points['starTip5' + i])
        .line(points['starCorner5' + i])
        .line(points['starCorner5' + i])
        .line(points['starTip1' + i])
        .close()
      if (complete) {
        //title
        points['title' + i] = new Point(points['starCorner1' + i].x, points['origin' + i].y)
        macro('title', {
          at: points['title' + i],
          nr: 4,
          title: 'Star (' + utils.units(starWidth) + ')',
          prefix: i,
          cutNr: false,
          scale: (i + 1) * 0.075,
        })

        if (sa && options.appliqueSaWidth > 0) {
          const saStarAngle = points['starCorner1' + i].angle(points['starTip1' + i])

          // points['saStarCorner1' + i] = points['starCorner1' + i].shift(180, sa).shift(saStarAngle, sa / Math.cos(utils.deg2rad(90 - saStarAngle)))
          points['saStarCorner1' + i] = utils.beamsIntersect(
            points['origin' + i],
            points['starCorner1' + i],
            points['starCorner1' + i].shift(90, appliqueSa),
            points['starCorner1' + i].translate(-1, -appliqueSa)
          )

          points['saStarTipLeft1' + i] = points['starTip1' + i]
            .shiftTowards(points['starCorner1' + i], appliqueSa)
            .rotate(-90, points['starTip1' + i])
          points['saStarTipRight1' + i] = points['saStarTipLeft1' + i].flipX(points['origin' + i])
          points['saStarTip1' + i] = points['starTip1' + i].shift(90, appliqueSa)

          for (let j = 1; j <= 4; j++) {
            points['saStarCorner' + (j + 1) + i] = points['saStarCorner1' + i].rotate(
              72 * j,
              points['origin' + i]
            )
            points['saStarTipLeft' + (j + 1) + i] = points['saStarTipLeft1' + i].rotate(
              72 * j,
              points['origin' + i]
            )
            points['saStarTipRight' + (j + 1) + i] = points['saStarTipRight1' + i].rotate(
              72 * j,
              points['origin' + i]
            )
            points['saStarTip' + (j + 1) + i] = points['saStarTip1' + i].rotate(
              72 * j,
              points['origin' + i]
            )
          }

          paths['sa' + i] = new Path()
            .move(points['saStarTipRight1' + i])
            .line(points['saStarTip1' + i])
            .line(points['saStarTipLeft1' + i])
            .line(points['saStarCorner1' + i])
            .line(points['saStarTipRight2' + i])
            .line(points['saStarTip2' + i])
            .line(points['saStarTipLeft2' + i])
            .line(points['saStarCorner2' + i])
            .line(points['saStarTipRight3' + i])
            .line(points['saStarTip3' + i])
            .line(points['saStarTipLeft3' + i])
            .line(points['saStarCorner3' + i])
            .line(points['saStarTipRight4' + i])
            .line(points['saStarTip4' + i])
            .line(points['saStarTipLeft4' + i])
            .line(points['saStarCorner4' + i])
            .line(points['saStarTipRight5' + i])
            .line(points['saStarTip5' + i])
            .line(points['saStarTipLeft5' + i])
            .line(points['saStarCorner5' + i])
            .line(points['saStarTipRight1' + i])
            .close()
            .attr('class', 'fabric sa')
        }
      }
      if (paperless) {
        macro('hd', {
          from: points['starTip2' + i],
          to: points['starTip5' + i],
          y: points['starTip1' + i].y - appliqueSa,
        })

        macro('vd', {
          from: points['starTip1' + i],
          to: points['starTip3' + i],
          x: points['starTip2' + i].x - appliqueSa,
        })
      }
    }

    return part
  },
}
