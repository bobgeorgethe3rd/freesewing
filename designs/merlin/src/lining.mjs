import { pluginGore } from '@freesewing/plugin-gore'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { crown } from './crown.mjs'

export const lining = {
  name: 'merlin.lining',
  plugins: [pluginGore, pluginLogoRG],
  after: crown,
  options: {
    //Style
    liningLength: { pct: 55, min: 50, max: 60, menu: 'style' },
    liningNumber: { count: 4, min: 4, max: 8, menu: 'style' },
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
      gores: options.liningNumber,
      extraLength: ((options.liningLength - 0.5) * headCircumference) / 2,
      prefix: 'lining_',
      render: true,
    })
    //remove paths
    for (let i in paths) delete paths[i]
    //rotate and flip all points
    for (let p in points) points[p] = points[p].rotate(90, points.origin)
    for (let p in points) points[p + 'F'] = points[p].flipX(points.origin)

    //paths

    paths.hemBase = new Path().move(points.lining_p3).line(points.lining_p3F).hide()

    paths.saRight = new Path()
      .move(points.lining_p3F)
      .line(points.lining_p2F)
      .curve(points.lining_Cp2F, points.lining_Cp1F, points.lining_p1)
      .hide()

    paths.saLeft = new Path()
      .move(points.lining_p1)
      .curve(points.lining_Cp1, points.lining_Cp2, points.lining_p2)
      .line(points.lining_p3)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saRight).join(paths.saLeft).close()

    if (complete) {
      //grainline
      points.grainlineTo = points.origin.shiftFractionTowards(points.lining_p2, 0.25)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.lining_p1.y * 0.75)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        points.lining_p2.x * 0.75,
        points.lining_p2.shiftFractionTowards(points.lining_Cp2, 0.75).y
      )
      macro('title', {
        at: points.title,
        nr: 3,
        title: 'lining',
        cutNr: options.liningNumber,
        scale: 0.25,
      })
      //scalebox
      points.scalebox = new Point(
        points.lining_p3F.x * 0.6,
        points.lining_p3F.shiftFractionTowards(points.lining_Cp2F, 1 / 3).y
      )
      macro('miniscale', {
        at: points.scalebox,
      })
      //logo
      points.logo = new Point(
        points.lining_p3.x * 0.6,
        points.lining_p3.shiftFractionTowards(points.lining_Cp2, 1 / 3).y
      )
      macro('logorg', {
        at: points.logo,
        scale: 0.2,
      })
      //centre line
      paths.centreLine = new Path()
        .move(points.lining_p1)
        .line(points.origin)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Line')
        .attr('data-text-class', 'center')
    }

    if (sa) {
      const crownSa = sa * options.crownSaWidth * 100

      points.saLining_p2 = utils.beamsIntersect(
        points.lining_p3.shift(-90, crownSa),
        points.lining_p3F.shift(-90, crownSa),
        points.lining_Cp2.shiftTowards(points.lining_p2, sa).rotate(-90, points.lining_Cp2),
        points.lining_p2.shiftTowards(points.lining_Cp2, sa).rotate(90, points.lining_p2)
      )
      points.saLining_p2F = points.saLining_p2.flipX(points.origin)
      points.saLining_p1 = utils.beamsIntersect(
        points.origin,
        points.lining_p1,
        points.lining_Cp1.shiftTowards(points.lining_p1, sa).rotate(90, points.lining_Cp1),
        points.lining_p1.shiftTowards(points.lining_Cp1, sa).rotate(-90, points.lining_p1)
      )

      paths.sa = new Path()
        .move(points.saLining_p2)
        .line(points.saLining_p2F)
        .line(paths.saRight.offset(sa).start())
        .join(paths.saRight.offset(sa))
        .line(points.saLining_p1)
        .line(paths.saLeft.offset(sa).start())
        .join(paths.saLeft.offset(sa))
        .line(points.saLining_p2)
        .close()
        .attr('class', 'fabric sa')
    }
    // Paperless?
    if (paperless) {
      macro('vd', {
        from: points.lining_p1,
        to: points.origin,
        x: points.lining_p2.x - sa - 15,
      })
      macro('hd', {
        from: points.lining_p3,
        to: points.lining_p3F,
        y: points.origin.y + sa * options.crownSaWidth * 100 + 15,
      })
    }

    return part
  },
}
