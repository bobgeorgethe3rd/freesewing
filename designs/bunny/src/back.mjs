import { pctBasedOn } from '@freesewing/core'
import { back as backDaisy } from '@freesewing/daisy'
import { sharedFront } from './sharedFront.mjs'

export const back = {
  name: 'bunny.back',
  from: backDaisy,
  after: sharedFront,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    backNeckDepth: { pct: 65, min: 0, max: 100, menu: 'style' },
    backNeckCurve: { pct: 50, min: 0, max: 100, menu: 'style' },
    backNeckCurveDepth: { pct: (2 / 3) * 100, min: 0, max: 100, menu: 'style' },
    //Plackets
    placketWidth: {
      pct: 3.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'plackets',
    },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
  },
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
    //remove paths & snippets
    const keepPaths = ['armhole', 'seam']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.daisyGuide) {
      paths.daisyGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //macros
    macro('title', false)
    //measures
    const sideAngle = store.get('sideAngle')
    const placketWidth = absoluteOptions.placketWidth
    //let's begin
    points.sideCurveEnd = points.armhole.shiftTowards(points.sideWaist, store.get('sideBustLength'))

    let tweak = 1
    let delta
    do {
      points.sideHem = points.sideWaist.shift(270 + sideAngle, store.get('bodyLength') * tweak)
      points.sideHemCp2 = points.sideHem.shiftFractionTowards(points.sideWaist, (2 / 3) * tweak)

      paths.sideSeam = new Path()
        .move(points.sideHem)
        .curve(points.sideHemCp2, points.sideWaist, points.sideCurveEnd)
        .line(points.armhole)
        .hide()

      delta = paths.sideSeam.length() - store.get('sideSeamLength')
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    points.hemPlacketCp2 = utils.beamsIntersect(
      points.sideHem,
      points.sideHem.shift(180 + sideAngle, 1),
      new Point((points.sideHem.x + placketWidth * 0.5) / 2, points.sideHem.y),
      new Point((points.sideHem.x + placketWidth * 0.5) / 2, points.sideHem.y * 1.1)
    )
    points.cbHem = new Point(points.cbWaist.x, points.hemPlacketCp2.y)

    if (points.cbHem.y < points.cbWaist.y) {
      points.cbHem = points.cbWaist
      points.hemPlacketCp2 = new Point(points.hemPlacketCp2.x, points.cbWaist.y)
    }

    //paths
    paths.hemBase = new Path().move(points.cbHem).line(points.sideHem).hide()

    paths.seam = paths.hemBase.clone().join(paths.sideSeam).join(paths.armhole)

    if (complete) {
      //grainline
      // if (options.cbSaWidth > 0) {
      // points.grainlineFrom = new Point(points.cbNeckCp1.x / 3, points.cbTop.y)
      // points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
      // macro('grainline', {
      // from: points.grainlineFrom,
      // to: points.grainlineTo,
      // })
      // } else {
      // points.cutOnFoldFrom = points.cbTop
      // points.cutOnFoldTo = points.cbHem
      // macro('cutonfold', {
      // from: points.cutOnFoldFrom,
      // to: points.cutOnFoldTo,
      // grainline: true,
      // })
      // }
      //notches

      //title
      points.title = new Point(points.dartTip.x * 0.55, points.armhole.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Back',
        scale: 2 / 3,
      })
      if (sa) {
      }
    }

    return part
  },
}
