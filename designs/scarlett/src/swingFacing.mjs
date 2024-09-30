import { centreFront } from './centreFront.mjs'
import { placket } from './placket.mjs'

export const swingFacing = {
  name: 'scarlett.swingFacing',
  from: centreFront,
  after: placket,
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
    //Set Render
    if (
      options.waistbandStyle == 'none' ||
      options.closurePosition != 'front' ||
      options.swingPanelStyle != 'connected'
    ) {
      part.hide()
      return part
    }
    //removing paths and snippets
    const keepThese = ['saWaist', 'saLeft']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //measures
    const swingWidth = store.get('swingWidth')
    //let's begin
    points.swingDLeft = paths.saLeft.shiftAlong(store.get('placketLength'))
    points.swingDRight = points.swingDLeft
      .shiftTowards(points.dartTipD, swingWidth)
      .rotate(-90, points.swingDLeft)
    points.swingDartTipD = points.dartTipD
      .shiftTowards(points.waistD, swingWidth)
      .rotate(-90, points.dartTipD)
    points.swingDartTipDCp2 = points.dartTipDCp
      .shiftTowards(points.waistD, swingWidth)
      .rotate(-90, points.dartTipDCp)
    points.swingWaist0LeftCp1 = points.waist0LeftCp2
      .shiftTowards(points.waist0Left, swingWidth)
      .rotate(-90, points.waist0LeftCp2)
    points.swingWaist0Left = points.waist0Left.shiftTowards(points.waist0LeftCp1, swingWidth)

    points.waistSplit = utils.lineIntersectsCurve(
      points.swingWaist0LeftCp1,
      points.swingWaist0LeftCp1.shiftOutwards(points.swingWaist0Left, store.get('placketLength')),
      points.waistPanel0,
      points.waistPanel0Cp2,
      points.waist0LeftCp1,
      points.waist0Left
    )

    paths.saRight = new Path()
      .move(points.swingDRight)
      .line(points.swingDartTipD)
      .curve(points.swingDartTipDCp2, points.swingWaist0LeftCp1, points.swingWaist0Left)
      .line(points.waistSplit)
      .hide()

    paths.saWaist = paths.saWaist.split(points.waistSplit)[1].hide()

    paths.saLeft = new Path()
      .move(points.waist0Left)
      .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
      .line(points.swingDLeft)
      .hide()

    paths.seam = new Path()
      .move(points.swingDLeft)
      .line(points.swingDRight)
      .join(paths.saRight)
      .join(paths.saWaist)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.swingDLeft.shiftFractionTowards(points.swingDRight, 0.75)
      points.grainlineFrom = utils.beamsIntersect(
        points.grainlineTo,
        points.swingDRight.rotate(90, points.grainlineTo),
        points.waist0LeftCp2,
        points.waist0LeftCp2.shift(points.swingDLeft.angle(points.swingDRight), 1)
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.dartTipD.shiftFractionTowards(points.swingDartTipD, 0.15)
      macro('title', {
        nr: 8,
        title: 'Swing Facing',
        at: points.title,
        cutNr: 2,
        rotation: points.swingDLeft.angle(points.dartTipD) * -1 - 270,
        scale: 0.2,
      })
      if (sa) {
        const sideFrontSa = store.get('sideFrontSa')

        points.saSwingDLeft = points.swingDLeft
          .shift(points.dartTipD.angle(points.swingDLeft), sa)
          .shift(points.swingDRight.angle(points.swingDLeft), sideFrontSa)

        points.saSwingDRight = points.swingDRight
          .shift(points.swingDartTipD.angle(points.swingDRight), sa)
          .shift(points.swingDLeft.angle(points.swingDRight), sa)

        points.saWaistSplit = utils.beamsIntersect(
          paths.saRight.offset(sa).shiftFractionAlong(0.995),
          paths.saRight.offset(sa).end(),
          paths.saWaist.offset(sa).start(),
          paths.saWaist.offset(sa).shiftFractionAlong(0.005)
        )

        paths.sa = new Path()
          .move(points.saSwingDLeft)
          .line(points.saSwingDRight)
          .join(paths.saRight.offset(sa))
          .line(points.saWaistSplit)
          .join(paths.saWaist.offset(sa))
          .line(points.saWaist0Left)
          .join(paths.saLeft.offset(sideFrontSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
