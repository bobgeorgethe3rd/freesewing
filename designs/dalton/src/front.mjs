import { front as frontTitan } from '@freesewing/titan'

export const front = {
  name: 'front',
  from: frontTitan,
  hideDependencies: true,
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
    //removing paths and snippets not required from Titan
    // for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Titan
    macro('title', false)
    macro('scalebox', false)
    delete paths.grainline
    //seam paths

    if (complete) {
      //grainline
      points.grainlineTo = points.floorIn.shiftFractionTowards(points.floor, 1 / 3)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crotchSeamCurveCp2.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.notch = new Snippet('notch', points.crotchSeamCurveStart)
      //title
      points.title = points.knee.shiftFractionTowards(points.kneeOut, 0.25)
      macro('title', {
        nr: 2,
        title: 'Front',
        at: points.title,
      })

      //Fit Guides
      if (options.fitGuides) {
        points.waistGuideIn = points.styleWaistIn.shiftFractionTowards(points.styleWaistOut, 3 / 40)
        points.waistGuideOut = points.waistGuideIn.shiftFractionTowards(points.styleWaistOut, 1 / 3)

        if (measurements.waistToHips * options.waistHeight - absoluteOptions.waistbandWidth > 0) {
          points.hipsGuideOut = points.waistGuideOut
            .shiftTowards(
              points.waistGuideIn,
              measurements.waistToHips * options.waistHeight - absoluteOptions.waistbandWidth
            )
            .rotate(-90, points.waistGuideOut)
          points.hipsGuideIn = points.hipsGuideOut.shift(
            points.waistGuideOut.angle(points.waistGuideIn),
            points.waistGuideOut.dist(points.waistGuideIn)
          )
          paths.hipsGuide = new Path()
            .move(points.hipsGuideOut)
            .line(points.hipsGuideIn)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          macro('sprinkle', {
            snippet: 'notch',
            on: ['hipsGuideOut', 'hipsGuideIn'],
          })
        }

        points.seatGuideOut = points.waistGuideOut
          .shiftTowards(
            points.waistGuideIn,
            measurements.waistToSeat -
              measurements.waistToHips * (1 - options.waistHeight) -
              absoluteOptions.waistbandWidth
          )
          .rotate(-90, points.waistGuideOut)
        points.seatGuideIn = points.seatGuideOut.shift(
          points.waistGuideOut.angle(points.waistGuideIn),
          points.waistGuideOut.dist(points.waistGuideIn)
        )

        points.kneeGuideOut = points.kneeOut
        points.kneeGuideIn = points.kneeGuideOut.shiftTowards(
          points.kneeIn,
          points.waistGuideOut.dist(points.waistGuideIn)
        )

        paths.seatGuide = new Path()
          .move(points.seatGuideOut)
          .line(points.seatGuideIn)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

        paths.kneeGuide = new Path()
          .move(points.kneeGuideOut)
          .line(points.kneeGuideIn)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'left')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['seatGuideOut', 'seatGuideIn', 'kneeGuideOut', 'kneeGuideIn'],
        })
      }
    }

    return part
  },
}
