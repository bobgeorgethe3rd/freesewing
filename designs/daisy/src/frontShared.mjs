import { back } from '@freesewing/bella'
import { frontSideDart as bellaFront } from '@freesewing/bella'

export const frontShared = {
  name: 'frontShared',
  from: bellaFront,
  after: back,
  hideDependencies: true,
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
  }) => {
    //renaming of points
    points.cfWaist = points.cfHem
    points.sideWaistInitial = points.sideHemInitial
    points.sideWaist = points.sideHem

    if (complete) {
      macro('title', {
        at: points.titleAnchor,
        nr: 'X',
        title: 'Front ' + utils.capitalize(options.bustDartPlacement) + ' Dart',
      })
    }

    return part
  },
}
