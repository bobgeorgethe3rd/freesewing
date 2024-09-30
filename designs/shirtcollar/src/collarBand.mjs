import { pluginBundle } from '@freesewing/plugin-bundle'
import { collarBase } from './collarBase.mjs'

export const collarBand = {
  name: 'shirtcollar.collarBand',
  measurements: [...collarBase.measurements],
  options: {
    //Impored
    ...collarBase.options,
    //Plackets
    placketOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'plackets' },
  },
  plugins: [pluginBundle],
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
    if (options.useVoidStores) {
      void store.setIfUnset('buttonholePlacketWidth', 35)
      void store.setIfUnset('buttonPlacketWidth', 35)
    }
    const buttonholePlacketWidth = store.get('buttonholePlacketWidth')
    const buttonPlacketWidth = store.get('buttonPlacketWidth')
    const collarBandWidth = store.get('collarBandWidth')
    let leftEx
    let rightEx
    if (options.placketOverlapSide == 'left') {
      leftEx = buttonholePlacketWidth / 2
      rightEx = buttonPlacketWidth / 2
    } else {
      leftEx = buttonPlacketWidth / 2
      rightEx = buttonholePlacketWidth / 2
    }
    //let's begin
    points.bottomLeft = points.fBottomCp1.shiftOutwards(points.fBottom, leftEx)
    points.fTopCp2 = points.fTopCp2.shiftOutwards(points.fTop, leftEx)
    points.bottomRight = points.bottomCp1.shiftOutwards(points.bottom, rightEx)
    points.topCp1 = points.topCp2.shiftOutwards(points.top, rightEx)

    //paths
    paths.saBottom = new Path()
      .move(points.bottomLeft)
      .line(points.fBottom)
      .curve(points.fBottomCp1, points.fBottomMidCp2, points.bottomMid)
      .curve(points.bottomMidCp2, points.bottomCp1, points.bottom)
      .line(points.bottomRight)
      .hide()

    paths.saTop = new Path()
      .move(points.bottomRight)
      ._curve(points.topCp1, points.top)
      .curve(points.topCp2, points.topMidCp1, points.topMid)
      .curve(points.fTopMidCp1, points.fTopCp2, points.fTop)
      .curve_(points.fTopCp2, points.bottomLeft)
      .hide()

    paths.seam = paths.saBottom.clone().join(paths.saTop).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid.shiftFractionTowards(points.topMidCp1, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bottomNotch', 'fBottomNotch'],
      })
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['topNotch', 'fTopNotch'],
      })
      //title
      points.title = points.bottomMid
        .shiftFractionTowards(points.fBottomMidCp2, 0.5)
        .shift(90, collarBandWidth * 0.6)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Collar Band',
        cutNr: 2,
        scale: 0.25,
      })
      //cb
      paths.cb = new Path()
        .move(points.topMid)
        .line(points.bottomMid)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Back')
        .attr('data-text-class', 'center')
      //buttons & buttonholes
      if (options.placketOverlapSide == 'left') {
        points.buttonhole = points.fBottom.shiftFractionTowards(points.fTop, 0.5)
        points.button = points.bottom.shiftFractionTowards(points.top, 0.5)
        snippets.buttonhole = new Snippet('buttonhole-start', points.buttonhole).attr(
          'data-rotate',
          180 - points.fBottom.angle(points.fTop)
        )
        snippets.button = new Snippet('button', points.button).attr(
          'data-rotate',
          180 - points.bottom.angle(points.top)
        )
      } else {
        points.buttonhole = points.bottom.shiftFractionTowards(points.top, 0.5)
        points.button = points.fBottom.shiftFractionTowards(points.fTop, 0.5)
        snippets.buttonhole = new Snippet('buttonhole-start', points.buttonhole).attr(
          'data-rotate',
          360 - points.bottom.angle(points.top)
        )
        snippets.button = new Snippet('button', points.button).attr(
          'data-rotate',
          360 - points.fBottom.angle(points.fTop)
        )
      }
      //cf lines
      paths.cfLeft = new Path().move(points.fTop).line(points.fBottom).attr('class', 'mark help')

      paths.cfRight = new Path().move(points.top).line(points.bottom).attr('class', 'mark help')
      if (sa) {
        points.saBottomLeft = points.bottomLeft
          .shift(points.fBottom.angle(points.bottomLeft), sa)
          .shift(points.fBottom.angle(points.bottomLeft) + 90, sa)
        points.saBottomRight = points.bottomRight
          .shift(points.bottom.angle(points.bottomRight), sa)
          .shift(points.bottom.angle(points.bottomRight) - 90, sa)
        paths.sa = new Path()
          .move(points.saBottomLeft)
          .join(paths.saBottom.offset(sa))
          .line(points.saBottomRight)
          .join(paths.saTop.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
