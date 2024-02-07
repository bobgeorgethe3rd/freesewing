import { visor as visorHenry } from '@freesewing/henry'
import { crown } from './crown.mjs'

export const visorBarkley = {
  name: 'barkley.visorBarkley',
  options: {
    //Imported
    ...visorHenry.options,
  },
  after: [crown],
  draft: (sh) => {
    const {
      store,
      macro,
      points,
      Point,
      paths,
      Path,
      utils,
      options,
      absoluteOptions,
      snippets,
      measurements,
      complete,
      sa,
      part,
    } = sh

    visorHenry.draft(sh)
    delete paths.seam
    delete paths.sa
    //points
    points.topRightCp1 = points.topRight
      .shiftFractionTowards(new Point(points.topRight.x, points.bottomMid.y), 0.9)
      .rotate(options.visorAngle / 6, points.topRight)
    points.topLeftCp2 = points.topRightCp1.flipX()

    //Paths
    paths.saBase = new Path()
      .move(points.topLeft)
      .curve(points.topLeftCp2, points.bottomMidCp1, points.bottomMid)
      .curve(points.bottomMidCp2, points.topRightCp1, points.topRight)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).close()

    if (complete) {
      if (sa) {
        const crownSa = sa * options.crownSaWidth * 100

        points.saTopRight = utils.beamsIntersect(
          points.topRightCp1.shiftTowards(points.topRight, sa).rotate(-90, points.topRightCp1),
          points.topRight.shiftTowards(points.topRightCp1, sa).rotate(90, points.topRight),
          paths.hemBase.offset(crownSa).start(),
          paths.hemBase
            .offset(crownSa)
            .start()
            .shift(points.topRightCp1.angle(points.topRight) - 90, 1)
        )
        points.saHemBaseStart = utils.beamIntersectsY(
          points.topRight.shiftTowards(points.topRightCp2, crownSa).rotate(-90, points.topRight),
          points.topRightCp2.shiftTowards(points.topRight, crownSa).rotate(90, points.topRightCp2),
          points.saTopRight.y
        )

        points.saTopLeft = points.saTopRight.flipX(points.topMid)
        points.saHemBaseEnd = points.saHemBaseStart.flipX(points.topMid)

        paths.sa = new Path()
          .move(points.saTopRight)
          .line(points.saHemBaseStart)
          .join(paths.hemBase.offset(crownSa))
          .line(points.saHemBaseEnd)
          .line(points.saTopLeft)
          .join(paths.saBase.offset(sa))
          .line(points.saTopRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
