import { apBase } from './apBase.mjs'
import { stars } from './stars.mjs'

export const bats = {
  name: 'merlin.bats',
  options: {
    //Imported
    ...stars.options,
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

    //bat points
    for (let i = 0; i < appliqueNumber; i++) {
      const batWidth = appliqueLength + appliqueIncrement * i

      //points
      points['bat0' + i] = points['origin' + i].shift(90, batWidth * 0.227)
      points['bat1' + i] = points['origin' + i].translate(batWidth * -0.02, batWidth * -0.22)
      points['bat2' + i] = points['origin' + i].translate(batWidth * -0.073, batWidth * -0.25)
      points['bat3' + i] = points['origin' + i].translate(batWidth * -0.087, batWidth * -0.223)
      points['bat4' + i] = points['origin' + i].translate(batWidth * -0.067, batWidth * -0.17)
      points['bat5' + i] = points['origin' + i].translate(batWidth * -0.07, batWidth * -0.133)
      points['bat6' + i] = points['origin' + i].translate(batWidth * -0.157, batWidth * -0.103)
      points['bat7' + i] = points['origin' + i].translate(batWidth * -0.333, batWidth * -0.233)
      points['bat8' + i] = points['origin' + i].translate(batWidth * -0.5, batWidth * 0.057)
      points['bat9' + i] = points['origin' + i].translate(batWidth * -0.35, batWidth * 0.02)
      points['bat10' + i] = points['origin' + i].translate(batWidth * -0.193, batWidth * 0.117)
      points['bat11' + i] = points['origin' + i].translate(batWidth * -0.127, batWidth * 0.083)
      points['bat12' + i] = points['origin' + i].shift(-90, batWidth * 0.257)

      //control points
      points['bat0' + i + 'Cp2'] = points['origin' + i].translate(
        batWidth * -0.017,
        batWidth * -0.223
      )
      points['bat2' + i + 'Cp1'] = points['origin' + i].translate(
        batWidth * -0.05,
        batWidth * -0.25
      )
      points['bat2' + i + 'Cp2'] = new Point(points['bat3' + i].x, points['bat2' + i].y)
      points['bat3' + i + 'Cp2'] = points['origin' + i].translate(
        batWidth * -0.087,
        batWidth * -0.2
      )
      points['bat4' + i + 'Cp2'] = points['origin' + i].translate(
        batWidth * -0.07,
        (batWidth * -1) / 6
      )
      points['bat6' + i + 'Cp1'] = points['origin' + i].translate(
        batWidth * -0.1,
        batWidth * -0.103
      )
      points['bat6' + i + 'Cp2'] = points['origin' + i].translate(
        batWidth * -0.27,
        batWidth * -0.103
      )
      points['bat8' + i + 'Cp1'] = points['origin' + i].translate(
        batWidth * -0.5,
        batWidth * -0.067
      )
      points['bat9' + i + 'Cp1'] = points['origin' + i].translate(
        batWidth * -0.463,
        batWidth * 0.02
      )
      points['bat10' + i + 'Cp1'] = points['origin' + i].translate(
        batWidth * -0.25,
        batWidth * 0.02
      )
      points['bat11' + i + 'Cp1'] = points['origin' + i].translate(
        batWidth * -0.16,
        batWidth * 0.083
      )
      points['bat11' + i + 'Cp2'] = points['origin' + i].translate(
        batWidth * -0.05,
        batWidth * 0.083
      )

      //flip
      for (const p in points) {
        points['f' + utils.capitalize(p)] = points[p].flipX(points['origin' + i])
      }

      //paths
      paths['bat' + i] = new Path()
        .move(points['bat0' + i])
        .curve_(points['bat0' + i + 'Cp2'], points['bat1' + i])
        ._curve(points['bat2' + i + 'Cp1'], points['bat2' + i])
        .curve_(points['bat2' + i + 'Cp2'], points['bat3' + i])
        .curve_(points['bat3' + i + 'Cp2'], points['bat4' + i])
        .curve_(points['bat4' + i + 'Cp2'], points['bat5' + i])
        ._curve(points['bat6' + i + 'Cp1'], points['bat6' + i])
        .curve_(points['bat6' + i + 'Cp2'], points['bat7' + i])
        ._curve(points['bat8' + i + 'Cp1'], points['bat8' + i])
        ._curve(points['bat9' + i + 'Cp1'], points['bat9' + i])
        ._curve(points['bat10' + i + 'Cp1'], points['bat10' + i])
        ._curve(points['bat11' + i + 'Cp1'], points['bat11' + i])
        .curve_(points['bat11' + i + 'Cp2'], points['bat12' + i])
        ._curve(points['fBat11' + i + 'Cp2'], points['fBat11' + i])
        .curve_(points['fBat11' + i + 'Cp1'], points['fBat10' + i])
        .curve_(points['fBat10' + i + 'Cp1'], points['fBat9' + i])
        .curve_(points['fBat9' + i + 'Cp1'], points['fBat8' + i])
        .curve_(points['fBat8' + i + 'Cp1'], points['fBat7' + i])
        ._curve(points['fBat6' + i + 'Cp2'], points['fBat6' + i])
        .curve_(points['fBat6' + i + 'Cp1'], points['fBat5' + i])
        ._curve(points['fBat4' + i + 'Cp2'], points['fBat4' + i])
        ._curve(points['fBat3' + i + 'Cp2'], points['fBat3' + i])
        ._curve(points['fBat2' + i + 'Cp2'], points['fBat2' + i])
        .curve_(points['fBat2' + i + 'Cp1'], points['fBat1' + i])
        ._curve(points['fBat0' + i + 'Cp2'], points['fBat0' + i])
        .close()

      if (complete) {
        points['title' + i] = new Point(
          (points['bat1' + i].x + points['bat2' + i].x) / 2,
          points['origin' + i].y
        )
        macro('title', {
          at: points['title' + i],
          nr: 7,
          title: 'Bat (' + utils.units(batWidth) + ')',
          prefix: i,
          cutNr: false,
          scale: (i + 1) * 0.05,
        })
        if (sa && options.appliqueSaWidth > 0) {
          paths['sa' + i] = new Path()
            .move(points['fBat2' + i])
            .line(points['bat2' + i])
            .curve_(points['bat2' + i + 'Cp2'], points['bat7' + i])
            ._curve(points['bat8' + i + 'Cp1'], points['bat8' + i])
            .line(points['bat12' + i])
            .line(points['fBat8' + i])
            .curve_(points['fBat8' + i + 'Cp1'], points['fBat7' + i])
            ._curve(points['fBat2' + i + 'Cp2'], points['fBat2' + i])
            .offset(appliqueSa)
            .close()
            .attr('class', 'fabric sa')
        }
      }
      if (paperless) {
        macro('hd', {
          from: points['bat8' + i],
          to: points['fBat8' + i],
          y: points['bat2' + i].y - appliqueSa,
        })

        macro('vd', {
          from: points['bat2' + i],
          to: points['bat12' + i],
          x: points['bat8' + i].x - appliqueSa,
        })
      }
    }

    return part
  },
}
