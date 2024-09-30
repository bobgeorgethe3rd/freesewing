import { apBase } from './apBase.mjs'
import { stars } from './stars.mjs'

export const moons = {
  name: 'merlin.moons',
  options: {
    //Imported
    ...stars.options,
    //Constant
    cpFraction: 0.55191502449,
    //Appliques
    moonFraction: { pct: 75, min: 50, max: 100, menu: 'appliques' },
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

    //moon points
    for (let i = 0; i < appliqueNumber; i++) {
      const moonWidth = appliqueLength + appliqueIncrement * i

      points['innerOrigin' + i] = points['origin' + i].shift(
        0,
        (moonWidth / 2) * options.moonFraction
      )

      for (let j = 0; j <= 2; j++) {
        points['outerMoon' + j + i] = points['origin' + i].shift(90 * j, moonWidth / 2)
        if (j != 2) {
          points['innerMoon' + j + i] = points['innerOrigin' + i].shift(90 + 90 * j, moonWidth / 2)
        }
      }

      points['innerMoonTop' + i] = points['origin' + i].translate(
        (points['innerOrigin' + i].x - points['origin' + i].x) / 2,
        -Math.sqrt(
          Math.pow(moonWidth / 2, 2) -
            Math.pow((points['innerOrigin' + i].x - points['origin' + i].x) / 2, 2)
        )
      )

      points['innerMoonBottom' + i] = points['innerMoonTop' + i].flipY()

      const outerCpDistance =
        (4 / 3) *
        (moonWidth / 2) *
        Math.tan(utils.deg2rad((180 - points['origin' + i].angle(points['innerMoonTop' + i])) / 4))
      const innerCpDistance =
        (4 / 3) *
        (moonWidth / 2) *
        Math.tan(
          utils.deg2rad((180 - points['innerOrigin' + i].angle(points['innerMoonTop' + i])) / 4)
        )

      points['innerMoonTop' + i + 'Cp2'] = points['innerMoonTop' + i]
        .shiftTowards(points['origin' + i], outerCpDistance)
        .rotate(-90, points['innerMoonTop' + i])
      points['outerMoon2' + i + 'Cp1'] = points['outerMoon2' + i]
        .shiftTowards(points['origin' + i], outerCpDistance)
        .rotate(90, points['outerMoon2' + i])
      points['outerMoon2' + i + 'Cp2'] = points['outerMoon2' + i + 'Cp1'].flipY()
      points['innerMoonBottom' + i + 'Cp1'] = points['innerMoonTop' + i + 'Cp2'].flipY()

      points['innerMoonTop' + i + 'Cp1'] = points['innerMoonTop' + i]
        .shiftTowards(points['innerOrigin' + i], innerCpDistance)
        .rotate(-90, points['innerMoonTop' + i])
      points['innerMoon1' + i + 'Cp2'] = points['innerMoon1' + i]
        .shiftTowards(points['innerOrigin' + i], innerCpDistance)
        .rotate(90, points['innerMoon1' + i])
      points['innerMoon1' + i + 'Cp1'] = points['innerMoon1' + i + 'Cp2'].flipY()
      points['innerMoonBottom' + i + 'Cp2'] = points['innerMoonTop' + i + 'Cp1'].flipY()

      //paths
      paths['innerSeam' + i] = new Path()
        .move(points['innerMoonBottom' + i])
        .curve(
          points['innerMoonBottom' + i + 'Cp2'],
          points['innerMoon1' + i + 'Cp1'],
          points['innerMoon1' + i]
        )
        .curve(
          points['innerMoon1' + i + 'Cp2'],
          points['innerMoonTop' + i + 'Cp1'],
          points['innerMoonTop' + i]
        )
        .hide()

      paths['outerSeam' + i] = new Path()
        .move(points['innerMoonTop' + i])
        .curve(
          points['innerMoonTop' + i + 'Cp2'],
          points['outerMoon2' + i + 'Cp1'],
          points['outerMoon2' + i]
        )
        .curve(
          points['outerMoon2' + i + 'Cp2'],
          points['innerMoonBottom' + i + 'Cp1'],
          points['innerMoonBottom' + i]
        )
        .hide()

      paths['seam' + i] = paths['innerSeam' + i]
        .clone()
        .join(paths['outerSeam' + i])
        .close()

      if (complete) {
        //title
        points['title' + i] = points['innerMoon1' + i].shiftFractionTowards(
          points['outerMoon2' + i],
          2 / 3
        )
        macro('title', {
          at: points['title' + i],
          nr: 5,
          title: 'Moon (' + utils.units(moonWidth) + ')',
          prefix: i,
          cutNr: false,
          scale: (i + 1) * 0.05,
        })

        if (sa && options.appliqueSaWidth > 0) {
          points['saInnerMoonTop' + i] = points['innerMoonTop' + i].shift(0, appliqueSa)
          points['saInnerMoonBottom' + i] = points['innerMoonBottom' + i].shift(0, appliqueSa)
          //To not break paths['innerSeam' + i] is not included
          paths['sa' + i] = new Path()
            .move(points['saInnerMoonBottom' + i])
            .line(points['saInnerMoonTop' + i])
            .line(paths['outerSeam' + i].offset(appliqueSa).start())
            .join(paths['outerSeam' + i].offset(appliqueSa))
            .line(points['saInnerMoonBottom' + i])
            .close()
            .attr('class', 'fabric sa')
        }
      }
      if (paperless) {
        macro('hd', {
          from: points['outerMoon2' + i],
          to: points['innerMoonTop' + i],
          y: points['outerMoon1' + i].y - appliqueSa,
        })

        macro('vd', {
          from: points['outerMoon1' + i],
          to: points['outerMoon1' + i].flipY(),
          x: points['outerMoon2' + i].x - appliqueSa,
        })
      }
    }

    return part
  },
}
