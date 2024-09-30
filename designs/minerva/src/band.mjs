import { pctBasedOn } from '@freesewing/core'
import { crown } from './crown.mjs'

export const band = {
  name: 'minerva.band',
  after: crown,
  options: {
    //Style
    band: { bool: true, menu: 'style' },
    bandLengthBonus: {
      pct: 4.1,
      min: 2,
      max: 20,
      snap: 6.35,
      ...pctBasedOn('head'),
      menu: 'style',
    },
    bandWidth: { pct: 4.1, min: 2, max: 10, snap: 6.35, ...pctBasedOn('head'), menu: 'style' },
    bandFolds: { count: 4, min: 1, max: 4, menu: 'style' },
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
    //set render
    if (!options.band) {
      part.hide()
      return part
    }
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    //let's begin
    points.topMid = new Point(0, 0)
    points.bottomMid = points.topMid.shift(-90, absoluteOptions.bandWidth * options.bandFolds)
    points.topLeft = points.topMid.shift(
      180,
      (store.get('headCircumference') + absoluteOptions.bandLengthBonus) / 2
    )
    points.bottomLeft = new Point(points.topLeft.x, points.bottomMid.y)
    points.topRight = points.topLeft.flipX()
    points.bottomRight = new Point(points.topRight.x, points.bottomMid.y)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid.shiftFractionTowards(points.topLeft, 0.15)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      let titleCutNum = 1
      if (options.bandFolds == 1) titleCutNum = 2
      points.title = new Point(points.topLeft.x * (1 / 3), points.bottomMid.y * 0.5)
      macro('title', {
        at: points.title,
        nr: 4,
        title: 'band',
        cutNr: titleCutNum,
        scale: 0.25,
      })
      //foldline
      if (options.bandFolds > 1) {
        for (let i = 1; i < options.bandFolds; i++) {
          points['foldlineFrom' + i] = points.topLeft.shiftFractionTowards(
            points.bottomLeft,
            i / options.bandFolds
          )
          points['foldineTo' + i] = new Point(points.topRight.x, points['foldlineFrom' + i].y)
          paths['foldline' + i] = new Path()
            .move(points['foldlineFrom' + i])
            .line(points['foldineTo' + i])
            .attr('class', 'mark dashed')
            .attr('data-text', 'Fold-Line')
        }
      }
      //centre line
      paths.centreLine = new Path()
        .move(points.topMid)
        .line(points.bottomMid)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Line')
        .attr('data-text-class', 'center')
    }
    if (sa) {
      points.saTopLeft = points.topLeft.translate(-sa, -sa)
      points.saBottomLeft = points.bottomLeft.translate(-sa, sa)
      points.saTopRight = points.saTopLeft.flipX()
      points.saBottomRight = points.saBottomLeft.flipX()

      paths.sa = new Path()
        .move(points.saTopLeft)
        .line(points.saBottomLeft)
        .line(points.saBottomRight)
        .line(points.saTopRight)
        .line(points.saTopLeft)
        .close()
        .attr('class', 'fabric sa')
    }

    return part
  },
}
