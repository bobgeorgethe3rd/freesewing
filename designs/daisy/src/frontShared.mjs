import { back } from '@freesewing/bella'
import { frontSideDart as frontBella } from '@freesewing/bella'

export const frontShared = {
  name: 'frontShared',
  from: frontBella,
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
    points.waistDartEdge = points.waistDartHem
    if (complete) {
      macro('title', {
        at: points.titleAnchor,
        nr: 'X',
        title: 'Front ' + utils.capitalize(options.bustDartPlacement) + ' Dart',
      })
    }

    //stores
    store.set('shoulderWidth', points.shoulder.dist(points.hps))

    return part
  },
}
