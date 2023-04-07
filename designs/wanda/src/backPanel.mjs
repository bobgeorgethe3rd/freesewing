import { skirtBase } from './skirtBase.mjs'

export const backPanel = {
  name: 'wanda.backPanel',
  from: skirtBase,
  hide: {
    from: true,
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
    //set Render
    if (options.style == 'straight') {
      part.hide()
      return part
    }
    //removing paths
    for (let i in paths) delete paths[i]
    //let's begin
    let bellSplit = new Path()
      .move(points.waist6B)
      .curve(points.waist6Cp1B, points.waist6Cp2B, points.waistEndB)
      .split(points.waistL)
    for (let i in bellSplit) {
      paths['bellWaist' + i] = bellSplit[i].hide()
    }

    const drawHemBase = () => {
      if (options.style == 'bell') {
        return new Path().move(points.hemL).curve(points.hemLCp2, points.hemKCp1B, points.hemK)
      } else {
        return new Path().move(points.hemN).curve(points.hemNCp2, points.hemKCp1U, points.hemK)
      }
    }

    const drawSaBase = () => {
      if (options.style == 'bell') {
        return new Path()
          .move(points.hemK)
          .line(points.waist6B)
          .join(paths.bellWaist0)
          .line(points.hemL)
      } else {
        return new Path()
          .move(points.hemK)
          .line(points.waist6)
          .curve(points.waist6Cp1, points.waistHCp2, points.waistH)
          .line(points.hemN)
      }
    }

    //paths
    paths.seam = drawHemBase().join(drawSaBase()).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waist6.shiftFractionTowards(points.hemK, 0.025)
      points.grainlineTo = points.hemK.shiftFractionTowards(points.waist6, 0.025)
      macro('grainline', {
        from: points.waist6.rotate(90, points.grainlineFrom),
        to: points.hemK.rotate(-90, points.grainlineTo),
      })
      //title
      points.title = points.waist6Cp1B.shiftFractionTowards(points.hemKCp1B, 0.5)
      macro('title', {
        nr: '3',
        title: 'Back Panel',
        at: points.title,
        rotation: 90 - points.hemK.angle(points.origin),
      })
      //facings
      let skirtHemFacingWidth = store.get('skirtHemFacingWidth')

      let lineFrom
      let lineTo
      let hemFacingEnd
      let hemFacingCp2
      let hemFacingCp1
      if (options.style == 'bell') {
        lineFrom = points.hemL
        lineTo = points.waistL
        hemFacingEnd = points.hemL.shiftTowards(points.origin, skirtHemFacingWidth)
        hemFacingCp2 = utils.beamsIntersect(
          points.hemLCp2,
          points.origin,
          hemFacingEnd,
          points.origin.rotate(-90, hemFacingEnd)
        )
        hemFacingCp1 = utils.beamsIntersect(
          points.hemKCp1B,
          points.origin,
          points.hemFacingK,
          points.origin.rotate(90, points.hemFacingK)
        )
      } else {
        lineFrom = points.hemN
        lineTo = points.waistH
        hemFacingEnd = points.hemN.shiftTowards(points.origin, skirtHemFacingWidth)
        hemFacingCp2 = utils.beamsIntersect(
          points.hemNCp2,
          points.origin,
          hemFacingEnd,
          points.origin.rotate(-90, hemFacingEnd)
        )
        hemFacingCp1 = utils.beamsIntersect(
          points.hemKCp1U,
          points.origin,
          points.hemFacingK,
          points.origin.rotate(90, points.hemFacingK)
        )
      }

      points.hemFacingSplit = utils.lineIntersectsCurve(
        lineFrom,
        lineTo,
        points.hemFacingK,
        hemFacingCp1,
        hemFacingCp2,
        hemFacingEnd
      )

      let hemFacingSplit = new Path()
        .move(points.hemFacingK)
        .curve(hemFacingCp1, hemFacingCp2, hemFacingEnd)
        .split(points.hemFacingSplit)
      for (let i in hemFacingSplit) {
        paths['hemFacing' + i] = hemFacingSplit[i].hide()
      }

      paths.hemFacing = paths.hemFacing0
        .clone()
        .reverse()
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')

      //pleats

      if (sa) {
        paths.sa = drawHemBase()
          .offset(sa * options.skirtHemWidth * 100)
          .join(drawSaBase().offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
