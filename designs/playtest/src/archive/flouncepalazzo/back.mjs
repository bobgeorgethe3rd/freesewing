import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { back as backDalton } from '@freesewing/dalton'
import { front } from './front.mjs'
import { pctBasedOn } from '@freesewing/core'

export const back = {
  name: 'playtest.back',
  from: backDalton,
  after: front,
  hide: {
    from: true,
  },
  options: {
    //Construction
    crossSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Playtest
  },
  plugins: [pluginLogoRG],
  draft: ({
    options,
    Point,
    Path,
    points,
    paths,
    Snippet,
    snippets,
    complete,
    store,
    sa,
    paperless,
    macro,
    part,
  }) => {
    //removing paths and snippets not required from Dalton
    const keepPaths = ['seam', 'crossSeam', 'grainline', 'kneeGuide', 'seatGuide', 'hipsGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    const keepSnippets = [
      'crossSeamCurveStart',
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
    //remove macros
    macro('scalebox', false)
    //draw paths
    const drawOutseam = () => {
      if (points.seatOutAnchor.x > points.seatOut.x)
        return new Path()
          .move(points.floorOut)
          .curve(points.floorOutCp2, points.seatOut, points.waistOut)
      else
        return new Path()
          .move(points.floorOut)
          .curve(points.floorOutCp2, points.seatOutCp1, points.seatOut)
          .curve_(points.seatOutCp2, points.waistOut)
    }
    const drawWaist = () =>
      options.backDartWidth == 0
        ? new Path().move(points.waistOut).line(points.waistIn)
        : new Path()
            .move(points.waistOut)
            .line(points.dartOut)
            .line(points.dartTip)
            .line(points.dartIn)
            .line(points.waistIn)
    paths.outSeamInitial = drawOutseam().hide()
    //measures
    const backCrossExtension = store.get('backCrossExtension')
    //let's begin

    points.upperLegIn = points.upperLegInCp1.shiftOutwards(points.upperLegIn, backCrossExtension)
    points.upperLegInCp2 = points.upperLegInCp2.shift(
      points.upperLegInCp1.angle(points.upperLegIn),
      backCrossExtension
    )

    points.floorIn = new Point(points.upperLegInCp2.x, points.floor.y)
    points.floorInCp1 = new Point(points.floorIn.x, points.floorInCp1.y)

    points.outSeamAnchor = drawOutseam().edge('right')

    if (points.seatOutAnchor.x > points.seatOut.x) {
      points.floorOut = new Point(points.seatOut.x, points.floor.y)
    } else {
      points.floorOut = new Point(points.outSeamAnchor.x, points.floor.y)
    }
    points.floorOutCp2 = new Point(points.floorOut.x, points.floorOutCp2.y)

    //paths
    const drawSideSeam = () => {
      if (points.seatOutAnchor.x > points.seatOut.x)
        return new Path()
          .move(points.floorOut)
          .curve(points.floorOutCp2, points.seatOut, points.waistOut)
      else
        return new Path()
          .move(points.floorOut)
          .line(points.outSeamAnchor)
          .join(paths.outSeamInitial.split(points.outSeamAnchor)[1])
    }

    paths.crossSeam = paths.crossSeam.line(points.upperLegIn).hide()

    paths.inseam = new Path()
      .move(points.upperLegIn)
      .curve(points.upperLegInCp2, points.floorInCp1, points.floorIn)
      .hide()

    paths.seam = new Path()
      .move(points.floorIn)
      .line(points.floorOut)
      .join(drawSideSeam())
      .join(drawWaist())
      .join(paths.crossSeam)
      .join(paths.inseam)
      .close()

    if (complete) {
      //scalebox
      macro('scalebox', { at: points.scalebox })
      //logo
      points.logo = points.title.shiftFractionTowards(points.scalebox, 0.5)
      macro('logorg', { at: points.logo, scale: 1 / 3 })

      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const crossSeamSa = sa * options.crossSeamSaWidth * 100
        const inseamSa = sa * options.inseamSaWidth * 100

        points.saFloorOut = new Point(points.floorOut.x + sideSeamSa, points.saFloorOut.y)
        points.saUpperLegIn = points.upperLegIn
          .shift(points.upperLegInCp2.angle(points.upperLegIn), crossSeamSa)
          .shift(points.upperLegInCp1.angle(points.upperLegIn), inseamSa)
        points.saFloorIn = new Point(points.floorIn.x - inseamSa, points.saFloorIn.y)

        paths.sa = new Path()
          .move(points.saFloorIn)
          .line(points.saFloorOut)
          .join(drawSideSeam().offset(sideSeamSa))
          .line(points.saWaistOut)
          .line(points.saWaistIn)
          .join(paths.crossSeam.offset(crossSeamSa))
          .line(points.saUpperLegIn)
          .join(paths.inseam.offset(inseamSa))
          .line(points.saFloorIn)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
