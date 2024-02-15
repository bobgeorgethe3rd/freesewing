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
      points.waistOut,
      store.get('flyWidth')
    )

    points.flyShieldCorner = utils.beamsIntersect(
      points.flyShieldWaist,
      points.flyShieldWaist.shift(points.waistIn.angle(points.crotchSeamCurveStart), 1),
      points.flyShieldExCrotch,
      points.flyShieldCrotch
    )
    //paths
    paths.crotchSeam = paths.crotchSeam
      .offset(flyShieldEx)
      .split(points.flyShieldExCrotch)[1]
      .split(points.flyShieldExWaist.shift(points.waistIn.angle(points.crotchSeamCurveStart), 1))[0]
      .line(points.flyShieldExWaist)
      .hide()

    paths.seam = new Path()
      .move(points.flyShieldCorner)
      .line(points.flyShieldExCrotch)
      .join(paths.crotchSeam)
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
      snippets.flyShieldExCrotch = new Snippet('notch', points.flyShieldExCrotch)
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
        points.saFlyShieldCorner = points.flyShieldWaist.shiftOutwards(points.flyShieldCorner, sa)

        points.saFlyShieldWaist = utils.beamsIntersect(
          points.flyShieldCorner,
          points.flyShieldWaist,
          points.saWaistOut,
          points.saWaistIn
        )

        paths.sa = new Path()
          .move(points.saFlyShieldCorner)
          .line(points.saFlyShieldExCrotchCorner)
          .join(
            new Path()
              .move(points.upperLegIn)
              .curve(
                points.upperLegInCp2,
                points.crotchSeamCurveStartCp1,
                points.crotchSeamCurveStart
              )
              .line(points.waistIn)
              .offset(sa * options.crotchSeamSaWidth * 100)
              .split(points.saFlyShieldExCrotch)[1]
              .offset(flyShieldEx)
              .split(points.saWaistInEx)[0]
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
