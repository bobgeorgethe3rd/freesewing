import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { crown } from './crown.mjs'

export const earFlap = {
  name: 'henry.earFlap',
  plugins: [pluginLogoRG],
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Style
    earFlapStyle: {
      dflt: 'rounded',
      list: ['curved', 'rounded', 'pointed', 'triangle'],
      menu: 'style',
    },
    earFlapLength: { pct: 92.5, min: 80, max: 150, menu: 'style' },
    earFlapWidthBonus: { pct: 6, min: -20, max: 50, menu: 'style' },
    buttonholeEarFlap: { bool: false, menu: 'style' },
    earFlapTieWidth: {
      pct: 4.1,
      min: 2,
      max: 8,
      snap: 5,
      ...pctBasedOn('head'),
      menu: 'style',
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
    log,
    absoluteOptions,
  }) => {
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    void store.setIfUnset('crownLength', (store.get('headCircumference') * 0.55) / 2)

    const headCircumference = store.get('headCircumference')
    const crownLength = store.get('crownLength')

    let earFlapLength
    if (options.buttonholeEarFlap) {
      earFlapLength = crownLength * 1.15
    } else {
      earFlapLength = crownLength * options.earFlapLength
    }

    const earFlapWidth = (headCircumference / 6) * (1 + options.earFlapWidthBonus)

    const earFlapTieWidth = absoluteOptions.earFlapTieWidth

    //let's begin
    points.bottomMid = new Point(0, 0)
    points.topMid = points.bottomMid.shift(90, earFlapLength)
    points.bottomLeft = points.bottomMid.shift(180, earFlapWidth / 2)
    points.bottomRight = points.bottomLeft.flipX(points.bottomMid)
    points.topLeftAnchor = new Point(points.bottomLeft.x, points.topMid.y)
    points.topRightAnchor = new Point(points.bottomRight.x, points.topMid.y)

    points.bottomRightCp2 = points.bottomRight.shift(90, points.bottomLeft.x - points.topMid.y)
    points.topMidCp1 = points.topRightAnchor
    points.topMidCp2 = points.topMidCp1.flipX(points.bottomMid)
    points.bottomLeftCp1 = points.bottomRightCp2.flipX(points.bottomMid)

    if (options.earFlapStyle == 'rounded') {
      points.topCurveRight = points.topMid.rotate(90, points.topRightAnchor)
      points.topCurveRightCp2 = points.topCurveRight.shiftFractionTowards(
        points.topRightAnchor,
        options.cpFraction
      )
      points.topMidCp1 = points.topCurveRightCp2.rotate(-90, points.topRightAnchor)
      points.topMidCp2 = points.topMidCp1.flipX(points.bottomMid)
      points.topCurveLeftCp1 = points.topCurveRightCp2.flipX(points.bottomMid)
      points.topCurveLeft = points.topCurveRight.flipX(points.bottomMid)
    }

    if (options.earFlapStyle == 'triangle') {
      points.topRight = points.topMid.shift(0, earFlapTieWidth / 2)
      points.topLeft = points.topRight.flipX(points.bottomMid)
    }

    //paths
    const drawSeamBase = () => {
      switch (options.earFlapStyle) {
        case 'curved':
          return new Path()
            .move(points.bottomRight)
            .curve(points.bottomRightCp2, points.topMidCp1, points.topMid)
            .curve(points.topMidCp2, points.bottomLeftCp1, points.bottomLeft)
          break
        case 'rounded':
          return new Path()
            .move(points.bottomRight)
            .line(points.topCurveRight)
            .curve(points.topCurveRightCp2, points.topMidCp1, points.topMid)
            .curve(points.topMidCp2, points.topCurveLeftCp1, points.topCurveLeft)
            .line(points.bottomLeft)
          break
        case 'pointed':
          return new Path()
            .move(points.bottomRight)
            .curve_(points.topMidCp1, points.topMid)
            ._curve(points.topMidCp2, points.bottomLeft)
          break
        case 'triangle':
          return new Path()
            .move(points.bottomRight)
            .curve_(points.bottomRightCp2, points.topRight)
            .line(points.topLeft)
            ._curve(points.bottomLeftCp1, points.bottomLeft)
      }
    }

    paths.hemBase = new Path().move(points.bottomLeft).line(points.bottomRight).hide()

    paths.seam = paths.hemBase.clone().join(drawSeamBase())

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid.shiftFractionTowards(points.topLeftAnchor, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        points.bottomLeft.x * 0.75,
        points.bottomLeft.shiftFractionTowards(points.bottomLeftCp1, 2 / 3).y
      )
      macro('title', {
        at: points.title,
        nr: 2,
        title: 'earFlap' + utils.capitalize(options.earFlapStyle),
        scale: 0.25,
      })
      //logo
      points.logo = new Point(
        points.bottomLeft.x * 0.6,
        points.bottomLeft.shiftFractionTowards(points.bottomLeftCp1, 1 / 3).y
      )
      macro('logorg', {
        at: points.logo,
        scale: 0.25,
      })
      //scalebox
      points.scalebox = new Point(
        points.bottomRight.x * 0.6,
        points.bottomRight.shiftFractionTowards(points.bottomRightCp2, 1 / 3).y
      )
      macro('miniscale', {
        at: points.scalebox,
      })
      //buttonhole
      if (options.buttonholeEarFlap) {
        points.buttonhole = points.bottomMid.shift(90, crownLength)
        snippets.buttonhole = new Snippet('buttonhole', points.buttonhole).attr('data-scale', 2)
      }
      //centre line
      paths.centreLine = new Path()
        .move(points.topMid)
        .line(points.bottomMid)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Line')
        .attr('data-text-class', 'center')
      if (sa) {
        const crownSa = sa * options.crownSaWidth * 100

        points.saBottomLeft = points.bottomLeft.translate(-sa, crownSa)
        points.saBottomRight = points.saBottomLeft.flipX(points.bottomMid)

        const drawSaBase = () => {
          if (options.earFlapStyle == 'triangle') {
            points.saTopRight = utils.beamsIntersect(
              points.bottomRightCp2
                .shiftTowards(points.topRight, sa)
                .rotate(-90, points.bottomRightCp2),
              points.topRight.shiftTowards(points.bottomRightCp2, sa).rotate(90, points.topRight),
              points.topRight.shift(90, sa),
              points.topLeft.shift(90, sa)
            )

            points.saTopLeft = points.saTopRight.flipX(points.bottomMid)

            return new Path()
              .move(points.bottomRight)
              .curve_(points.bottomRightCp2, points.topRight)
              .offset(sa)
              .line(points.saTopRight)
              .line(points.saTopLeft)
              .join(
                new Path()
                  .move(points.topLeft)
                  ._curve(points.bottomLeftCp1, points.bottomLeft)
                  .offset(sa)
              )
          } else return drawSeamBase().offset(sa)
        }

        paths.sa = new Path()
          .move(points.saBottomLeft)
          .line(points.saBottomRight)
          .join(drawSaBase())
          .line(points.saBottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
      // Paperless?
      if (paperless) {
        macro('hd', {
          from: points.bottomLeft,
          to: points.bottomRight,
          y: points.bottomMid.y + sa * options.crownSaWidth * 100 + 15,
        })
        macro('vd', {
          from: points.bottomMid,
          to: points.topMid,
          x: points.bottomLeft.x - sa - 30,
        })
      }
    }
    return part
  },
}
