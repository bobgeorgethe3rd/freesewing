import { frontBaseBustShoulder } from './frontBaseBustShoulder.mjs'

export const frontFacingBustShoulder = {
  name: 'sammie.frontFacingBustShoulder',
  draft: (sh) => {
    const {
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
      utils,
      measurements,
      part,
      snippets,
      Snippet,
    } = sh

    frontBaseBustShoulder.draft(sh)
    //removing paths and snippets not required from Daisy
    //keep specific inherited paths
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //guides
    // paths.daisyGuides = new Path()
    // .move(points.cfWaist)
    // .line(points.waistDartLeft)
    // .line(points.waistDartTip)
    // .line(points.waistDartRight)
    // .line(points.sideWaist)
    // .line(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.bustDartBottom)
    // .line(points.bust)
    // .line(points.bustDartTop)
    // .line(points.hps)
    // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    // .line(points.cfWaist)
    // .attr('class', 'various lashed')
    //measures
    const angle = /* store.get('bustDartAngle') +  */ store.get('contourAngle')
    //let's begin
    points.neckFrontFacing = points.neckFront.shiftFractionTowards(
      points.bust,
      options.bodiceFacingWidth
    )
    const bodiceFacingWidth = points.neckFront.dist(points.neckFrontFacing)
    points.cfFacing = points.cfTop.shiftTowards(points.cfWaist, bodiceFacingWidth)
    points.sideFacing = points.armholeDrop.shiftTowards(points.sideWaist, bodiceFacingWidth)

    const rot = ['sideFacing', 'armholeDrop', 'armholeDropCp', 'neckSideFrontCp', 'neckSideFront']
    for (const p of rot) points[p] = points[p].rotate(angle, points.bust)

    points.sideFacingCp = utils.beamsIntersect(
      points.sideFacing,
      points.sideFacing.shift(points.armholeDrop.angle(points.armholeDropCp), 1),
      points.armholeDropCp,
      points.armholeDropCp.shift(points.armholeDrop.angle(points.sideFacing), 1)
    )

    if (options.frontAngle == 0) {
      points.neckFrontFacingCp1 = new Point(points.neckFrontCp.x, points.neckFrontFacing.y)
      points.neckFrontFacingCp2 = new Point(points.neckSideFrontCp.x, points.neckFrontFacing.y)
    } else {
      points.neckFrontFacingCp1 = utils.beamsIntersect(
        points.cfFacing,
        points.cfFacing.shift(points.cfTop.angle(points.neckFrontCp), 1),
        points.neckFrontFacing,
        points.neckFrontFacing.shift(points.neckFront.angle(points.neckFrontCp), 1)
      )
      points.neckFrontFacingCp2 = utils.beamsIntersect(
        points.neckFrontFacing,
        points.neckFrontFacing.shift(points.neckFront.angle(points.neckSideFrontCp), 1),
        points.neckSideFrontCp,
        points.neckSideFront.rotate(90, points.neckSideFrontCp)
      )
    }

    //paths
    paths.waist = new Path()
      .move(points.cfFacing)
      ._curve(points.neckFrontFacingCp1, points.neckFrontFacing)
      .curve(points.neckFrontFacingCp2, points.sideFacingCp, points.sideFacing)
      .hide()

    paths.sideSeam = new Path().move(points.sideFacing).line(points.armholeDrop).hide()

    paths.topCurve = new Path()
      .move(points.armholeDrop)
      .curve(points.armholeDropCp, points.neckSideFrontCp, points.neckSideFront)
      .curve_(points.neckFrontCp, points.cfTop)
      .hide()

    paths.cf = new Path().move(points.cfTop).line(points.cfFacing).hide()

    paths.seam = paths.waist
      .clone()
      .join(paths.sideSeam)
      .join(paths.topCurve)
      .join(paths.cf)
      .close()

    //stores
    store.set('bodiceFacingWidth', bodiceFacingWidth)

    if (complete) {
      //grainline
      if (options.closurePosition == 'front' || options.cfSaWidth > 0) {
        points.grainlineFrom = new Point(points.cfNeckCp1.x * 0.25, points.cfTop.y)
        points.grainlineTo = new Point(
          points.grainlineFrom.x,
          points.cfTop.shiftFractionTowards(points.cfFacing, 0.75).y
        )
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      } else {
        points.cutOnFoldFrom = points.cfTop
        points.cutOnFoldTo = points.cfTop.shiftFractionTowards(points.cfFacing, 0.75)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      }
      //title
      points.title = points.neckFront.shiftFractionTowards(points.neckFrontFacing, 0.55)
      macro('title', {
        at: points.title,
        nr: '5',
        title: 'Front Facing',
        scale: 0.5,
      })
      if (sa) {
        const bodiceFacingHem = sa * options.bodiceFacingHemWidth * 100
        const closureSa = sa * options.closureSaWidth * 100
        let cfSa
        if (options.closurePosition == 'front') {
          cfSa = closureSa
        } else {
          cfSa = sa * options.cfSaWidth * 100
        }

        let sideSeamSa
        if (
          options.closurePosition == 'side' ||
          options.closurePosition == 'sideLeft' ||
          options.closurePosition == 'sideRight'
        ) {
          sideSeamSa = closureSa
        } else {
          sideSeamSa = sa * options.sideSeamSaWidth * 100
        }

        points.saSideFacing = utils.beamsIntersect(
          points.sideFacingCp
            .shiftTowards(points.sideFacing, bodiceFacingHem)
            .rotate(-90, points.sideFacingCp),
          points.sideFacing
            .shiftTowards(points.sideFacingCp, bodiceFacingHem)
            .rotate(90, points.sideFacing),
          points.sideFacing
            .shiftTowards(points.armholeDrop, sideSeamSa)
            .rotate(-90, points.sideFacing),
          points.armholeDrop
            .shiftTowards(points.sideFacing, sideSeamSa)
            .rotate(90, points.armholeDrop)
        )

        points.saArmholeDrop = utils.beamsIntersect(
          points.sideFacing
            .shiftTowards(points.armholeDrop, sideSeamSa)
            .rotate(-90, points.sideFacing),
          points.armholeDrop
            .shiftTowards(points.sideFacing, sideSeamSa)
            .rotate(90, points.armholeDrop),
          points.armholeDrop.shiftTowards(points.armholeDropCp, sa).rotate(-90, points.armholeDrop),
          points.armholeDropCp.shiftTowards(points.armholeDrop, sa).rotate(90, points.armholeDropCp)
        )

        points.hemStart = paths.waist.offset(bodiceFacingHem).start()

        points.saCfFacing = utils.beamsIntersect(
          points.cfTop.shiftTowards(points.cfFacing, cfSa).rotate(-90, points.cfTop),
          points.cfFacing.shiftTowards(points.cfTop, cfSa).rotate(90, points.cfFacing),
          points.hemStart,
          points.cfFacing.rotate(90, points.hemStart)
        )

        paths.sa = paths.waist
          .offset(bodiceFacingHem)
          .line(points.saSideFacing)
          .line(paths.sideSeam.offset(sideSeamSa).start())
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeDrop)
          .line(paths.topCurve.offset(sa).start())
          .join(paths.topCurve.offset(sa))
          .line(paths.cf.offset(cfSa).start())
          .join(paths.cf.offset(cfSa))
          .line(points.saCfFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
