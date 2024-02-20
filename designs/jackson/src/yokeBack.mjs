import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const yokeBack = {
  name: 'jackson.yokeBack',
  from: backBase,
  after: back,
  hide: {
    from: true,
  },
  plugins: [pluginLogoRG],
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
    log,
    absoluteOptions,
  }) => {
    //set render
    if (!options.yoke) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Dalton
    const keepThese = ['crossSeam', 'seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Dalton
    macro('title', false)
    macro('scalebox', false)
    //measures
    const backDartAngle = points.dartTip.angle(points.dartIn) - points.dartTip.angle(points.dartOut)

    const rot = [
      'floorOut',
      'floorOutCp2',
      'kneeOut',
      'kneeOutCp2',
      'seatOutCp1',
      'seatOut',
      'seatOutCp2',
      'waistOut',
      'yokeOut',
    ]
    for (const p of rot) points[p + 'R'] = points[p].rotate(backDartAngle, points.dartTip)
    //paths
    const drawOutseamR = () => {
      if (options.fitKnee) {
        if (points.seatOutAnchor.x > points.seatOut.x)
          return new Path()
            .move(points.floorOutR)
            .curve_(points.floorOutCp2R, points.kneeOutR)
            .curve(points.kneeOutCp2R, points.seatOutR, points.waistOutR)
        else
          return new Path()
            .move(points.floorOutR)
            .curve_(points.floorOutCp2R, points.kneeOutR)
            .curve(points.kneeOutCp2R, points.seatOutCp1R, points.seatOutR)
            .curve_(points.seatOutCp2R, points.waistOutR)
      } else {
        if (points.seatOutAnchor.x > points.seatOut.x)
          return new Path()
            .move(points.floorOutR)
            .curve(points.floorOutCp2R, points.seatOutR, points.waistOutR)
        else
          return new Path()
            .move(points.floorOutR)
            .curve(points.floorOutCp2R, points.seatOutCp1R, points.seatOutR)
            .curve_(points.seatOutCp2R, points.waistOutR)
      }
    }

    paths.yoke = new Path()
      .move(points.yokeIn)
      .curve(points.dartTip, points.dartTip, points.yokeOutR)
      .hide()

    paths.outSeamR = drawOutseamR().split(points.yokeOutR)[1].hide()

    paths.waist = new Path()
      .move(points.waistOutR)
      .curve(points.dartIn, points.dartIn, points.waistIn)
      .hide()

    paths.crossSeam = paths.crossSeam.split(points.yokeIn)[0].hide()

    paths.seam = paths.yoke
      .clone()
      .join(paths.outSeamR)
      .join(paths.waist)
      .join(paths.crossSeam)
      .close()

    //stores
    store.get('waistbandBack', paths.yoke.length())

    if (complete) {
      //grainline
      points.grainlineFrom = points.dartIn.shiftFractionTowards(
        new Point(points.dartIn.x, points.dartTip.y),
        0.15
      )
      points.grainlineTo = new Point(points.dartIn.x, points.dartTip.y).shiftFractionTowards(
        points.dartIn,
        0.15
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      //title
      points.title = new Point(
        points.waistIn.shiftFractionTowards(points.dartIn, 0.5).x,
        points.dartIn.shiftFractionTowards(points.dartTip, 1 / 3).y
      )
      macro('title', {
        at: points.title,
        nr: 3,
        title: 'Yoke Back',
        scale: 0.25,
      })
      if (sa) {
        const yokeSeamSa = sa * options.yokeSeamSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const crossSeamSa = sa * options.crossSeamSaWidth * 100

        points.saYokeOutR = utils.beamsIntersect(
          points.dartTip.shiftTowards(points.yokeOutR, yokeSeamSa).rotate(-90, points.dartTip),
          points.yokeOutR.shiftTowards(points.dartTip, yokeSeamSa).rotate(90, points.yokeOutR),
          paths.outSeamR.offset(sideSeamSa).start(),
          paths.outSeamR.offset(sideSeamSa).shiftFractionAlong(0.01)
        )
        points.saWaistOutR = points.saWaistOut.rotate(backDartAngle, points.dartTip)

        points.saYokeIn = utils.beamsIntersect(
          paths.crossSeam.offset(crossSeamSa).end(),
          paths.crossSeam.offset(crossSeamSa).shiftFractionAlong(0.99),
          points.yokeIn.shiftTowards(points.dartTip, yokeSeamSa).rotate(-90, points.yokeIn),
          points.dartTip.shiftTowards(points.yokeIn, yokeSeamSa).rotate(90, points.dartTip)
        )

        paths.sa = paths.yoke
          .offset(yokeSeamSa)
          .line(points.saYokeOutR)
          .join(paths.outSeamR.offset(sideSeamSa))
          .line(points.saWaistOutR)
          .join(paths.waist.offset(sa))
          .line(points.saWaistIn)
          .line(points.saYokeIn)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
