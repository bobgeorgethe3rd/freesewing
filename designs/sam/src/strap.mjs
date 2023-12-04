import { front } from '@freesewing/sammie'

export const strap = {
  name: 'sam.strap',
  from: front,
  options: {
    //Style
    strapWidth: { pct: 11.1, min: 10, max: 15, menu: 'style' },
    strapBottomWidth: { pct: 60, min: 0, max: 75, menu: 'style' },
    //Construction
    strap: { bool: true, menu: 'construction' },
    cbStrapSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
  },
  draft: (sh) => {
    const {
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
    } = sh
    //render
    if (!options.strap) {
      part.hide()
      return part
    }
    //remove paths and snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    macro('title', false)
    //measurements
    const strapWidth = points.cfWaist.y * options.strapWidth
    //rotate
    const rot = ['armholeDrop', 'armholeDropCp', 'neckSideFrontCp', 'neckSideFront']
    for (const p of rot)
      points[p] = points[p].rotate(
        store.get('bustDartAngle') + store.get('contourAngle'),
        points.bust
      )
    //let's begin
    points.cbNeckCp1 = points.hps.shift(
      90,
      points.hps.dist(
        utils.beamsIntersect(
          points.hps,
          points.shoulder.rotate(
            (180 - (points.hps.angle(points.shoulder) - 270)) * -1,
            points.hps
          ),
          points.cbNeck,
          points.cbNeck.shift(0, 1)
        )
      )
    )
    points.cbNeck = points.cbNeck.rotate(
      (180 - points.shoulder.angle(points.hps)) * -2,
      utils.beamsIntersect(points.cbNeck, points.cbNeck.shift(0, 1), points.shoulder, points.hps)
    )
    points.cbStrap = points.cbNeck
      .shiftTowards(points.cbNeckCp1, strapWidth)
      .rotate(90, points.cbNeck)
    points.strapHps = points.hps.shiftTowards(points.neckFront, strapWidth).rotate(90, points.hps)
    points.cbStrapCp1 = utils.beamIntersectsX(
      points.cbStrap,
      points.cbNeck.rotate(90, points.cbStrap),
      points.strapHps.x
    )
    points.strapNeckFront = points.neckFront
      .shiftTowards(points.hpsCp2, strapWidth * (1 + options.strapBottomWidth))
      .rotate(-90, points.neckFront)
    points.strapHpsCp1Anchor = points.neckFront
      .shiftTowards(points.hpsCp2, strapWidth)
      .rotate(-90, points.neckFront)
    points.strapHpsCp1 = utils.beamIntersectsX(
      points.strapHpsCp1Anchor,
      points.neckFront.rotate(-90, points.strapHpsCp1Anchor),
      points.strapHps.x
    )
    points.strapSplit = utils.lineIntersectsCurve(
      points.strapHpsCp1,
      points.strapHpsCp1.shiftFractionTowards(points.strapNeckFront, 10),
      points.armholeDrop,
      points.armholeDropCp,
      points.neckSideFrontCp,
      points.neckFront
    )
    //paths
    paths.saLeft = new Path()
      .move(points.cbNeck)
      .curve_(points.cbNeckCp1, points.hps)
      .curve_(points.hpsCp2, points.neckSideFront)
      .hide()

    paths.saBottom = new Path()
      .move(points.neckSideFront)
      .curve(points.neckSideFrontCp, points.armholeDropCp, points.armholeDrop)
      .split(points.strapSplit)[0]
      .hide()

    paths.saRight = new Path()
      .move(points.strapSplit)
      .line(points.strapNeckFront)
      ._curve(points.strapHpsCp1, points.strapHps)
      ._curve(points.cbStrapCp1, points.cbStrap)
      .hide()

    paths.seam = paths.saLeft.join(paths.saBottom).join(paths.saRight).line(points.cbNeck).close()

    if (complete) {
      //grainline
      if (options.cbStrapSaWidth > 0) {
        points.grainlineFrom = points.cbStrap.shiftFractionTowards(points.cbStrapCp1, 0.15)
        points.grainlineTo = points.cbNeck.shiftTowards(
          points.cbNeckCp1,
          points.cbStrap.dist(points.grainlineFrom)
        )
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      } else {
        points.cutOnFoldFrom = points.cbStrap.shiftFractionTowards(points.cbNeck, 0.1)
        points.cutOnFoldTo = points.cbNeck.shiftFractionTowards(points.cbStrap, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      }
      //title
      points.title = points.hpsCp2.shiftFractionTowards(points.strapHpsCp1, 0.25)
      macro('title', {
        at: points.title,
        nr: '10',
        title: 'Strap ', //Why handle dammit needs the space
        scale: 0.5,
        prefix: 'title',
      })
      if (sa) {
        const cbSa = sa * options.cbStrapSaWidth * 100

        points.saNeckFront = utils.beamsIntersect(
          paths.saLeft.offset(sa).end(),
          paths.saLeft.offset(sa).shiftFractionAlong(0.99),
          points.neckFront.shiftTowards(points.neckSideFrontCp, sa).rotate(-90, points.neckFront),
          points.neckSideFrontCp
            .shiftTowards(points.neckFront, sa)
            .rotate(90, points.neckSideFrontCp)
        )

        points.saStrapSplit = utils.beamsIntersect(
          paths.saBottom.offset(sa).end(),
          paths.saBottom.offset(sa).shiftFractionAlong(0.99),
          points.strapSplit.shiftTowards(points.strapHpsCp1, sa).rotate(-90, points.strapSplit),
          points.strapHpsCp1.shiftTowards(points.strapSplit, sa).rotate(90, points.strapHpsCp1)
        )

        points.saCbStrap = points.cbStrap
          .shift(points.cbStrapCp1.angle(points.cbStrap), cbSa)
          .shift(points.cbNeck.angle(points.cbStrap), sa)

        points.saCbNeck = points.cbNeck
          .shift(points.cbStrap.angle(points.cbNeck), sa)
          .shift(points.cbNeckCp1.angle(points.cbNeck), cbSa)

        paths.sa = paths.saLeft
          .offset(sa)
          .line(points.saNeckFront)
          .join(paths.saBottom.offset(sa))
          .line(points.saStrapSplit)
          .join(paths.saRight.offset(sa))
          .line(points.saCbStrap)
          .line(points.saCbNeck)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
