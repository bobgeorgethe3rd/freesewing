import { frontBaseShoulder } from './frontBaseShoulder.mjs'

export const frontShoulder = {
  name: 'sammie.frontShoulder',
  // from: frontBaseShoulder,
  // hide: {
  // from: true,
  // inherited: true,
  // },
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

    frontBaseShoulder.draft(sh)
    //removing paths and snippets not required from Daisy
    //keep specific inherited paths
    const keepThese = 'daisyGuides'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //guides
    if (!options.daisyGuides) {
      delete paths.daisyGuides
    }
    //let's begin
    //paths
    paths.waist = new Path().move(points.cfWaist).line(points.waistDartLeft).hide()

    paths.sideFrontSeam = new Path()
      .move(points.waistDartLeft)
      .curve(points.waistDartLeftCp, points.bustCp1, points.bust)
      .curve_(points.bustCp2, points.neckFront)
      .hide()

    paths.topCurve = new Path()
      .move(points.neckFront)
      .curve_(points.neckFrontCp, points.cfTop)
      .hide()

    paths.cf = new Path().move(points.cfTop).line(points.cfWaist).hide()

    paths.seam = paths.waist
      .clone()
      .join(paths.sideFrontSeam)
      .join(paths.topCurve)
      .join(paths.cf)
      .close()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition == 'front' || options.cfSaWidth > 0) {
        points.grainlineFrom = new Point(points.cfNeckCp1.x * 0.25, points.cfTop.y)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cfWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      } else {
        points.cutOnFoldFrom = points.cfTop
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      }
      ///notches
      if (!options.sweetheart || (options.sweetheart && options.heartDrop < 1)) {
        snippets.cfChest = new Snippet('notch', points.cfChest)
      }
      //title
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Front',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      if (sa) {
        const styleLineSa = sa * options.styleLinesSaWidth * 100
        let cfSa
        if (options.closurePosition == 'front') {
          cfSa = sa * options.closureSaWidth * 100
        } else {
          cfSa = sa * options.cfSaWidth * 100
        }

        points.saWaistDartLeft = points.waistDartLeft.translate(styleLineSa, sa)
        points.saNeckFront = utils.beamsIntersect(
          points.bustCp2.shiftTowards(points.neckFront, styleLineSa).rotate(-90, points.bustCp2),
          points.neckFront.shiftTowards(points.bustCp2, styleLineSa).rotate(90, points.neckFront),
          points.neckFront.shiftTowards(points.cfTopAnchor, sa).rotate(-90, points.neckFront),
          points.cfTopAnchor.shiftTowards(points.neckFront, sa).rotate(90, points.cfTopAnchor)
        )

        paths.sa = paths.waist
          .clone()
          .offset(sa)
          .line(points.saWaistDartLeft)
          .line(paths.sideFrontSeam.offset(styleLineSa).start())
          .join(paths.sideFrontSeam.offset(styleLineSa))
          .line(points.saNeckFront)
          .line(paths.topCurve.offset(sa).start())
          .join(paths.topCurve.offset(sa))
          .join(paths.cf.offset(cfSa))
          .line(points.saCfWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
