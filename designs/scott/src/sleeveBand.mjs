import { sleeve } from './sleeve.mjs'

export const sleeveBand = {
  name: 'scott.sleeveBand',
  after: sleeve,
  options: {
    //Sleeves
    sleeveBandFolded: { bool: true, menu: 'sleeves' },
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
  }) => {
    //set render
    if (!options.sleeveBands || !options.sleevesBool) {
      part.hide()
      return part
    }
    //measures
    const sleeveBandLength = store.get('sleeveBandLength')

    let sleeveBandWidth = absoluteOptions.sleeveBandWidth
    if (options.sleeveBandFolded) {
      sleeveBandWidth = sleeveBandWidth * 2
    }
    //let's begin
    points.topMid = new Point(0, 0)
    points.bottomMid = points.topMid.shift(-90, sleeveBandWidth)
    points.topRight = points.topMid.shift(0, sleeveBandLength / 2)
    points.bottomRight = new Point(points.topRight.x, points.bottomMid.y)
    points.topLeft = points.topRight.flipX()
    points.bottomLeft = points.bottomRight.flipX()

    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid.shiftFractionTowards(points.topLeft, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      for (let i = 0; i <= 2; i++) {
        points['topNotch' + i] = points.topLeft.shiftFractionTowards(points.topRight, (i + 1) / 4)
        points['bottomNotch' + i] = points.bottomLeft.shiftFractionTowards(
          points.bottomRight,
          (i + 1) / 4
        )
        snippets['topNotch' + i] = new Snippet('notch', points['topNotch' + i])
        if (options.sleeveBandFolded) {
          snippets['bottomNotch' + i] = new Snippet('notch', points['bottomNotch' + i])
        }
      }
      //title
      let titleCutNum = 2
      if (options.sleeveBandFolded) titleCutNum = 1
      points.title = new Point(points.topRight.x * 0.25, absoluteOptions.sleeveBandWidth * 0.5)
      macro('title', {
        at: points.title,
        nr: '6',
        title: 'Sleeve Band',
        cutNr: titleCutNum,
        scale: 1 / 3,
      })
    }
    //fold line
    if (options.sleeveBandFolded) {
      paths.foldLine = new Path()
        .move(new Point(points.topLeft.x, absoluteOptions.sleeveBandWidth))
        .line(new Point(points.topRight.x, absoluteOptions.sleeveBandWidth))
        .attr('class', 'mark')
        .attr('data-text', 'Fold Line')
    }
    //centre line
    paths.centreLine = new Path()
      .move(points.topMid)
      .line(points.bottomMid)
      .attr('class', 'mark')
      .attr('data-text', 'Centre Line')
      .attr('data-text-class', 'center')
    if (sa) {
      points.saTopLeft = points.topLeft.translate(-sa, -sa)
      points.saBottomLeft = points.bottomLeft.translate(-sa, sa)
      points.saBottomRight = points.bottomRight.translate(sa, sa)
      points.saTopRight = points.topRight.translate(sa, -sa)

      paths.sa = new Path()
        .move(points.saTopLeft)
        .line(points.saBottomLeft)
        .line(points.saBottomRight)
        .line(points.saTopRight)
        .close()
        .attr('class', 'fabric sa')
    }
    return part
  },
}
