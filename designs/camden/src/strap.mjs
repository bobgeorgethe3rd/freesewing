import { back } from './back.mjs'

export const strap = {
  name: 'camden.strap',
  after: back,
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Construction
    strapFolds: { count: 0, min: 0, max: 3, menu: 'style' },
    strapLengthBonus: { pct: 0, min: 0, max: 200, menu: 'style' },
    tieType: { dflt: 'strap', list: ['strap', 'slanted', 'pointed', 'round'], menu: 'style' },
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
    //Set Render
    const strapLength = store.get('strapLength') * (1 + options.strapLengthBonus)
    if (!options.includeStraps || strapLength == 0) {
      part.hide()
      return part
    }
    //measures
    const strapWidth = store.get('strapWidth')
    let width = strapWidth * (1 + options.strapFolds)

    //let's begin
    points.topLeft = new Point(0, 0)
    points.topRight = points.topLeft.shift(0, width)
    points.bottomRight = points.topRight.shift(-90, strapLength)
    points.bottomLeft = new Point(points.topLeft.x, points.bottomRight.y)

    for (let i = 0; i <= options.strapFolds + 1; i++) {
      points['topAnchor' + i] = points.topLeft.shiftFractionTowards(
        points.topRight,
        i / (options.strapFolds + 1)
      )
    }

    if (options.tieType == 'strap') {
      paths.top = new Path().move(points.topRight).line(points.topLeft).hide()
    } else {
      paths.top = new Path().move(points.topRight).line(points.topLeft).hide()

      let j
      let k
      let l
      let m
      for (let i = 0; i <= options.strapFolds; i++) {
        j = i + 1
        k = i - 1
        l = i + 2
        m = i - 2
        points['topTip' + i] = points['topAnchor' + i].translate(strapWidth / 2, strapWidth / -2)

        if (options.tieType == 'slanted') {
          if (j % 2 == 1) {
            points['topSlant' + i] = points['topAnchor' + j].shift(90, strapWidth)

            if (points['topAnchor' + l]) {
              paths['top' + i] = new Path()
                .move(points['topAnchor' + l])
                .line(points['topSlant' + i])
                .line(points['topAnchor' + i])
                .hide()
            } else {
              paths['top' + i] = new Path()
                .move(points['topAnchor' + j])
                .line(points['topSlant' + i])
                .line(points['topAnchor' + i])
                .hide()
            }
            if (m > -1) {
              paths['top' + i] = paths['top' + i].join(paths['top' + m]).hide()
            }
          }
        } else {
          if (options.tieType == 'pointed') {
            paths['top' + i] = new Path()
              .move(points['topAnchor' + j])
              .line(points['topTip' + i])
              .line(points['topAnchor' + i])
              .hide()
          }

          if (options.tieType == 'round') {
            points['topMid' + i] = points['topAnchor' + i].shift(0, strapWidth / 2)
            points['topCp1' + i] = points['topAnchor' + j]
              .shiftFractionTowards(points['topMid' + i], options.cpFraction)
              .rotate(-90, points['topAnchor' + j])
            points['topCp2' + i] = points['topTip' + i]
              .shiftFractionTowards(points['topMid' + i], options.cpFraction)
              .rotate(90, points['topTip' + i])
            points['topCp3' + i] = points['topCp2' + i].flipX(points['topMid' + i])
            points['topCp4' + i] = points['topCp1' + i].flipX(points['topMid' + i])
            paths['top' + i] = new Path()
              .move(points['topAnchor' + j])
              .curve(points['topCp1' + i], points['topCp2' + i], points['topTip' + i])
              .curve(points['topCp3' + i], points['topCp4' + i], points['topAnchor' + i])
              .hide()
          }

          if (k > -1) {
            paths['top' + i] = paths['top' + i].join(paths['top' + k]).hide()
          }
        }
      }
      if (options.tieType != 'slanted') {
        paths.top = paths['top' + options.strapFolds].hide()
      } else {
        if (options.strapFolds % 2 == 1) {
          paths.top = paths['top' + (options.strapFolds - 1)].hide()
        } else {
          paths.top = paths['top' + options.strapFolds].hide()
        }
      }
    }
    //paths
    paths.saBase = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .hide()

    paths.seam = paths.saBase.join(paths.top).close()

    if (complete) {
      //foldlines
      if (options.strapFolds > 0) {
        for (let i = 0; i <= options.strapFolds + 1; i++) {
          points['foldlineTo' + i] = points.bottomLeft.shiftFractionTowards(
            points.bottomRight,
            i / (options.strapFolds + 1)
          )
          if (i > 0 && i <= options.strapFolds) {
            paths['foldLine' + i] = new Path()
              .move(points['topAnchor' + i])
              .line(points['foldlineTo' + i])

            if (options.tieType == 'slanted') {
              if (i % 2 == 1) {
                paths['foldLine' + i] = new Path()
                  .move(points['topSlant' + (i - 1)])
                  .line(points['foldlineTo' + i])
              }
            }
            paths['foldLine' + i]
              .attr('class', 'interfacing')
              .attr('data-text', 'Fold - Line')
              .attr('data-text-class', 'center')
          }
        }
      }
      //grainline
      points.grainlineFrom = points.topLeft.shift(0, strapWidth / 8)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.topLeft.translate(strapWidth / 3, strapLength / 2)
      macro('title', {
        at: points.title,
        nr: 3,
        title: 'Strap / Ties',
        scale: 1 / 3,
      })

      if (sa) {
        if (options.strapFolds > 0 && options.tieType != 'strap') {
          if (options.tieType != 'slanted') {
            paths.saTop = paths.top
              .split(points['topTip' + options.strapFolds])[0]
              .line(points.topTip0)
              .join(paths.top.split(points.topTip0)[1])
              .hide()
          } else {
            if (options.strapFolds % 2 == 1) {
              paths.saTop = paths.top
                .split(points['topSlant' + (options.strapFolds - 1)])[0]
                .line(points.topSlant0)
                .join(paths.top.split(points.topSlant0)[1])
                .hide()
            } else {
              paths.saTop = paths.top
                .split(points['topSlant' + options.strapFolds])[0]
                .line(points.topSlant0)
                .join(paths.top.split(points.topSlant0)[1])
                .hide()
            }
          }
        } else {
          paths.saTop = paths.top
        }
        paths.sa = paths.saBase
          .offset(sa)
          .join(paths.saTop.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
