import { pctBasedOn } from '@freesewing/core'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { backBase } from './backBase.mjs'

export const tie = {
  name: 'petunia.tie',
  after: backBase,
  hide: {
    after: true,
    inherited: true,
  },
  options: {
    //Constant
    cpFraction: 0.55191502449,
    //Style
    tiesBool: { bool: true, menu: 'style' },
    tieWidth: {
      pct: 3.2,
      min: 1,
      max: 10,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    tieLengthBonus: { pct: 0, min: -50, max: 100, menu: 'style' },
    tieFolded: { bool: false, menu: 'style' },
    tieStyle: {
      dflt: 'straight',
      list: ['straight', 'pointed', 'rounded', 'curved', 'slanted'],
      menu: 'style',
    },
  },
  plugins: [pluginMirror],
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
    if (!options.tiesBool) {
      part.hide()
      return part
    }
    //measurements
    const tieWidth = absoluteOptions.tieWidth
    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, tieWidth)
    points.topRight = points.topLeft.shift(0, measurements.waist * (1 + options.tieLengthBonus))
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
    if (options.tieStyle == 'curved' || options.tieStyle == 'slanted') {
      points.topRightCorner = points.bottomRight.rotate(90, points.topRight)
    } else {
      points.topRightCorner = points.topRight
    }
    points.topRightMid = points.bottomRight.translate(tieWidth / 2, -tieWidth / 2)
    if (options.tieStyle == 'curved') {
      points.bottomRightCp2 = points.bottomRight.shift(0, tieWidth * options.cpFraction)
    } else {
      points.bottomRightCp2 = points.bottomRight.shift(0, tieWidth * 0.5 * options.cpFraction)
    }
    points.topRightCornerCp1 = points.topRightCorner.shift(-90, tieWidth * options.cpFraction)
    points.topRightMidCp1 = points.topRightMid.shift(-90, tieWidth * 0.5 * options.cpFraction)
    points.topRightMidCp2 = points.topRightMidCp1.flipY(points.topRightMid)
    points.topRightCp1 = points.bottomRightCp2.flipY(points.topRightMid)
    //paths
    const drawSaBase = () => {
      switch (options.tieStyle) {
        case 'straight':
          return new Path().move(points.bottomRight).line(points.topRight)
          break
        case 'pointed':
          return new Path().move(points.bottomRight).line(points.topRightMid).line(points.topRight)
          break
        case 'rounded':
          return new Path()
            .move(points.bottomRight)
            .curve(points.bottomRightCp2, points.topRightMidCp1, points.topRightMid)
            .curve(points.topRightMidCp2, points.topRightCp1, points.topRight)
          break
        case 'curved':
          return new Path()
            .move(points.bottomRight)
            .curve(points.bottomRightCp2, points.topRightCornerCp1, points.topRightCorner)
          break
        case 'slanted':
          return new Path().move(points.bottomRight).line(points.topRightCorner)
      }
    }

    paths.saBase = drawSaBase().hide()

    macro('mirror', {
      mirror: [points.topLeft, points.topRight],
      paths: ['saBase'],
      prefix: 'm',
    })

    const drawSeamBase = () => {
      if (options.tieFolded) {
        return paths.saBase
          .join(paths.mSaBase.reverse())
          .line(points.bottomLeft.flipY(points.topLeft))
        unhide()
      } else {
        return paths.saBase.clone().line(points.topLeft).unhide()
      }
    }

    paths.seam = drawSeamBase().clone().line(points.bottomLeft).line(points.bottomRight).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.bottomLeft, 0.5)
      points.grainlineTo = new Point(points.topRight.x, points.grainlineFrom.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.leftNotch = points.topLeft.shiftFractionTowards(points.bottomLeft, 0.5)
      snippets.leftNotch = new Snippet('notch', points.leftNotch)
      if (options.tieFolded) {
        points.leftNotchF = points.leftNotch.flipY(points.topLeft)
        snippets.leftNotchF = new Snippet('notch', points.leftNotchF)
      }
      //title
      points.title = new Point(points.topRight.x / 2, points.bottomRight.y / 4)
      macro('title', {
        nr: 8,
        title: 'Tie',
        at: points.title,
        cutNr: 4,
        scale: 0.1,
      })
      //foldline
      if (options.tieFolded) {
        paths.foldline = new Path()
          .move(points.topLeft)
          .line(points.topRightCorner)
          .attr('class', 'mark')
          .attr('data-text', 'Fold-Line')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        points.saBottomLeft = points.bottomLeft.translate(-sa, sa)
        points.saTopLeft = drawSeamBase().end().translate(-sa, -sa)

        if (options.tieStyle == 'straight') {
          points.saBottomRight = points.bottomRight.translate(sa, sa)
        }
        if (options.tieStyle == 'curved' || options.tieStyle == 'rounded') {
          points.saBottomRight = points.bottomRight.shift(-90, sa)
        }
        if (options.tieStyle == 'slanted' || options.tieStyle == 'pointed') {
          points.saBottomRight = utils.beamIntersectsY(
            points.bottomRight.shiftTowards(points.topRightMid, sa).rotate(-90, points.bottomRight),
            points.topRightMid.shiftTowards(points.bottomRight, sa).rotate(90, points.topRightMid),
            points.bottomRight.y + sa
          )
        }

        const drawSa = () => {
          switch (options.tieStyle) {
            case 'straight':
              if (options.tieFolded) {
                return drawSeamBase()
                  .split(points.bottomRight.flipY(points.topRight))[0]
                  .offset(sa)
                  .line(points.bottomRight.flipY(points.topRight).translate(sa, -sa))
              } else {
                return drawSeamBase()
                  .split(points.topRight)[0]
                  .offset(sa)
                  .line(points.topRight.translate(sa, -sa))
              }
              break
            case 'pointed':
              if (options.tieFolded) {
                return new Path()
                  .move(points.saBottomRight)
                  .line(
                    utils.beamIntersectsY(
                      points.saBottomRight,
                      points.saBottomRight.shift(points.bottomRight.angle(points.topRightMid), 1),
                      points.topRightMid.y
                    )
                  )
                  .line(
                    utils.beamIntersectsY(
                      points.topRightMid
                        .shiftTowards(points.topRight, sa)
                        .rotate(-90, points.topRightMid),
                      points.topRight
                        .shiftTowards(points.topRightMid, sa)
                        .rotate(90, points.topRight),
                      points.topRight.y
                    )
                  )
                  .line(
                    utils
                      .beamIntersectsY(
                        points.saBottomRight,
                        points.saBottomRight.shift(points.bottomRight.angle(points.topRightMid), 1),
                        points.topRightMid.y
                      )
                      .flipY(points.topRight)
                  )
                  .line(points.saBottomRight.flipY(points.topLeft))
              } else {
                return new Path()
                  .move(points.saBottomRight)
                  .line(
                    utils.beamIntersectsY(
                      points.saBottomRight,
                      points.saBottomRight.shift(points.bottomRight.angle(points.topRightMid), 1),
                      points.topRightMid.y
                    )
                  )
                  .line(points.saBottomRight.flipY(points.topRightMid))
              }
              break
            case 'rounded':
              return drawSeamBase().offset(sa).trim()
              break
            case 'curved':
              if (options.tieFolded) {
                return drawSeamBase().offset(sa)
              } else {
                return drawSeamBase()
                  .split(points.topRightCorner)[0]
                  .offset(sa)
                  .line(points.topRightCorner.translate(sa, -sa))
              }
              break
            case 'slanted':
              if (options.tieFolded) {
                return new Path()
                  .move(points.saBottomRight)
                  .line(
                    utils.beamIntersectsY(
                      points.saBottomRight,
                      points.saBottomRight.shift(
                        points.bottomRight.angle(points.topRightCorner),
                        1
                      ),
                      points.topRight.y
                    )
                  )
                  .line(points.saBottomRight.flipY(points.topLeft))
              } else {
                return new Path()
                  .move(points.saBottomRight)
                  .line(
                    utils.beamIntersectsY(
                      points.saBottomRight,
                      points.saBottomRight.shift(
                        points.bottomRight.angle(points.topRightCorner),
                        1
                      ),
                      points.topRight.y - sa
                    )
                  )
              }
          }
        }

        paths.sa = drawSa()
          .line(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
