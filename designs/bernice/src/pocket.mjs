import { pluginMirror } from '@freesewing/plugin-mirror'
import { pocket as pearPocket } from '@freesewing/pearpocket'
import { front } from './front.mjs'

export const pocket = {
  name: 'bernice.pocket',
  after: front,
  options: {
    //Imported
    ...pearPocket.options,
    //Constant
    cpFraction: 0.55191502449,
    pearPocketCurvePlacement: 0.539, //Locked for Bernice
    //Pockets
    pearPocketWidth: { pct: 80, min: 60, max: 85, menu: 'pockets.pearPockets' }, //Altered for Bernice
  },
  plugins: [pluginMirror],
  draft: (sh) => {
    const { macro, points, Point, paths, Path, options, store, complete, sa, part, log } = sh
    //set Render stroke Draft
    if (options.pocketsBool) {
      pearPocket.draft(sh)
    } else {
      part.hide()
      return part
    }
    //keep certain paths
    const keepThese = 'opening'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    macro('title', false)
    //let's begin
    points.left = new Point(points.curveLeft.x, points.slitBottom.y)
    points.leftCp1 = points.left.shift(90, points.left.y * options.cpFraction)
    points.topMidCp2 = points.topMid.shift(0, points.left.x * options.cpFraction)
    points.curveLeftEnd = points.bottomMid.shift(0, points.left.x * 0.5)
    points.curveLeftStart = points.curveLeftEnd.rotate(90, points.curveLeftCp2)
    points.curveLeftStartCp2 = points.curveLeftStart.shiftFractionTowards(
      points.curveLeftCp2,
      options.cpFraction
    )
    points.curveLeftEndCp1 = points.curveLeftStartCp2.rotate(-90, points.curveLeftCp2)

    //paths
    paths.saBase = new Path()
      .move(points.topMid)
      .curve(points.topMidCp2, points.leftCp1, points.left)
      .line(points.curveLeftStart)
      .curve(points.curveLeftStartCp2, points.curveLeftEndCp1, points.curveLeftEnd)
      .line(points.bottomMid)
      .hide()

    macro('mirror', {
      mirror: [points.topMid, points.bottomMid],
      paths: ['saBase'],
      prefix: 'm',
    })

    paths.seam = paths.saBase.join(paths.mSaBase.reverse())

    if (complete) {
      //grainline
      points.grainlineFrom = points.slitBottom.shiftFractionTowards(points.bottomMid, 0.5)
      points.grainlineTo = points.bottomMid
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.curveRight.x * 0.15, points.curveLeftStart.y)
      points.titleFacing = new Point(points.curveRight.x * 0.15, points.slitBottom.y * 0.5)
      macro('title', {
        nr: '4a',
        title: 'Pocket',
        at: points.title,
        scale: 0.5,
      })
      macro('title', {
        nr: '4b',
        title: 'Pocket Facing',
        at: points.titleFacing,
        scale: 0.5,
        prefix: 'b',
      })
      //facing
      points.facingLeft = points.left.shiftFractionTowards(points.curveLeftStart, 0.5)
      points.facingRight = points.facingLeft.flipX()
      paths.facing = new Path()
        .move(points.facingLeft)
        .line(points.facingRight)
        .attr('class', 'interfacing')
        .attr('data-text', 'Facing Line')
        .attr('data-text-class', 'center')

      if (sa) {
        paths.sa = paths.seam
          .offset(sa * options.pocketBagSaWidth * 100)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
