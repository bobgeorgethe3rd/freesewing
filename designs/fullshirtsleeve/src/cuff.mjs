import { sleeve } from './sleeve.mjs'
import { placket } from './placket.mjs'
import { pluginMirror } from '@freesewing/plugin-mirror'

export const cuff = {
  name: 'fullshirtsleeve.cuff',
  after: [sleeve, placket],
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Sleeves
    sleeveBandFolded: { bool: false, menu: 'sleeves.cuffs' },
    sleeveBandType: { dflt: 'straight', list: ['straight', 'curved'], menu: 'sleeves.cuffs' },
    sleeveBandCurve: { pct: 100, min: 0, max: 100, menu: 'sleeves.cuffs' },
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
    //measures
    const cuffEx = store.get('sleevePlacketWidth')
    const cuffLength = store.get('sleeveCuffLength') + cuffEx
    const cuffWidth = absoluteOptions.sleeveBandWidth
    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeftCorner = points.topLeft.shift(-90, cuffWidth)
    points.bottomRightCorner = points.bottomLeftCorner.shift(0, cuffLength)
    points.topRight = new Point(points.bottomRightCorner.x, points.topLeft.y)
    points.bottomLeft = points.bottomLeftCorner.shift(0, cuffEx / 2)
    points.bottomRight = points.bottomRightCorner.shift(180, cuffEx / 2)
    //curves
    points.leftEnd = points.bottomLeftCorner.shiftFractionTowards(
      points.bottomLeft,
      options.sleeveBandCurve
    )
    points.leftEndCp1 = points.leftEnd.shiftFractionTowards(
      points.bottomLeftCorner,
      options.cpFraction
    )
    points.leftStartCp2 = points.leftEndCp1.rotate(90, points.bottomLeftCorner)
    points.leftStart = points.leftEnd.rotate(90, points.bottomLeftCorner)
    points.rightStart = points.bottomRightCorner.shiftFractionTowards(
      points.bottomRight,
      options.sleeveBandCurve
    )
    points.rightStartCp2 = points.rightStart.shiftFractionTowards(
      points.bottomRightCorner,
      options.cpFraction
    )
    points.rightCp2 = points.rightStartCp2.rotate(-90, points.bottomRightCorner)
    points.rightEnd = points.rightStart.rotate(-90, points.bottomRightCorner)
    //guides
    // paths.scaffold = new Path()
    // .move(points.topLeft)
    // .line(points.bottomLeftCorner)
    // .line(points.bottomRightCorner)
    // .line(points.topRight)
    // .line(points.topLeft)
    // .close()
    //paths
    const drawSaBase = () => {
      if (options.sleeveBandType == 'curved') {
        return new Path()
          .move(points.rightStart)
          .curve(points.rightStartCp2, points.rightCp2, points.rightEnd)
          .line(points.topRight)
          .line(points.topLeft)
          .line(points.leftStart)
          .curve(points.leftStartCp2, points.leftEndCp1, points.leftEnd)
      } else {
        return new Path()
          .move(points.rightStart)
          .line(points.rightEnd)
          .line(points.topRight)
          .line(points.topLeft)
          .line(points.leftStart)
          .line(points.leftEnd)
      }
    }

    paths.saBase = drawSaBase().hide()

    macro('mirror', {
      mirror: [points.bottomLeftCorner, points.bottomRightCorner],
      paths: ['saBase'],
      prefix: 'm',
    })

    const drawSaBottom = () => {
      if (options.sleeveBandFolded) {
        return paths.mSaBase
      } else {
        return new Path().move(points.leftEnd).move(points.rightStart)
      }
    }

    paths.seam = paths.saBase.join(drawSaBottom().reverse()).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, drawSaBottom().edge('bottom').y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.topNotch = points.topRight.shiftTowards(
        points.topLeft,
        cuffEx / 2 + store.get('sleeveCuffNotchLength')
      )
      snippets.topNotch = new Snippet('notch', points.topNotch)
      //title
      let titleCutNum = 4
      if (options.sleeveBandFolded) titleCutNum = 2
      points.title = points.topLeft.translate(cuffLength / 4, drawSaBottom().edge('bottom').y / 2)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Cuff (Sleeve)',
        cutNr: titleCutNum,
        scale: 0.25,
      })
      //buttons & buttonholes
      points.buttonhole = points.bottomLeft.shift(90, cuffWidth / 2)
      points.button = points.bottomRight.shift(90, cuffWidth / 2)
      paths.buttonhole = new Path()
        .move(new Point(points.bottomLeft.x, points.topLeft.y))
        .line(new Point(points.bottomLeft.x, drawSaBottom().edge('bottom').y))
        .attr('class', 'mark help')
      paths.button = new Path()
        .move(new Point(points.bottomRight.x, points.topLeft.y))
        .line(new Point(points.bottomRight.x, drawSaBottom().edge('bottom').y))
        .attr('class', 'mark help')
      snippets.buttonhole = new Snippet('buttonhole', points.buttonhole).attr('data-rotate', 90)
      snippets.button = new Snippet('button', points.button)
      //if folded
      if (options.sleeveBandFolded) {
        points.bottomNotch = points.topNotch.flipY(points.bottomLeft)
        points.fButtonhole = points.buttonhole.flipY(points.bottomLeft)
        points.fButton = points.button.flipY(points.bottomLeft)
        snippets.bottomNotch = new Snippet('notch', points.bottomNotch)
        snippets.fButtonhole = new Snippet('buttonhole', points.fButtonhole).attr('data-rotate', 90)
        snippets.fButton = new Snippet('button', points.fButton)
      }

      if (sa) {
        if (options.sleeveBandFolded) {
          paths.sa = new Path()
            .move(points.topLeft)
            .line(points.topLeft.shift(-90, cuffWidth * 2))
            .line(points.topRight.shift(-90, cuffWidth * 2))
            .line(points.topRight)
            .line(points.topLeft)
            .offset(sa)
            .close()
            .attr('class', 'fabric sa')
        } else {
          paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
        }
        points.saTopRight = points.topRight.translate(sa, -sa)
        points.saTopLeft = points.topLeft.translate(-sa, -sa)
        points.saBottomLeftCorner = points.bottomLeftCorner.translate(-sa, sa)
        points.saBottomRightCorner = points.bottomRightCorner.translate(sa, sa)
        points.saBottomLeft = points.saTopLeft.flipY(points.bottomLeftCorner)
        points.saBottomRight = points.saTopRight.flipY(points.bottomLeftCorner)

        if (options.sleeveBandCurve > 0) {
          points.saRightStart = utils.beamIntersectsY(
            points.rightStart.shiftTowards(points.rightEnd, sa).rotate(-90, points.rightStart),
            points.rightEnd.shiftTowards(points.rightStart, sa).rotate(90, points.rightEnd),
            points.rightStart.y + sa
          )
          points.saRightEnd = utils.beamIntersectsX(
            points.rightStart.shiftTowards(points.rightEnd, sa).rotate(-90, points.rightStart),
            points.rightEnd.shiftTowards(points.rightStart, sa).rotate(90, points.rightEnd),
            points.rightEnd.x + sa
          )
          points.saLeftStart = utils.beamIntersectsX(
            points.leftStart.shiftTowards(points.leftEnd, sa).rotate(-90, points.leftStart),
            points.leftEnd.shiftTowards(points.leftStart, sa).rotate(90, points.leftEnd),
            points.leftStart.x - sa
          )
          points.saLeftEnd = utils.beamIntersectsY(
            points.leftStart.shiftTowards(points.leftEnd, sa).rotate(-90, points.leftStart),
            points.leftEnd.shiftTowards(points.leftStart, sa).rotate(90, points.leftEnd),
            points.leftEnd.y + sa
          )
        }

        const drawSa = () => {
          if (options.sleeveBandFolded) {
            return new Path()
              .move(points.saTopLeft)
              .line(points.saBottomLeft)
              .line(points.saBottomRight)
              .line(points.saTopRight)
              .line(points.saTopLeft)
          } else {
            if (options.sleeveBandCurve == 0) {
              return new Path()
                .move(points.saTopLeft)
                .line(points.saBottomLeftCorner)
                .line(points.saBottomRightCorner)
                .line(points.saBottomRightCorner)
                .line(points.saTopRight)
                .line(points.saTopLeft)
            } else {
              if (options.sleeveBandType == 'curved') {
                return new Path()
                  .move(points.leftStart)
                  .curve(points.leftStartCp2, points.leftEndCp1, points.leftEnd)
                  .line(points.rightStart)
                  .curve(points.rightStartCp2, points.rightCp2, points.rightEnd)
                  .offset(sa)
                  .line(points.saTopRight)
                  .line(points.saTopLeft)
              } else {
                if (options.sleeveBandCurve == 1) {
                  return new Path()
                    .move(points.saTopLeft)
                    .line(points.saLeftStart)
                    .line(points.saLeftEnd)
                    .line(points.saRightStart)
                    .line(points.saRightEnd)
                    .line(points.saTopRight)
                    .line(points.saTopLeft)
                } else {
                  return new Path()
                    .line(points.saTopLeft)
                    .line(points.saBottomLeftCorner)
                    .line(points.saBottomRightCorner)
                    .line(points.saTopRight)
                    .line(points.saTopLeft)
                }
              }
            }
          }
        }
        paths.sa = drawSa().close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
