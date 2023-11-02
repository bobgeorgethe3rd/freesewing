import { dress } from './dress.mjs'

export const belt = {
  name: 'siona.belt',
  after: dress,
  options: {
    //Style
    beltLength: { pct: 200, min: 150, max: 300, menu: 'style' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    paperless,
    macro,
    measurements,
    part,
  }) => {
    if (
      options.bandType != 'belt' ||
      store.get('channelInnerRadius') + store.get('bandWidth') > store.get('outerRadius')
    ) {
      if (
        options.bandType == 'belt' &&
        store.get('channelInnerRadius') + store.get('bandWidth') > store.get('outerRadius')
      ) {
        store.flag.info({
          msg: `siona:lengthTooShortForBelt`,
        })
      }
      return part.hide()
    }
    //measurements
    const beltWidth = store.get('bandWidth')
    const beltLength = measurements.waist * options.beltLength
    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = new Point(0, beltLength / 2)
    points.bottomRight = new Point(beltWidth, beltLength / 2)
    points.topRight = new Point(points.bottomRight.x, points.topLeft.y)

    //paths
    paths.saBase = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .hide()

    paths.seam = paths.saBase.clone().line(points.topLeft).close().unhide()

    //details
    //grainline
    points.cutOnFoldFrom = points.topRight.shiftFractionTowards(points.topLeft, 0.1)
    points.cutOnFoldTo = points.topLeft.shiftFractionTowards(points.topRight, 0.1)

    macro('cutonfold', {
      from: points.cutOnFoldFrom,
      to: points.cutOnFoldTo,
      grainline: true,
    })
    //title
    points.title = new Point(points.topRight.x * 0.25, points.bottomLeft.y * 0.5)
    macro('title', { at: points.title, nr: 4, title: 'belt', scale: 0.25 })

    if (sa) {
      paths.sa = paths.saBase
        .offset(sa)
        .line(points.topRight)
        .line(points.topRight)
        .close()
        .attr('class', 'fabric sa')
    }

    if (paperless) {
      macro('vd', {
        from: points.topLeft,
        to: points.bottomLeft,
        x: points.topLeft.x - sa - 15,
        force: true,
        id: 'vLength',
      })
      macro('hd', {
        from: points.topLeft,
        to: points.topRight,
        y: points.topLeft.y - sa - 15,
        force: true,
        id: 'vWidth',
      })
    }

    return part
  },
}
