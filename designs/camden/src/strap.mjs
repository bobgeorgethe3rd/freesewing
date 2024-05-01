import { back } from './back.mjs'

export const strap = {
  name: 'camden.strap',
  after: back,
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Style
    strapsBool: { bool: true, menu: 'style.straps' },
    //Construction
    strapFolds: { count: 0, min: 0, max: 3, menu: 'style.straps' },
    strapLengthBonus: { pct: 0, min: 0, max: 200, menu: 'style.straps' },
    tieType: {
      dflt: 'strap',
      list: ['strap', 'straight', 'slanted', 'pointed', 'rounded'],
      menu: 'style.straps',
    },
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
    if (!options.strapsBool || strapLength == 0) {
      part.hide()
      return part
    }
    //measures
    const strapWidth = store.get('strapWidth')
    let strapFolds
    if (options.bodiceFacings) {
      strapFolds = 0
    } else {
      strapFolds = options.strapFolds
    }
    const bodyWidth = strapWidth * (1 + strapFolds)

    //let's begin
    points.topLeft = new Point(0, 0)
    points.topRight = points.topLeft.shift(0, bodyWidth)
    points.bottomRight = points.topRight.shift(-90, strapLength)
    points.bottomLeft = new Point(points.topLeft.x, points.bottomRight.y)

    for (let i = 0; i <= strapFolds + 1; i++) {
      points['topAnchor' + i] = points.topLeft.shiftFractionTowards(
        points.topRight,
        i / (strapFolds + 1)
      )
    }

    if (options.tieType == 'strap' || options.tieType == 'straight') {
      paths.top = new Path().move(points.topRight).line(points.topLeft).hide()
    } else {
      paths.top = new Path().move(points.topRight).line(points.topLeft).hide()

      let j
      let k
      let l
      let m
      for (let i = 0; i <= strapFolds; i++) {
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

          if (options.tieType == 'rounded') {
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
        paths.top = paths['top' + strapFolds].hide()
      } else {
        if (strapFolds % 2 == 1) {
          paths.top = paths['top' + (strapFolds - 1)].hide()
        } else {
          paths.top = paths['top' + strapFolds].hide()
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

    paths.saLeft = new Path().move(points.topLeft).line(points.bottomLeft).hide()

    paths.saBottom = new Path().move(points.bottomLeft).line(points.bottomRight).hide()

    paths.saRight = new Path().move(points.bottomRight).line(points.topRight).hide()

    paths.seam = paths.saLeft.join(paths.saBottom).join(paths.saRight).join(paths.top).close()

    if (complete) {
      //foldlines
      if (strapFolds > 0) {
        for (let i = 0; i <= strapFolds + 1; i++) {
          points['foldlineTo' + i] = points.bottomLeft.shiftFractionTowards(
            points.bottomRight,
            i / (strapFolds + 1)
          )
          if (i > 0 && i <= strapFolds) {
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
      //notches
      points.bottomNotch = points.bottomLeft.shiftFractionTowards(points.bottomRight, 0.5)
      snippets.bottomNotch = new Snippet('notch', points.bottomNotch)

      if (options.tieType == 'strap') {
        points.topNotch = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
        snippets.topNotch = new Snippet('bnotch', points.topNotch)
      } else {
        snippets.bBottomNotch = new Snippet('bnotch', points.bottomNotch)
      }

      //title
      points.title = points.topLeft.translate(strapWidth / 3, strapLength / 2)
      macro('title', {
        at: points.title,
        nr: 5,
        title: 'Strap / Tie',
        scale: 1 / 3,
      })

      if (sa) {
        let necklineSa
        if (options.bodiceFacings) {
          necklineSa = sa
        } else {
          necklineSa = sa * options.necklineSaWidth * 100
        }

        let topSa
        let shiftSa
        if (options.tieType == 'strap') {
          topSa = sa
          shiftSa = sa
        } else {
          topSa = necklineSa
          if (options.tieType == 'straight') {
            shiftSa = necklineSa
          } else {
            shiftSa = 0
          }
        }

        if (options.tieType != 'strap' && options.tieType != 'straight') {
          if (options.tieType == 'rounded') {
            paths.saTop = paths.top
              .split(points['topTip' + strapFolds])[0]
              .line(points.topTip0)
              .join(paths.top.split(points.topTip0)[1])
              .offset(necklineSa)
              .hide()
          }
          if (options.tieType == 'pointed') {
            points.topTipX = points['topTip' + strapFolds]

            points.saTopStart = utils.beamsIntersect(
              points.bottomRight.shift(0, necklineSa),
              points.topRight.shift(0, necklineSa),
              points.topRight.shiftTowards(points.topTipX, necklineSa).rotate(-90, points.topRight),
              points.topTipX.shiftTowards(points.topRight, necklineSa).rotate(90, points.topTipX)
            )

            points['saTopTip' + strapFolds] = utils.beamsIntersect(
              points.topRight.shiftTowards(points.topTipX, necklineSa).rotate(-90, points.topRight),
              points.topTipX.shiftTowards(points.topRight, necklineSa).rotate(90, points.topTipX),
              points.topTipX,
              points.topTipX.shift(90, 1)
            )
            points.saTopTip0 = new Point(points.topTip0.x, points['saTopTip' + strapFolds].y)

            points.saTopEnd = utils.beamsIntersect(
              points.topTip0.shiftTowards(points.topLeft, necklineSa).rotate(-90, points.topTip0),
              points.topLeft.shiftTowards(points.topTip0, necklineSa).rotate(90, points.topLeft),
              points.topLeft
                .shiftTowards(points.bottomLeft, necklineSa)
                .rotate(-90, points.topLeft),
              points.bottomLeft
                .shiftTowards(points.topLeft, necklineSa)
                .rotate(90, points.bottomLeft)
            )

            paths.saTop = new Path()
              .move(points.saTopStart)
              .line(points['saTopTip' + strapFolds])
              .line(points.saTopTip0)
              .line(points.saTopEnd)
              .hide()
          }
          if (options.tieType == 'slanted') {
            points.saTopEnd = utils.beamsIntersect(
              points.topSlant0
                .shiftTowards(points.topLeft, necklineSa)
                .rotate(-90, points.topSlant0),
              points.topLeft.shiftTowards(points.topSlant0, necklineSa).rotate(90, points.topLeft),
              points.topLeft
                .shiftTowards(points.bottomLeft, necklineSa)
                .rotate(-90, points.topLeft),
              points.bottomLeft
                .shiftTowards(points.topLeft, necklineSa)
                .rotate(90, points.bottomLeft)
            )

            if (strapFolds % 2 == 1) {
              points.saTopSlantX = points['topSlant' + (strapFolds - 1)]

              points.saTopStart = utils.beamsIntersect(
                points.bottomRight.shift(0, necklineSa),
                points.topRight.shift(0, necklineSa),
                points.topRight
                  .shiftTowards(points.saTopSlantX, necklineSa)
                  .rotate(-90, points.topRight),
                points.saTopSlantX
                  .shiftTowards(points.topRight, necklineSa)
                  .rotate(90, points.saTopSlantX)
              )

              points['saTopSlant' + (strapFolds - 1)] = utils.beamsIntersect(
                points.topRight
                  .shiftTowards(points.saTopSlantX, necklineSa)
                  .rotate(-90, points.topRight),
                points.saTopSlantX
                  .shiftTowards(points.topRight, necklineSa)
                  .rotate(90, points.saTopSlantX),
                points.saTopSlantX,
                points.saTopSlantX.shift(90, 1)
              )

              points.saTopSlant0 = utils.beamsIntersect(
                points.topSlant0
                  .shiftTowards(points.topLeft, necklineSa)
                  .rotate(-90, points.topSlant0),
                points.topLeft
                  .shiftTowards(points.topSlant0, necklineSa)
                  .rotate(90, points.topLeft),
                points.topSlant0,
                points.topSlant0.shift(90, 1)
              )

              paths.saTop = new Path()
                .move(points.saTopStart)
                .line(points['saTopSlant' + (strapFolds - 1)])
                .line(points.saTopSlant0)
                .line(points.saTopEnd)
                .hide()
            } else {
              points.saTopStart = points.topRight.shift(0, necklineSa)
              points.saTopSlantX = points['topSlant' + strapFolds]
              points.saTopAnchorX = points['topAnchor' + strapFolds]

              points['saTopSlant' + strapFolds] = utils.beamsIntersect(
                points.saTopSlantX,
                points.saTopSlantX.shift(90, 1),
                points.saTopSlantX
                  .shiftTowards(points.saTopAnchorX, necklineSa)
                  .rotate(-90, points.saTopSlantX),
                points.saTopAnchorX
                  .shiftTowards(points.saTopSlantX, necklineSa)
                  .rotate(90, points.saTopAnchorX)
              )
              points['saTopCorner' + strapFolds] = points['saTopSlant' + strapFolds].shift(
                0,
                necklineSa
              )

              points.saTopSlant0 = new Point(
                points.topSlant0.x,
                points['saTopSlant' + strapFolds].y
              )

              paths.saTop = new Path()
                .move(points.saTopStart)
                .line(points['saTopCorner' + strapFolds])
                .line(points['saTopSlant' + strapFolds])
                .line(points.saTopSlant0)
                .line(points.saTopEnd)
                .hide()
            }
          }
        } else {
          paths.saTop = paths.top.offset(topSa).hide()
        }

        points.saTopLeft = points.topLeft.translate(-necklineSa, -shiftSa)
        points.saBottomLeft = points.bottomLeft.translate(-necklineSa, sa)
        points.saBottomRight = points.bottomRight.translate(necklineSa, sa)
        points.saTopRight = points.topRight.translate(necklineSa, -shiftSa)

        paths.sa = new Path()
          .move(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(paths.saBottom.offset(sa).start())
          .join(paths.saBottom.offset(sa))
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(paths.saTop.start())
          .join(paths.saTop)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
