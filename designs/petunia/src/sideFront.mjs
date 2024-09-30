import { frontBase } from './frontBase.mjs'
import { centreFront } from './centreFront.mjs'
import { pocket } from './pocket.mjs'

export const sideFront = {
  name: 'petunia.sideFront',
  from: frontBase,
  after: [centreFront, pocket],
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
    log,
  }) => {
    //removing paths and snippets not required from Bella
    if (options.daisyGuides) {
      const keepThese = 'daisyGuide'
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.sideHemLeft)
      .curve(points.sideHemLeftCp2, points.sideHemRightCp1, points.sideHemRight)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.sideWaistRight)
      .line(points.sideWaistLeft)
      .line(points.sideHemLeft)
      .unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = points.sideWaistLeft
      points.grainlineTo = new Point(points.grainlineFrom.x, points.sideHemLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      points.grainlineMid = new Point(
        (points.sideWaistLeft.x + points.sideWaistRight.x) / 2,
        points.sideWaistRight.y + ((points.sideHemRight.y - points.sideWaistRight.y) * 4) / 5
      )
      points.grainlineBiasFrom = points.grainlineMid.shift(
        135,
        points.sideWaistRight.dist(points.sideHemRight) * 0.25
      )
      points.grainlineBiasTo = points.grainlineBiasFrom.rotate(180, points.grainlineMid)
      paths.grainlineBias = new Path()
        .move(points.grainlineBiasFrom)
        .line(points.grainlineBiasTo)
        .attr('class', 'note')
        .attr('marker-start', 'url(#grainlineFrom)')
        .attr('marker-end', 'url(#grainlineTo)')
        .attr('data-text', 'Bias Grainline')
        .attr('data-text-class', 'fill-note center')
      //notches
      points.waistNotch = points.sideWaistLeft.shiftTowards(
        points.sideHemLeft,
        points.cfWaistLeft.dist(points.waistDartLeft)
      )
      snippets.waistNotch = new Snippet('notch', points.waistNotch)
      if (options.pocketsBool && store.get('sideSkirtLength') > store.get('pocketLength')) {
        points.pocketOpeningTop = points.sideWaistRight.shiftTowards(
          points.sideHemRight,
          store.get('pocketOpening')
        )
        points.pocketOpeningBottom = points.sideWaistRight.shiftTowards(
          points.sideHemRight,
          store.get('pocketOpeningLength')
        )
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      points.title = new Point(
        (points.sideWaistLeft.x + points.sideWaistRight.x) / 2,
        points.sideWaistRight.y + ((points.sideHemRight.y - points.sideWaistRight.y) * 1) / 3
      )
      macro('title', {
        at: points.title,
        nr: 2,
        title: 'Side Front',
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const hemSa = sa * options.skirtHemWidth * 100

        points.saSideHemRight = utils.beamsIntersect(
          points.sideHemRightCp1
            .shiftTowards(points.sideHemRight, hemSa)
            .rotate(-90, points.sideHemRightCp1),
          points.sideHemRight
            .shiftTowards(points.sideHemRightCp1, hemSa)
            .rotate(90, points.sideHemRight),
          points.sideHemRight
            .shiftTowards(points.sideWaistRight, sideSeamSa)
            .rotate(-90, points.sideHemRight),
          points.sideWaistRight
            .shiftTowards(points.sideHemRight, sideSeamSa)
            .rotate(90, points.sideWaistRight)
        )

        points.saSideWaistRight = utils.beamsIntersect(
          points.saSideHemRight,
          points.saSideHemRight.shift(points.sideHemRight.angle(points.sideWaistRight), 1),
          points.sideWaistRight
            .shiftTowards(points.sideWaistLeft, sa)
            .rotate(-90, points.sideWaistRight),
          points.sideWaistLeft
            .shiftTowards(points.sideWaistRight, sa)
            .rotate(90, points.sideWaistLeft)
        )

        points.saSideWaistLeft = utils.beamsIntersect(
          points.saSideWaistRight,
          points.saSideWaistRight.shift(points.sideWaistRight.angle(points.sideWaistLeft), 1),
          points.sideWaistLeft
            .shiftTowards(points.sideHemLeft, sa)
            .rotate(-90, points.sideWaistLeft),
          points.sideHemLeft.shiftTowards(points.sideWaistLeft, sa).rotate(90, points.sideHemLeft)
        )

        points.saSideHemLeft = points.sideHemLeft
          .shift(points.sideWaistLeft.angle(points.sideHemLeft), hemSa)
          .shift(points.sideHemLeftCp2.angle(points.sideHemLeft), sa)

        if (options.skirtSlit > 0) {
          points.saSlitTopLeft = points.sideHemLeft
            .shiftFractionTowards(points.sideWaistLeft, options.skirtSlit)
            .shift(points.sideHemLeft.angle(points.sideWaistLeft), sa)
            .shift(points.sideHemLeftCp2.angle(points.sideHemLeft), sa)
          points.saSlitTopRight = points.sideHemLeft
            .shiftFractionTowards(points.sideWaistLeft, options.skirtSlit)
            .shift(points.sideHemLeftCp2.angle(points.sideHemLeft), hemSa)
          points.saSlitBottom = points.sideHemLeft
            .shift(points.sideWaistLeft.angle(points.sideHemLeft), hemSa)
            .shift(points.sideHemLeftCp2.angle(points.sideHemLeft), hemSa)
        } else {
          points.saSlitTopLeft = points.saSideHemLeft
          points.saSlitTopRight = points.saSideHemLeft
          points.saSlitBottom = points.saSideHemLeft
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saSideHemRight)
          .line(points.saSideWaistRight)
          .line(points.saSideWaistLeft)
          .line(points.saSlitTopLeft)
          .line(points.saSlitTopRight)
          .line(points.saSlitBottom)
          .line(points.saSideHemLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
