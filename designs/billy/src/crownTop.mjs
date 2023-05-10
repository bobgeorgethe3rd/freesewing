import { crownSide } from './crownSide.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const crownTop = {
  name: 'billy.crownTop',
  after: crownSide,
  options: {
    //Style
    crownTopNumber: { count: 1, min: 1, max: 8, menu: 'style' },
  },
  plugins: [pluginLogoRG],
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
    //measures
    const radius = store.get('crownTopRadius')
    const angle = 360 / options.crownTopNumber
    const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 16)

    //let's begin
    points.origin = new Point(0, 0)
    points.start = points.origin.shift(180, radius)
    points.q1 = points.start.rotate(angle / 4, points.origin)
    points.mid = points.start.rotate(angle / 2, points.origin)
    points.q2 = points.start.rotate(angle * (3 / 4), points.origin)
    points.end = points.start.rotate(angle, points.origin)
    points.cp1 = points.start.shiftTowards(points.origin, cpDistance).rotate(-90, points.start)
    points.cp2 = points.q1.shiftTowards(points.origin, cpDistance).rotate(90, points.q1)
    points.cp3 = points.cp2.rotate(180, points.q1)
    points.cp4 = points.mid.shiftTowards(points.origin, cpDistance).rotate(90, points.mid)
    points.cp5 = points.cp4.rotate(180, points.mid)
    points.cp6 = points.q2.shiftTowards(points.origin, cpDistance).rotate(90, points.q2)
    points.cp7 = points.cp6.rotate(180, points.q2)
    points.cp8 = points.end.shiftTowards(points.origin, cpDistance).rotate(90, points.end)
    //paths
    const drawEnd = () => {
      if (options.crownTopNumber > 1) {
        return new Path().move(points.end).line(points.origin).line(points.start)
      } else {
        return new Path().move(points.end).line(points.start)
      }
    }

    paths.seam = new Path()
      .move(points.start)
      .curve(points.cp1, points.cp2, points.q1)
      .curve(points.cp3, points.cp4, points.mid)
      .curve(points.cp5, points.cp6, points.q2)
      .curve(points.cp7, points.cp8, points.end)
      .join(drawEnd())

    if (complete) {
      //grainline
      points.grainlineFrom = points.origin
      points.grainlineTo = points.mid
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      let notch
      switch (options.crownTopNumber) {
        case 1:
          macro('sprinkle', {
            snippet: 'notch',
            on: ['start', 'q1', 'mid', 'q2'],
          })
          break
        case 2:
          snippets.notch = new Snippet('notch', points.mid)
          break
        case 3:
          snippets.notch = new Snippet('notch', points.q1)
      }
      //title
      points.title = points.origin
        .shiftFractionTowards(points.q2, 0.5)
        .shift(angle / 2, radius * 0.1)
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Crown (Top)',
        scale: 0.5 / options.crownTopNumber,
        rotation: 360 - points.origin.angle(points.mid),
      })
      //logo
      points.logo = points.origin.shiftFractionTowards(points.q1, 0.5)
      macro('logorg', {
        at: points.logo,
        scale: 0.5 / options.crownTopNumber,
        rotation: 360 - points.origin.angle(points.mid),
      })
      //scalebox
      points.scalebox = points.origin.translate(-radius, -radius)
      macro('miniscale', {
        at: points.scalebox,
      })
      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
