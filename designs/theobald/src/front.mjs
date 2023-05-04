import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'theobald.front',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Style
    frontPleats: { bool: false, menu: 'style' },
    frontPleatDistance: { pct: 4.7, min: 3, max: 6, menu: 'style' },
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketOpeningStyle: {
      dflt: 'slanted',
      list: ['inseam', 'slanted'],
      menu: 'pockets.frontPockets',
    },
    //Construction
    crotchSeamSaWidth: { pct: 1, min: 1, max: 4, menu: 'construction' },
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
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    //measurements
    const frontPleatWidth = store.get('frontPleatWidth')
    const frontPleatDistance = measurements.waist * options.frontPleatDistance + frontPleatWidth
    //draw guides
    let suffix
    if (options.frontPleats) {
      suffix = 'R'
    } else {
      suffix = ''
    }

    const drawInseam = () => {
      if (options.fitKnee || options.fitFloor) {
        if (options.frontPleats || options.fitFloor) {
          return new Path()
            .move(points.floorIn)
            .curve_(points['floorInCp2' + suffix], points['kneeIn' + suffix])
            .curve(
              points['kneeInCp2' + suffix],
              points['forkCp1' + suffix],
              points['fork' + suffix]
            )
        } else {
          return new Path()
            .move(points.floorIn)
            .line(points.kneeIn)
            .curve(points.kneeInCp2, points.forkCp1, points.fork)
        }
      } else {
        return new Path()
          .move(points.floorIn)
          .curve(points.kneeInCp2, points['forkCp1' + suffix], points['fork' + suffix])
      }
    }
    paths.crotch = new Path()
      .move(points['fork' + suffix])
      .curve(
        points['crotchSeamCurveCp1' + suffix],
        points['crotchSeamCurveCp2' + suffix],
        points['crotchSeamCurveStart' + suffix]
      )
      .line(points['styleWaistIn' + suffix])
      .hide()

    const drawWaistSeam = () => {
      if (options.frontPocketOpeningStyle == 'slanted' && options.frontPocketsBool) {
        return new Path()
          .move(points['styleWaistIn' + suffix])
          .line(points['frontPocketOpeningWaist' + suffix])
          .line(points['frontPocketOpeningOut' + suffix])
      } else {
        return new Path()
          .move(points['styleWaistIn' + suffix])
          .line(points['styleWaistOut' + suffix])
      }
    }

    const drawOutseam = () => {
      let waistOut = points['styleWaistOut' + suffix] || points['waistOut' + suffix]
      if (options.fitKnee || options.fitFloor) {
        if (options.frontPleats || options.fitFloor) {
          if (points.waistOut.x < points.seatOut.x)
            return new Path()
              .move(waistOut)
              .curve(
                points['seatOut' + suffix],
                points['kneeOutCp1' + suffix],
                points['kneeOut' + suffix]
              )
              ._curve(points['floorOutCp1' + suffix], points.floorOut)
          else
            return new Path()
              .move(waistOut)
              ._curve(points['seatOutCp1' + suffix], points['seatOut' + suffix])
              .curve(
                points['seatOutCp2' + suffix],
                points['kneeOutCp1' + suffix],
                points['kneeOut' + suffix]
              )
              ._curve(points['floorOutCp1' + suffix], points.floorOut)
        } else {
          if (points.waistOut.x < points.seatOut.x)
            return new Path()
              .move(waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .line(points.floorOut)
          else
            return new Path()
              .move(waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .line(points.floorOut)
        }
      } else {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOut)
            .curve(points['seatOut' + suffix], points.kneeOutCp1, points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points['seatOutCp1' + suffix], points['seatOut' + suffix])
            .curve(points['seatOutCp2' + suffix], points.kneeOutCp1, points.floorOut)
      }
    }

    if (options.frontPocketOpeningStyle == 'slanted' && options.frontPocketsBool) {
      paths.outSeam = drawOutseam()
        .split(points['frontPocketOpeningOut' + suffix])[1]
        .hide()
    } else {
      paths.outSeam = drawOutseam().hide()
    }

    //let's begin
    //paths
    paths.hemBase = new Path().move(points.floorOut).line(points.floorIn).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(drawInseam())
      .join(paths.crotch)
      .join(drawWaistSeam())
      .join(paths.outSeam)

    if (complete) {
      //grainline
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      if (options.frontPocketOpeningStyle == 'inseam' || !options.frontPocketsBool) {
        snippets.frontPocketOpening = new Snippet('notch', points['frontPocketOpening' + suffix])
      }

      macro('sprinkle', {
        snippet: 'notch',
        on: ['flyShieldCrotch' + suffix, 'frontPocketOpeningOut' + suffix],
      })
      //title
      macro('title', {
        nr: 2,
        title: 'Front',
        at: points.title,
      })
      //Fit Guides
      if (options.fitGuides) {
        if (points.hipsGuideIn) {
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
      //pleats
      if (options.frontPleats) {
        points.pleatMidTop0 = utils.beamsIntersect(
          points.floor,
          points.knee,
          points.styleWaistInR,
          points.styleWaistOutR
        )

        points.pleatMidTop1 = points.pleatMidTop0.shiftTowards(
          points.styleWaistOutR,
          frontPleatDistance
        )

        for (let i = 0; i < 2; i++) {
          points['pleatFromTop' + i] = points['pleatMidTop' + i].shiftTowards(
            points.styleWaistOutR,
            frontPleatWidth / 2
          )
          points['pleatToTop' + i] = points['pleatMidTop' + i].shiftTowards(
            points.styleWaistInR,
            frontPleatWidth / 2
          )
          points['pleatFromBottom' + i] = points['pleatFromTop' + i]
            .shiftTowards(points.styleWaistOutR, frontPleatWidth * 2)
            .rotate(90, points['pleatFromTop' + i])
          points['pleatMidBottom' + i] = points['pleatMidTop' + i]
            .shiftTowards(points.styleWaistOutR, frontPleatWidth * 2)
            .rotate(90, points['pleatMidTop' + i])
          points['pleatToBottom' + i] = points['pleatToTop' + i]
            .shiftTowards(points.styleWaistOutR, frontPleatWidth * 2)
            .rotate(90, points['pleatToTop' + i])

          paths['pleatFrom' + i] = new Path()
            .move(points['pleatFromTop' + i])
            .line(points['pleatFromBottom' + i])
            .attr('class', 'fabric help')

          paths['pleatMid' + i] = new Path()
            .move(points['pleatMidTop' + i])
            .line(points['pleatMidBottom' + i])

          paths['pleatTo' + i] = new Path()
            .move(points['pleatToTop' + i])
            .line(points['pleatToBottom' + i])
            .attr('class', 'fabric help')
        }
      }
      if (sa) {
        paths.sa = paths.hemBase
          .clone()
          .offset(sa * options.hemWidth * 100)
          .join(drawInseam().offset(sa * options.inseamSaWidth * 100))
          .join(paths.crotch.offset(sa * options.crotchSeamSaWidth * 100))
          .join(drawWaistSeam().offset(sa))
          .join(paths.outSeam.offset(sa * options.outSeamSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
