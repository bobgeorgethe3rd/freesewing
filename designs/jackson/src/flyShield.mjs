import { frontBase } from './frontBase.mjs'

export const flyShield = {
  name: 'jackson.flyShield',
  from: frontBase,
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
    //paths
    paths.seam = new Path()
      .move(points.flyShieldCorner)
      .line(points.flyShieldExCrotch)
      .join(paths.crotchSeam.split(points.flyShieldCrotch)[1].offset(flyShieldEx))
      .line(points.flyShieldExWaist)
      .line(points.flyShieldWaist)
      .line(points.flyShieldCorner)
      .close()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.flyShieldWaist
      points.cutOnFoldTo = points.flyShieldCorner
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
      })
      //notches
      snippets.flyShieldCrotch = new Snippet('notch', points.flyShieldCrotch)
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

        paths.sa = new Path()
          .move(points.saFlyShieldCorner)
          .line(points.saFlyShieldExCrotch)
          .join(
            paths.crotchSeam
              .split(points.crotchSeamCurveStart)[0]
              .split(points.flyShieldCrotch)[1]
              .offset(flyShieldEx + crotchSeamSa)
          )
          .line(points.saWaistInExCorner)
          .line(points.saFlyShieldWaist)
          .line(points.saFlyShieldCorner)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
