import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginGore } from '@freesewing/plugin-gore'

export const crown = {
  name: 'henry.crown',
  plugins: [pluginBundle, pluginGore],
  options: {
    //Fit
    headEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    //Style
    crownLength: { pct: 55, min: 40, max: 60, menu: 'style' },
    crownNumber: { count: 6, min: 4, max: 20, menu: 'style' },
    //Construction
    crownSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  measurements: ['head'],
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
    log,
  }) => {
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    const headCircumference = store.get('headCircumference')
    const headRadius = headCircumference / 2 / Math.PI

    points.origin = new Point(0, 0)

    macro('gore', {
      from: points.origin,
      radius: headRadius,
      gores: options.crownNumber,
      extraLength: ((options.crownLength - 0.5) * headCircumference) / 2,
      prefix: 'crown_',
      render: true,
    })
    //remove paths
    for (let i in paths) delete paths[i]
    //rotate and flip all points
    for (let p in points) points[p] = points[p].rotate(90, points.origin)
    for (let p in points) points[p + 'F'] = points[p].flipX(points.origin)

    //paths

    paths.hemBase = new Path().move(points.crown_p3).line(points.crown_p3F).hide()

    paths.saRight = new Path()
      .move(points.crown_p3F)
      .line(points.crown_p2F)
      .curve(points.crown_Cp2F, points.crown_Cp1F, points.crown_p1)
      .hide()

    paths.saLeft = new Path()
      .move(points.crown_p1)
      .curve(points.crown_Cp1, points.crown_Cp2, points.crown_p2)
      .line(points.crown_p3)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saRight).join(paths.saLeft).close()

    //stores
    store.set('headCircumference', points.crown_p3.dist(points.crown_p3F) * options.crownNumber) //DO NOT CHANGE!!! when below 0.5 it is shorter than headCircumference
    store.set('headRadius', headRadius)
    store.set('crownLength', points.crown_p1.dist(points.origin))

    if (complete) {
      //grainline
      points.grainlineTo = points.origin.shiftFractionTowards(points.crown_p2, 0.25)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crown_p1.y * 0.75)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        points.crown_p2.x * 0.75,
        points.crown_p2.shiftFractionTowards(points.crown_Cp2, 0.5).y
      )
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'crown',
        scale: 0.25,
      })
      //centre line
      paths.centreLine = new Path()
        .move(points.crown_p1)
        .line(points.origin)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Line')
        .attr('data-text-class', 'center')

      if (sa) {
        const hemSa = sa * options.crownSaWidth * 100

        points.saCrown_p2 = utils.beamsIntersect(
          points.crown_p3.shift(-90, hemSa),
          points.crown_p3F.shift(-90, hemSa),
          points.crown_Cp2.shiftTowards(points.crown_p2, sa).rotate(-90, points.crown_Cp2),
          points.crown_p2.shiftTowards(points.crown_Cp2, sa).rotate(90, points.crown_p2)
        )
        points.saCrown_p2F = points.saCrown_p2.flipX(points.origin)
        points.saCrown_p1 = utils.beamsIntersect(
          points.origin,
          points.crown_p1,
          points.crown_Cp1.shiftTowards(points.crown_p1, sa).rotate(90, points.crown_Cp1),
          points.crown_p1.shiftTowards(points.crown_Cp1, sa).rotate(-90, points.crown_p1)
        )

        paths.sa = new Path()
          .move(points.saCrown_p2)
          .line(points.saCrown_p2F)
          .line(paths.saRight.offset(sa).start())
          .join(paths.saRight.offset(sa))
          .line(points.saCrown_p1)
          .line(paths.saLeft.offset(sa).start())
          .join(paths.saLeft.offset(sa))
          .line(points.saCrown_p2)
          .close()
          .attr('class', 'fabric sa')
      }
      // Paperless?
      if (paperless) {
        macro('vd', {
          from: points.crown_p1,
          to: points.origin,
          x: points.crown_p2.x - sa - 15,
        })
        macro('hd', {
          from: points.crown_p3,
          to: points.crown_p3F,
          y: points.origin.y + sa * options.crownSaWidth * 100 + 15,
        })
      }
    }

    return part
  },
}
