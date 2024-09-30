import { apBase } from './apBase.mjs'
import { stars } from './stars.mjs'

export const cats = {
  name: 'merlin.cats',
  options: {
    //Imported
    ...stars.options,
    //Constant
    cpFraction: 0.55191502449,
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
    if (!options.appliques) {
      part.hide()
      return part
    }
    //measures
    const appliqueNumber = options.appliqueNumber
    const appliqueLength = absoluteOptions.appliqueLength
    const appliqueIncrement = absoluteOptions.appliqueIncrement
    const appliqueSa = sa * options.appliqueSaWidth * 100
    //draft base
    apBase(part, appliqueNumber, appliqueLength, appliqueIncrement, appliqueSa, true)

    //cat points
    for (let i = 0; i < appliqueNumber; i++) {
      const catWidth = appliqueLength + appliqueIncrement * i
      //points
      points['cat0' + i] = points['origin' + i].translate(catWidth * -0.16, catWidth * -0.5)
      points['cat1' + i] = points['origin' + i].translate(catWidth * -0.23, catWidth * -0.42)
      points['cat2' + i] = points['origin' + i].translate(catWidth * -0.323, catWidth * -0.417)
      points['cat3' + i] = points['origin' + i].translate(catWidth * -0.427, catWidth * -0.49)
      points['cat4' + i] = points['origin' + i].translate(catWidth * -0.437, catWidth * -0.453)
      points['cat5' + i] = points['origin' + i].translate(catWidth * -0.42, catWidth * -0.34)
      points['cat6' + i] = points['origin' + i].translate(catWidth * -0.443, catWidth * -0.27)
      points['cat7' + i] = points['origin' + i].translate(catWidth * -0.37, catWidth * -0.127)
      points['cat8' + i] = points['origin' + i].translate(catWidth * -0.357, catWidth * -0.05)
      points['cat9' + i] = points['origin' + i].translate(catWidth * -0.27, catWidth * 0.157)
      points['cat10' + i] = points['origin' + i].translate(catWidth * -0.27, catWidth * 0.29)
      points['cat11' + i] = points['origin' + i].translate(catWidth * -0.28, catWidth * 0.38)
      points['cat12' + i] = points['origin' + i].translate(catWidth * -0.317, catWidth * 0.42)
      points['cat13' + i] = points['origin' + i].translate(catWidth * -0.293, catWidth * 0.447)
      points['cat14' + i] = points['origin' + i].translate(catWidth * -0.237, catWidth * 0.487)
      points['cat15' + i] = points['origin' + i].translate(catWidth * -0.163, catWidth * 0.427)
      points['cat16' + i] = points['origin' + i].translate(catWidth * -0.123, catWidth * 0.433)
      points['cat17' + i] = points['origin' + i].translate(catWidth * -0.127, catWidth * 0.457)
      points['cat18' + i] = points['origin' + i].translate(catWidth * -0.07, catWidth * 0.5)
      points['cat19' + i] = points['origin' + i].translate(catWidth * 0.09, catWidth * 0.47)
      points['cat20' + i] = points['origin' + i].translate(catWidth * 0.23, catWidth * 0.442)
      points['cat21' + i] = points['origin' + i].translate(catWidth * 0.444, catWidth * 0.13)
      points['cat22' + i] = points['origin' + i].translate(catWidth * 0.108, catWidth * -0.292)
      points['cat23' + i] = points['origin' + i].translate(catWidth * 0.055, catWidth * -0.264)
      points['cat24' + i] = points['origin' + i].translate(catWidth * 0.083, catWidth * -0.21)
      points['cat25' + i] = points['origin' + i].translate(catWidth * 0.357, catWidth * 0.13)
      points['cat26' + i] = points['origin' + i].translate(catWidth * 0.2, catWidth * 0.36)
      points['cat27' + i] = points['origin' + i].translate(catWidth * 0.23, catWidth * 0.17)
      points['cat28' + i] = points['origin' + i].shift(90, catWidth * 0.16)
      points['cat29' + i] = points['origin' + i].translate(catWidth * -0.117, catWidth * -0.263)
      points['cat30' + i] = points['origin' + i].translate(catWidth * -0.153, catWidth * -0.337)
      points['cat31' + i] = points['origin' + i].translate(catWidth * -0.14, catWidth * -0.44)

      //control points
      points['cat0' + i + 'Cp1'] = new Point(points['cat31' + i].x, points['cat0' + i].y)
      points['cat1' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * -0.193,
        catWidth * -0.5
      )
      points['cat2' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * -0.32,
        catWidth * -0.42
      )
      points['cat3' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * -0.397,
        catWidth * -0.49
      )
      points['cat4' + i + 'Cp1'] = new Point(points['cat4' + i].x, points['cat3' + i].y)
      points['cat5' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * -0.437,
        catWidth * -0.4
      )
      points['cat6' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * -0.443,
        catWidth * -0.317
      )
      points['cat7' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * -0.443,
        catWidth * -0.2
      )
      points['cat8' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * -0.353,
        catWidth * -0.077
      )
      points['cat8' + i + 'Cp2'] = points['cat8' + i].shift(
        -90,
        (points['cat9' + i].y - points['cat8' + i].y) * 0.25
      )
      points['cat9' + i + 'Cp1'] = points['cat9' + i].shift(
        90,
        ((points['cat10' + i].y - points['cat9' + i].y) * 1) / 3
      )
      points['cat11' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * -0.278,
        catWidth * 0.379
      )
      points['cat12' + i + 'Cp1'] = points['cat12' + i].shift(
        90,
        (points['cat13' + i].y - points['cat12' + i].y) * 0.75
      )
      points['cat12' + i + 'Cp2'] = points['cat12' + i].shift(
        -90,
        (points['cat13' + i].y - points['cat12' + i].y) * 0.5
      )
      points['cat13' + i + 'Cp1'] = points['cat13' + i].shift(
        180,
        (points['cat13' + i].x - points['cat12' + i].x) * 0.5
      )
      points['cat14' + i + 'Cp1'] = new Point(points['cat13' + i].x, points['cat14' + i].y)
      points['cat15' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * -0.187,
        catWidth * 0.487
      )
      points['cat17' + i + 'Cp1'] = points['cat17' + i].shift(
        90,
        (points['cat18' + i].y - points['cat17' + i].y) * 0.25
      )
      points['cat18' + i + 'Cp1'] = new Point(points['cat17' + i].x, points['cat18' + i].y)
      points['cat19' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * -0.017,
        catWidth * 0.5
      )
      points['cat20' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * 0.143,
        catWidth * 0.493
      )
      points['cat21' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * 0.444,
        catWidth * 0.363
      )
      points['cat22' + i + 'Cp1'] = utils.beamsIntersect(
        points['cat22' + i],
        points['cat24' + i].rotate(90, points['cat22' + i]),
        points['cat21' + i],
        points['cat21' + i].shift(90, 1)
      )
      points['cat22' + i + 'Cp2'] = points['cat22' + i]
        .shiftFractionTowards(points['cat24' + i], options.cpFraction * 0.5)
        .rotate(-90, points['cat22' + i])
      points['cat23' + i + 'Cp1'] = points['cat23' + i].shift(
        points['cat24' + i].angle(points['cat22' + i]),
        points['cat24' + i].dist(points['cat22' + i]) * options.cpFraction * 0.5
      )
      points['cat23' + i + 'Cp2'] = points['cat23' + i].shift(
        points['cat22' + i].angle(points['cat24' + i]),
        points['cat22' + i].dist(points['cat24' + i]) * options.cpFraction * 0.5
      )
      points['cat24' + i + 'Cp1'] = points['cat24' + i]
        .shiftFractionTowards(points['cat22' + i], options.cpFraction * 0.5)
        .rotate(90, points['cat24' + i])
      points['cat25' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * 0.357,
        catWidth * -0.125
      )
      points['cat26' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * 0.357,
        catWidth * 0.303
      )
      points['cat27' + i + 'Cp1'] = points['origin' + i].translate(
        catWidth * 0.23,
        catWidth * 0.294
      )
      points['cat28' + i + 'Cp2'] = points['cat28' + i]
        .shiftFractionTowards(points['cat29' + i], 0.15)
        .rotate(-90, points['cat29' + i].shiftFractionTowards(points['cat28' + i], 0.75))
      points['cat28' + i + 'Cp1'] = utils.beamsIntersect(
        points['cat28' + i],
        points['cat28' + i + 'Cp2'],
        points['cat27' + i],
        points['cat27' + i].shift(90, 1)
      )
      points['cat29' + i + 'Cp1'] = points['cat29' + i]
        .shiftFractionTowards(points['cat28' + i], 0.15)
        .rotate(-90, points['cat29' + i].shiftFractionTowards(points['cat28' + i], 0.25))
      points['cat30' + i + 'Cp1'] = points['cat30' + i]
        .shiftFractionTowards(points['cat29' + i], 0.4)
        .rotate(-90, points['cat30' + i].shiftFractionTowards(points['cat29' + i], 0.5))
      points['cat31' + i + 'Cp1'] = points['cat0' + i + 'Cp1'].rotate(180, points['cat31' + i])

      //paths
      paths['seam' + i] = new Path()
        .move(points['cat0' + i])
        ._curve(points['cat1' + i + 'Cp1'], points['cat1' + i])
        .curve_(points['cat2' + i + 'Cp1'], points['cat2' + i])
        .curve_(points['cat3' + i + 'Cp1'], points['cat3' + i])
        ._curve(points['cat4' + i + 'Cp1'], points['cat4' + i])
        .curve_(points['cat5' + i + 'Cp1'], points['cat5' + i])
        .curve_(points['cat6' + i + 'Cp1'], points['cat6' + i])
        .curve_(points['cat7' + i + 'Cp1'], points['cat7' + i])
        .curve_(points['cat8' + i + 'Cp1'], points['cat8' + i])
        .curve(points['cat8' + i + 'Cp2'], points['cat9' + i + 'Cp1'], points['cat9' + i])
        .line(points['cat10' + i])
        .curve_(points['cat11' + i + 'Cp1'], points['cat11' + i])
        ._curve(points['cat12' + i + 'Cp1'], points['cat12' + i])
        .curve(points['cat12' + i + 'Cp2'], points['cat13' + i + 'Cp1'], points['cat13' + i])
        ._curve(points['cat14' + i + 'Cp1'], points['cat14' + i])
        ._curve(points['cat15' + i + 'Cp1'], points['cat15' + i])
        .line(points['cat16' + i])
        ._curve(points['cat17' + i + 'Cp1'], points['cat17' + i])
        ._curve(points['cat18' + i + 'Cp1'], points['cat18' + i])
        .curve_(points['cat19' + i + 'Cp1'], points['cat19' + i])
        .curve_(points['cat20' + i + 'Cp1'], points['cat20' + i])
        .curve_(points['cat21' + i + 'Cp1'], points['cat21' + i])
        .curve_(points['cat22' + i + 'Cp1'], points['cat22' + i])
        .curve(points['cat22' + i + 'Cp2'], points['cat23' + i + 'Cp1'], points['cat23' + i])
        .curve(points['cat23' + i + 'Cp2'], points['cat24' + i + 'Cp1'], points['cat24' + i])
        ._curve(points['cat25' + i + 'Cp1'], points['cat25' + i])
        ._curve(points['cat26' + i + 'Cp1'], points['cat26' + i])
        ._curve(points['cat27' + i + 'Cp1'], points['cat27' + i])
        ._curve(points['cat28' + i + 'Cp1'], points['cat28' + i])
        .curve(points['cat28' + i + 'Cp2'], points['cat29' + i + 'Cp1'], points['cat29' + i])
        ._curve(points['cat30' + i + 'Cp1'], points['cat30' + i])
        ._curve(points['cat31' + i + 'Cp1'], points['cat31' + i])
        ._curve(points['cat0' + i + 'Cp1'], points['cat0' + i])
        .close()

      if (complete) {
        //title
        points['title' + i] = points['origin' + i].shiftFractionTowards(points['cat8' + i], 0.5)
        macro('title', {
          at: points['title' + i],
          nr: 6,
          title: 'Cat (' + utils.units(catWidth) + ')',
          prefix: i,
          cutNr: false,
          scale: (i + 1) * 0.075,
        })

        if (sa && options.appliqueSaWidth > 0) {
          paths['sa' + i] = new Path()
            .move(points['cat0' + i])
            .line(points['cat3' + i + 'Cp1'])
            ._curve(points['cat4' + i + 'Cp1'], points['cat4' + i])
            .line(points['cat6' + i])
            .curve_(points['cat7' + i + 'Cp1'], points['cat7' + i])
            .curve_(points['cat8' + i + 'Cp1'], points['cat8' + i])
            .curve(points['cat8' + i + 'Cp2'], points['cat9' + i + 'Cp1'], points['cat9' + i])
            ._curve(points['cat10' + i], points['cat12' + i])
            .curve(points['cat12' + i + 'Cp2'], points['cat14' + i + 'Cp1'], points['cat14' + i])
            ._curve(points['cat18' + i + 'Cp1'], points['cat18' + i])
            .curve(points['cat19' + i + 'Cp1'], points['cat20' + i + 'Cp1'], points['cat20' + i])
            .curve_(points['cat21' + i + 'Cp1'], points['cat21' + i])
            .curve_(points['cat22' + i + 'Cp1'], points['cat22' + i])
            ._curve(points['cat0' + i + 'Cp1'], points['cat0' + i])
            .offset(appliqueSa)
            .close()
            .attr('class', 'fabric sa')
        }
      }

      if (paperless) {
        macro('hd', {
          from: points['cat6' + i],
          to: points['cat21' + i],
          y: points['cat0' + i].y - appliqueSa,
        })

        macro('vd', {
          from: points['cat0' + i],
          to: points['cat18' + i],
          x: points['cat6' + i].x - appliqueSa,
        })
      }
    }

    return part
  },
}
