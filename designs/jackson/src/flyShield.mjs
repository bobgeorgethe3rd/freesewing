import { frontBase } from './frontBase.mjs'

export const flyShield = {
  name: 'jackson.flyShield',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Plackets
    flyShieldCurved: { bool: false, menu: 'plackets' },
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
  }) => {
    //removing paths and snippets not required from Dalton
    const keepThese = ['seam', 'crotchSeam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //measures
    const flyShieldEx = store.get('flyShieldEx')
    //let's begin
    points.flyShieldWaist = points.flyShieldExWaist.shiftTowards(
      points.flyWaist,
      store.get('flyWidth')
    )
    points.flyShieldCorner = utils.beamsIntersect(
      points.flyShieldWaist,
      points.flyShieldWaist.shift(points.waistIn.angle(points.crotchSeamCurveStart), 1),
      points.flyShieldExCrotch,
      points.flyShieldCrotch
    )

    points.flyShieldCurveStart = points.flyShieldCrotch.rotate(90, points.flyShieldCorner)
    points.flyShieldCurveStartCp2 = points.flyShieldCurveStart.shiftFractionTowards(
      points.flyShieldCorner,
      options.cpFraction
    )
    points.flyShieldCrotchCp1 = points.flyShieldCrotch.shiftFractionTowards(
      points.flyShieldCorner,
      options.cpFraction
    )

    if (options.flyShieldCurved) {
      paths.bottom = new Path()
        .move(points.flyShieldCurveStart)
        .curve(points.flyShieldCurveStartCp2, points.flyShieldCrotchCp1, points.flyShieldCrotch)
        .line(points.flyShieldExCrotch)
        .hide()
    } else {
      paths.bottom = new Path().move(points.flyShieldCorner).line(points.flyShieldExCrotch).hide()
    }

    //paths
    paths.seam = paths.bottom
      .clone()
      .join(paths.crotchSeam.split(points.flyShieldCrotch)[1].offset(flyShieldEx))
      .line(points.flyShieldExWaist)
      .line(points.flyShieldWaist)
      .line(points.flyShieldCurveStart)
      .line(paths.bottom.start())
      .close()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.flyShieldWaist
      if (options.flyShieldCurved) {
        points.cutOnFoldTo = points.flyShieldCurveStart
      } else {
        points.cutOnFoldTo = points.flyShieldCorner
      }
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
      })
      //notches
      snippets.flyShieldCrotch = new Snippet('notch', points.flyShieldCrotch)
      if (options.flyShieldCurved) {
        snippets.flyShieldCurveStart = new Snippet('notch', points.flyShieldCurveStart)
      }
      //title
      points.title = points.flyShieldWaist
        .shiftFractionTowards(points.flyShieldExWaist, 0.5)
        .shift(
          points.flyShieldWaist.angle(points.flyShieldCorner),
          points.flyShieldWaist.dist(points.flyShieldCorner) * 0.5
        )
      macro('title', {
        at: points.title,
        nr: 10,
        title: 'Fly Shield',
        scale: 0.25,
        rotation: 90 - points.flyShieldCorner.angle(points.flyShieldWaist),
      })

      if (sa) {
        const crotchSeamSa = sa * options.crotchSeamSaWidth * 100
        points.saFlyShieldCorner = points.flyShieldWaist.shiftOutwards(points.flyShieldCorner, sa)

        points.saFlyShieldWaist = utils.beamsIntersect(
          points.flyShieldCorner,
          points.flyShieldWaist,
          points.saWaistOut,
          points.saWaistIn
        )

        paths.sa = paths.bottom
          .clone()
          .offset(sa)
          .line(points.saFlyShieldExCrotch)
          .join(
            paths.crotchSeam
              .split(points.crotchSeamCurveStart)[0]
              .split(points.flyShieldCrotch)[1]
              .offset(flyShieldEx + crotchSeamSa)
          )
          .line(points.saWaistInExCorner)
          .line(points.saFlyShieldWaist)
          .line(points.flyShieldCurveStart)
          .line(paths.bottom.offset(sa).start())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
