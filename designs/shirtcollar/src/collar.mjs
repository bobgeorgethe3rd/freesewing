import { collarBase } from './collarBase.mjs'
import { collarBand } from './collarBand.mjs'

export const collar = {
  name: 'shirtcollar.collar',
  measurements: [...collarBase.measurements],
  options: {
    //Impored
    ...collarBase.options,
    //Collar
    collarPlacement: { pct: 0, min: 0, max: 50, menu: 'collar' },
    collarWidth: { pct: 50, min: 0, max: 100, menu: 'collar' },
    collarPeakWidth: { pct: 25, min: 25, max: 100, menu: 'collar' },
  },
  after: [collarBand],
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
      absoluteOptions,
      log,
    } = sh
    //draft
    collarBase.draft(sh)
    //remove paths
    for (let i in paths) delete paths[i]
    //measurements
    const buttonholePlacketWidth = store.get('buttonholePlacketWidth')
    const buttonPlacketWidth = store.get('buttonPlacketWidth')
    let collarPlacement
    if (buttonPlacketWidth > buttonholePlacketWidth) {
      collarPlacement = buttonPlacketWidth
    } else {
      collarPlacement = buttonholePlacketWidth
    }
    const collarWidth = store.get('collarBandWidth') * (1 + options.collarWidth)
    const collarPeakWidth = collarWidth * (1 + options.collarPeakWidth)

    //let's begin
    paths.topBand = new Path()
      .move(points.top)
      .curve(points.topCp2, points.topMidCp1, points.topMid)
      .curve(points.fTopMidCp1, points.fTopCp2, points.fTop)
      .hide()

    points.collarMid = points.topMid.shift(-90, collarWidth)
    points.topCollar = paths.topBand.shiftAlong(collarPlacement * options.collarPlacement)
    points.bottomCollarAnchor = utils.beamsIntersect(
      points.topCollar,
      points.topCollar.shift(points.top.angle(points.bottom), 1),
      points.collarMid,
      points.collarMid.shift(0, 1)
    )
    points.bottomCollar = points.topCollar.shiftFractionTowards(
      points.bottomCollarAnchor,
      1 + options.collarPeakWidth
    )
    points.collarMidCp2 = new Point(
      (points.bottomMidCp2.x + points.bottomCp1.x) / 2,
      points.collarMid.y
    )

    const flip = ['topCollar', 'bottomCollar', 'collarMidCp2']
    for (const p of flip) points['f' + utils.capitalize(p)] = points[p].flipX(points.bottomMid)

    //paths
    paths.saTop = new Path()
      .move(points.topCollar)
      .curve(points.topCp2, points.topMidCp1, points.topMid)
      .curve(points.fTopMidCp1, points.fTopCp2, points.fTopCollar)
      .hide()

    paths.saBottom = new Path()
      .move(points.fBottomCollar)
      ._curve(points.fCollarMidCp2, points.collarMid)
      .curve_(points.collarMidCp2, points.bottomCollar)
      .hide()

    paths.seam = paths.saTop
      .clone()
      .line(points.fBottomCollar)
      .join(paths.saBottom)
      .line(points.topCollar)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid.shiftFractionTowards(points.topMidCp1, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.collarMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['topNotch', 'fTopNotch'],
      })
      //title
      points.title = points.collarMid
        .shiftFractionTowards(points.fCollarMidCp2, 0.5)
        .shift(90, collarWidth / 2)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Collar',
        cutNr: 2,
        scale: 0.25,
      })
      //cb
      paths.cb = new Path()
        .move(points.topMid)
        .line(points.collarMid)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Back')
        .attr('data-text-class', 'center')

      if (sa) {
        points.saFTopCollar = points.fTopCollar
          .shift(points.fTopCp2.angle(points.fTopCollar), sa)
          .shift(points.fBottomCollar.angle(points.fTopCollar), sa)
        points.saFBottomCollar = utils.beamsIntersect(
          points.fTopCollar.shiftTowards(points.fBottomCollar, sa).rotate(-90, points.fTopCollar),
          points.fBottomCollar.shiftTowards(points.fTopCollar, sa).rotate(90, points.fBottomCollar),
          paths.saBottom.offset(sa).start(),
          paths.saBottom.offset(sa).shiftFractionAlong(0.001)
        )
        points.saBottomCollar = points.saFBottomCollar.flipX(points.topMid)
        points.saTopCollar = points.saFTopCollar.flipX(points.topMid)
        paths.sa = paths.saTop
          .offset(sa)
          .line(points.saFTopCollar)
          .line(points.saFBottomCollar)
          .join(paths.saBottom.offset(sa))
          .line(points.saBottomCollar)
          .line(points.saTopCollar)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
