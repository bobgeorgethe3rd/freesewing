import { crown as draftCrown } from '@freesewing/barkley'

export const crown = {
  name: 'nathaniel.crown',
  measurements: [...draftCrown.measurements],
  plugins: [...draftCrown.plugins],
  options: {
    //Imported
    ...draftCrown.options,
  },
  draft: (sh) => {
    //draft
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
      absoluteOptions,
      log,
    } = sh
    //draft
    draftCrown.draft(sh)

    if (complete) {
      if (sa) {
        points.saBottom = utils.beamIntersectsY(
          points.leftCp2.shiftTowards(points.bottom, sa).rotate(-90, points.leftCp2),
          points.bottom.shiftTowards(points.leftCp2, sa).rotate(90, points.bottom),
          sa
        )
        points.saBottomF = points.saBottom.flipX(points.origin)

        paths.sa = new Path()
          .move(points.saBottom)
          .line(points.saBottomF)
          .line(paths.saRight.offset(sa).start())
          .join(paths.saRight.offset(sa))
          .line(points.saCrown_p1)
          .line(paths.saLeft.offset(sa).start())
          .join(paths.saLeft.offset(sa))
          .line(points.saBottom)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
