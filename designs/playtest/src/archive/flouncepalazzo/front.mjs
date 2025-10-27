import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { front as frontDalton } from '@freesewing/dalton'
import { pctBasedOn } from '@freesewing/core'

export const front = {
  name: 'playtest.front',
  from: frontDalton,
  hide: {
    from: true,
  },
  options: {
    //Constants
    ankleEase: 0.108, //Locked for Playtest
    calfEase: 0.067, //Locked for Playtest
    heelEase: 0.076, //Locked for Playtest
    kneeEase: 0.066, //Locked for Playtest
    fitCalf: false, //Locked for Playtest
    fitFloor: false, //Locked for Playtest
    fitKnee: false, //Locked for Playtest
    useHeel: true, //Locked for Playtest
    calculateLegBandDiff: false, //Locked for Playtest
    legBandWidth: {
      pct: 0,
      min: 0,
      max: 0,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
    }, //Locked for Playtest
    //Fit
    fitGuides: { bool: false, menu: 'fit' }, //Altered for Playtest
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' }, //Altered for Playtest
    daltonGuides: { bool: false, menu: 'fit' },
    //Style
    waistbandWidth: {
      pct: 2.4,
      min: 1,
      max: 6,
      snap: 1.25,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Playtest
    //Construction
    hemWidth: { pct: 1.5, min: 0, max: 10, menu: 'construction' }, //Altered for Playtest
    inseamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Playtest
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Playtest
    flounceSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
  },
  plugins: [pluginBundle, pluginMirror],
  draft: ({
    options,
    Point,
    Path,
    points,
    paths,
    Snippet,
    snippets,
    utils,
    complete,
    sa,
    store,
    paperless,
    macro,
    part,
  }) => {
    //removing paths and snippets not required from Dalton
    const keepPaths = ['seam', 'kneeGuide', 'seatGuide', 'hipsGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    const keepSnippets = [
      'kneeGuideIn-notch',
      'kneeGuideOut-notch',
      'seatGuideIn-notch',
      'seatGuideOut-notch',
      'hipsGuideIn-notch',
      'hipsGuideOut-notch',
    ]
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //draw paths
    const drawOutseam = () => {
      if (points.seatOutAnchor.x < points.seatOut.x)
        return new Path()
          .move(points.waistOut)
          .curve(points.seatOut, points.floorOutCp1, points.floorOut)
      else
        return new Path()
          .move(points.waistOut)
          ._curve(points.seatOutCp1, points.seatOut)
          .curve(points.seatOutCp2, points.floorOutCp1, points.floorOut)
    }
    paths.outSeamInitial = drawOutseam().hide()
    //let's begin
    points.upperLegInAnchor = points.upperLegIn
    points.upperLegIn = utils.beamIntersectsY(
      points.waistIn,
      points.crotchSeamCurveEnd,
      points.upperLegIn.y
    )

    points.upperLegInCp1 = points.upperLegIn.shift(
      points.upperLegIn.angle(points.waistIn) + 90,
      points.upperLegInAnchor.dist(points.upperLegInCp2)
    )

    if (points.upperLegInCp1.x < points.floorIn.x && points.upperLegIn.x > points.floorIn.x) {
      points.upperLegInCp1 = utils.beamIntersectsY(
        points.upperLegIn,
        points.upperLegInCp1,
        points.floorIn.y
      )
    }

    points.floorIn = new Point(points.upperLegInCp1.x, points.floor.y)
    points.floorInCp2 = new Point(points.floorIn.x, points.floorInCp2.y)

    points.outSeamAnchor = drawOutseam().edge('left')

    if (points.seatOutAnchor.x < points.seatOut.x) {
      points.floorOut = new Point(points.seatOut.x, points.floor.y)
    } else {
      points.floorOut = new Point(points.outSeamAnchor.x, points.floor.y)
    }
    points.floorOutCp1 = new Point(points.floorOut.x, points.floorOutCp1.y)
    //mirror time
    points.waistSplit = points.waistOut.shiftFractionTowards(points.waistIn, 0.5)
    points.floorSplit = points.floorOut.shiftFractionTowards(points.floorIn, 0.5)

    paths.inseam = new Path()
      .move(points.floorIn)
      .curve(points.floorInCp2, points.upperLegInCp1, points.upperLegIn)
      .hide()

    macro('mirror', {
      mirror: [points.upperLegIn, points.waistIn],
      points: ['floorSplit', 'waistSplit'],
      paths: ['inseam'],
      prefix: 'm',
    })

    //path
    const drawSideSeam = () => {
      if (points.seatOutAnchor.x < points.seatOut.x)
        return new Path()
          .move(points.waistOut)
          .curve(points.seatOut, points.floorOutCp1, points.floorOut)
      else return paths.outSeamInitial.split(points.outSeamAnchor)[0].line(points.floorOut)
    }

    paths.outSeam = drawSideSeam().hide()

    paths.seam = new Path()
      .move(points.floorOut)
      .line(points.floorIn)
      .join(paths.inseam)
      .join(paths.mInseam.reverse())
      .line(points.mFloorSplit)
      .line(points.mWaistSplit)
      .line(points.waistIn)
      .line(points.waistOut)
      .join(drawSideSeam())
      .close()

    //stores
    store.set('backCrossExtension', points.upperLegInAnchor.dist(points.upperLegIn))
    store.set('flounceSeamLength', points.waistSplit.dist(points.floorSplit))
    store.set('flounceFrontWidth', points.waistOut.dist(points.waistSplit) * 0.5)

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistIn
      points.grainlineTo = points.upperLegIn
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.upperLegIn = new Snippet('notch', points.upperLegIn)
      //title
      macro('title', {
        nr: 2,
        title: 'Front',
        at: points.title,
        cutNr: 1,
        scale: 0.5,
      })
      if (options.fitGuides) {
        macro('mirror', {
          mirror: [points.upperLegIn, points.waistIn],
          paths: ['seatGuide', 'hipsGuide'],
          points: ['seatGuideOut', 'seatGuideIn', 'hipsGuideOut', 'hipsGuideIn'],
          prefix: 'm',
        })
        macro('sprinkle', {
          snippet: 'notch',
          on: ['mSeatGuideOut', 'mSeatGuideIn', 'mHipsGuideOut', 'mHipsGuideIn'],
        })
      }
      if (sa) {
        const inseamSa = sa * options.inseamSaWidth * 100
        const flounceSa = sa * options.flounceSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        points.saFloorIn = new Point(points.floorIn.x + inseamSa, points.saFloorIn.y)
        points.saWaistIn = utils.beamsIntersect(
          points.upperLegIn,
          points.waistIn,
          points.saWaistOut,
          points.saWaistOut.shift(points.waistOut.angle(points.waistIn), 1)
        )
        points.saFloorOut = new Point(points.floorOut.x - inseamSa, points.saFloorIn.y)

        paths.saInseam = paths.inseam.offset(inseamSa).hide()

        macro('mirror', {
          mirror: [points.upperLegIn, points.waistIn],
          points: ['floorIn', 'saFloorIn'],
          paths: ['saInseam'],
          prefix: 'm',
        })

        points.saMFloorSplit = utils.beamsIntersect(
          points.mSaFloorIn,
          points.mSaFloorIn.shift(points.mFloorIn.angle(points.mFloorSplit), 1),
          points.mFloorSplit
            .shiftTowards(points.mWaistSplit, flounceSa)
            .rotate(-90, points.mFloorSplit),
          points.mWaistSplit
            .shiftTowards(points.mFloorSplit, flounceSa)
            .rotate(90, points.mWaistSplit)
        )

        points.saMWaistSplit = utils.beamsIntersect(
          points.saMFloorSplit,
          points.saMFloorSplit.shift(points.mFloorSplit.angle(points.mWaistSplit), 1),
          points.saWaistIn,
          points.saWaistIn.shift(points.waistIn.angle(points.mWaistSplit), 1)
        )

        paths.sa = new Path()
          .move(points.saFloorOut)
          .line(points.saFloorIn)
          .join(paths.saInseam)
          .join(paths.mSaInseam.reverse())
          .line(points.mSaFloorIn)
          .line(points.saMFloorSplit)
          .line(points.saMWaistSplit)
          .line(points.saWaistIn)
          .line(points.saWaistOut)
          .join(drawSideSeam().offset(sideSeamSa))
          .line(points.saFloorOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
