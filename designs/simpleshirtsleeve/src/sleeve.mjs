import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { sleeve as basicsleeve } from '@freesewing/basicsleeve'

export const sleeve = {
  name: 'simpleshirtsleeve.sleeve',
  measurements: [...basicsleeve.measurements],
  options: {
    //Imported
    ...basicsleeve.options,
    //Constants
    sleeveFlounces: 'none', //Locked for Simpleshirtsleeve
    sleeveBands: 'false', //Locked for Simpleshirtsleeve
    //Sleeves
    sleeveHemStyle: { dflt: 'cuffed', list: ['cuffed', 'band', 'turnover'], menu: 'sleeves' },
    sleeveLength: { pct: 25, min: 15, max: 100, menu: 'sleeves' },
    sleeveSideCurve: { pct: 50, min: 0, max: 100, menu: 'sleeves' },
    //Advanced
    sleeveSideCurveDepth: { pct: 50, min: 30, max: 70, menu: 'advanced.sleeves' },
  },
  plugins: [pluginBundle, pluginMirror],
  draft: (sh) => {
    //draft
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
    //settings
    if (options.sleeveHemStyle == 'band') {
      options.sleeveBands = true
    }
    //draft
    basicsleeve.draft(sh)
    //remove paths
    const keepThese = ['sleevecap', 'grainline']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //removing macros not required from sleeve
    macro('title', false)
    //measurements
    const sleeveBandWidth = absoluteOptions.sleeveBandWidth
    //let's begin
    points.bottomLeftCp1Max = new Point(
      points.bottomLeft.x,
      points.bottomLeft.y * options.sleeveSideCurveDepth
    )

    const sleeveSideAngle =
      points.sleeveCapLeft.angle(points.bottomLeftCp1Max) -
      points.sleeveCapLeft.angle(points.bottomLeft)

    points.bottomLeftCp1 = points.bottomLeftCp1Max.rotate(
      sleeveSideAngle * (1 - options.sleeveSideCurve),
      points.bottomLeft
    )
    points.bottomRightCp2 = new Point(
      points.bottomRight.x,
      points.bottomRight.y * options.sleeveSideCurveDepth
    ).rotate(sleeveSideAngle * (1 - options.sleeveSideCurve) * -1, points.bottomRight)

    paths.saLeft = new Path()
      .move(points.sleeveCapLeft)
      ._curve(points.bottomLeftCp1, points.bottomLeft)
      .hide()

    paths.saRight = new Path()
      .move(points.bottomRight)
      .curve_(points.bottomRightCp2, points.sleeveCapRight)
      .hide()

    if (options.sleeveHemStyle != 'band' && points.bottomAnchor.y > 0) {
      if (sleeveBandWidth > points.bottomAnchor.y) {
        points.splitAnchor = new Point(points.midAnchor.x, points.bottomAnchor.y * 0.5)
      } else {
        points.splitAnchor = points.bottomAnchor.shift(90, sleeveBandWidth)
      }
      points.splitLeft = utils.lineIntersectsCurve(
        points.splitAnchor,
        points.splitAnchor.shift(180, points.sleeveCapLeft.dist(points.sleeveCapRight) * 10),
        points.sleeveCapLeft,
        points.sleeveCapLeft,
        points.bottomLeftCp1,
        points.bottomLeft
      )
      points.splitRight = points.splitLeft.flipX(points.bottomAnchor)
      macro('mirror', {
        mirror: [points.bottomLeft, points.bottomRight],
        points: [
          'sleeveCapLeft',
          'bottomLeftCp1',
          'splitLeft',
          'splitRight',
          'bottomRightCp2',
          'sleeveCapRight',
        ],
        prefix: 'm',
      })
      paths.saLeft1 = new Path()
        .move(points.bottomLeft)
        .curve_(points.mBottomLeftCp1, points.mSleeveCapLeft)
        .split(points.mSplitLeft)[0]
        .hide()
      paths.saRight1 = new Path()
        .move(points.mSleeveCapRight)
        ._curve(points.mBottomRightCp2, points.bottomRight)
        .split(points.mSplitRight)[1]
        .hide()

      macro('mirror', {
        mirror: [points.mSplitLeft, points.mSplitRight],
        paths: ['saLeft1', 'saRight1'],
        prefix: 'm',
      })
    }

    const drawSaLeft = () => {
      if (options.sleeveHemStyle != 'band' && points.bottomAnchor.y > 0) {
        if (options.sleeveHemStyle == 'cuffed') {
          return paths.saLeft.join(paths.saLeft1).join(paths.mSaLeft1.reverse())
        } else {
          return paths.saLeft.join(paths.saLeft1)
        }
      } else {
        return paths.saLeft
      }
    }

    const drawHemBase = () => {
      if (options.sleeveHemStyle != 'band' && points.bottomAnchor.y > 0) {
        if (options.sleeveHemStyle == 'cuffed') {
          return new Path().move(paths.mSaLeft1.start()).line(paths.mSaRight1.end())
        } else {
          return new Path().move(points.mSplitLeft).line(points.mSplitRight)
        }
      } else {
        return new Path().move(points.bottomLeft).line(points.bottomRight)
      }
    }

    const drawSaRight = () => {
      if (options.sleeveHemStyle != 'band' && points.bottomAnchor.y > 0) {
        if (options.sleeveHemStyle == 'cuffed') {
          return paths.mSaRight1.reverse().join(paths.saRight1).join(paths.saRight)
        } else {
          return paths.saRight1.join(paths.saRight)
        }
      } else {
        return paths.saRight
      }
    }

    paths.seam = drawHemBase().join(drawSaRight()).join(paths.sleevecap).join(drawSaLeft()).close()

    //stores
    store.set('sleeveBandLength', points.bottomLeft.dist(points.bottomRight))

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Sleeve',
        scale: 0.5,
      })
      //foldlines
      if (options.sleeveHemStyle != 'band' && points.bottomAnchor.y > 0) {
        paths.hemFold = new Path()
          .move(points.bottomLeft)
          .line(points.bottomRight)
          .attr('class', 'mark help')
          .attr('data-text', 'Hem Fold-line')
          .attr('data-text-class', 'center')
        if (options.sleeveHemStyle == 'cuffed') {
          paths.cuffFold = new Path()
            .move(points.mSplitLeft)
            .line(points.mSplitRight)
            .attr('class', 'mark help')
            .attr('data-text', 'Cuff Fold-line')
            .attr('data-text-class', 'center')
        }
      }

      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        paths.sa = drawHemBase()
          .offset(sa)
          .join(drawSaRight().offset(sideSeamSa))
          .join(paths.sleevecap.offset(sa * options.armholeSaWidth * 100))
          .join(drawSaLeft().offset(sideSeamSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
