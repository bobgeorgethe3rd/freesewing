import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginGore } from '@freesewing/plugin-gore'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const crown = {
  name: 'henry.crown',
  plugins: [pluginBundle, pluginGore, pluginLogoRG],
  options: {
    //Fit
    headEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    //Style
    crownLength: { pct: 25, min: 20, max: 100, menu: 'style' },
    crownNumber: { count: 8, min: 4, max: 20, menu: 'style' },
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
    const crownRadius = headRadius * (1 + options.crownLength)

    points.origin = new Point(0, 0)

    macro('gore', {
      from: points.origin,
      radius: crownRadius,
      gores: options.crownNumber,
      extraLength: headRadius * options.crownLength,
      prefix: 'crown_',
      render: true,
    })
    //remove paths
    for (let i in paths) delete paths[i]
    //rotate and flip all points
    points.bottom = points.origin.shift(90, (headCircumference / options.crownNumber) * 0.5)
    points.left = new Point(points.crown_Cp2.x / 2, points.crown_Cp2.y)
    points.leftCp2 = new Point(points.left.x / 2, points.crown_Cp2.y)
    for (let p in points) points[p] = points[p].rotate(90, points.origin)
    for (let p in points) points[p + 'F'] = points[p].flipX(points.origin)

    //paths

    paths.hemBase = new Path().move(points.bottom).line(points.bottomF).hide()

    paths.saRight = new Path()
      .move(points.bottomF)
      ._curve(points.leftCp2F, points.leftF)
      .curve(points.crown_Cp2F, points.crown_Cp1F, points.crown_p1)
      .hide()

    paths.saLeft = new Path()
      .move(points.crown_p1)
      .curve(points.crown_Cp1, points.crown_Cp2, points.left)
      .curve_(points.leftCp2, points.bottom)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saRight).join(paths.saLeft).close()

    //stores
    store.set('headCircumference', points.crown_p3.dist(points.crown_p3F) * options.crownNumber) //DO NOT CHANGE!!! when below 0.5 it is shorter than headCircumference
    store.set('headRadius', headRadius)
    store.set('visorWidth', points.left.y * -1)

    if (complete) {
      //grainline
      points.grainlineTo = points.origin.shiftFractionTowards(points.crown_p2, 0.25)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crown_p1.y * 0.75)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.crown_p2F.x * 0.25, points.leftCp2.y)
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'crown',
        scale: 0.25,
      })
      //scalebox
      points.scalebox = new Point(paths.seam.edge('left').x, paths.seam.edge('top').y)
      macro('miniscale', {
        at: points.scalebox,
      })
      //logo
      points.logo = new Point(points.left.x * 0.6, points.left.y)
      macro('logorg', {
        at: points.logo,
        scale: 1.5 / options.crownNumber,
      })
      //centre line
      paths.centreLine = new Path()
        .move(points.crown_p1)
        .line(points.origin)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Line')
        .attr('data-text-class', 'center')

      if (sa) {
        points.saBottom = utils.beamIntersectsY(
          points.leftCp2.shiftTowards(points.bottom, sa).rotate(-90, points.leftCp2),
          points.bottom.shiftTowards(points.leftCp2, sa).rotate(90, points.bottom),
          sa * options.crownSaWidth * 100
        )
        points.saBottomF = points.saBottom.flipX(points.origin)
        points.saCrown_p1 = utils.beamsIntersect(
          points.origin,
          points.crown_p1,
          points.crown_Cp1.shiftTowards(points.crown_p1, sa).rotate(90, points.crown_Cp1),
          points.crown_p1.shiftTowards(points.crown_Cp1, sa).rotate(-90, points.crown_p1)
        )

        paths.sa = new Path()
          .move(points.saBottom)
          .line(points.saBottomF)
          .line(paths.saRight.offset(sa).start())
          .join(paths.saRight.offset(sa))
          .line(points.saCrown_p1)
          .line(paths.saLeft.offset(sa).start())
          .join(paths.saLeft.offset(sa))
          .line(points.saBottom)
          .close()
          .attr('class', 'fabric sa')
      }
      // Paperless?
      if (paperless) {
        macro('vd', {
          from: points.left,
          to: points.bottom,
          x: points.crown_p2.x - sa - 15,
        })
        macro('vd', {
          from: points.crown_p1,
          to: points.origin,
          x: points.crown_p2.x - sa - 30,
        })
        macro('hd', {
          from: points.bottom,
          to: points.bottomF,
          y: points.origin.y + sa * options.crownSaWidth * 100 + 15,
        })
        macro('hd', {
          from: points.left,
          to: points.leftF,
          y: points.origin.y + sa * options.crownSaWidth * 100 + 30,
        })
      }
    }

    return part
  },
}
