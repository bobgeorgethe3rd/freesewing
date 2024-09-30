import { crownSide } from './crownSide.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const crownTop = {
  name: 'billy.crownTop',
  after: crownSide,
  options: {
    //Style
    crownTopNumber: { count: 1, min: 1, max: 8, menu: 'style' },
    crownTopStyle: { dflt: 'pizza', list: ['pizza', 'striped', 'shapes'], menu: 'style' },
    snapSockets: { pct: 15, min: 5, max: 20, menu: 'style.snaps' },
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
    let crownTopNumber
    if (options.crownTopStyle == 'pizza') {
      crownTopNumber = options.crownTopNumber
    } else {
      crownTopNumber = 1
    }
    const angle = 360 / crownTopNumber
    const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 16)

    //let's begin
    points.origin = new Point(0, 0)
    points.left = points.origin.shift(180, radius)
    points.bottom = points.left.rotate(angle / 4, points.origin)
    points.right = points.left.rotate(angle / 2, points.origin)
    points.top = points.left.rotate(angle * (3 / 4), points.origin)
    points.end = points.left.rotate(angle, points.origin)
    points.leftCp2 = points.left.shiftTowards(points.origin, cpDistance).rotate(-90, points.left)
    points.bottomCp1 = points.bottom
      .shiftTowards(points.origin, cpDistance)
      .rotate(90, points.bottom)
    points.bottomCp2 = points.bottomCp1.rotate(180, points.bottom)
    points.rightCp1 = points.right.shiftTowards(points.origin, cpDistance).rotate(90, points.right)
    points.rightCp2 = points.rightCp1.rotate(180, points.right)
    points.topCp1 = points.top.shiftTowards(points.origin, cpDistance).rotate(90, points.top)
    points.topCp2 = points.topCp1.rotate(180, points.top)
    points.endCp1 = points.end.shiftTowards(points.origin, cpDistance).rotate(90, points.end)
    //paths
    const drawEnd = () => {
      if (crownTopNumber > 1) {
        return new Path().move(points.end).line(points.origin).line(points.left)
      } else {
        return new Path().move(points.end).line(points.left)
      }
    }

    paths.saBase = new Path()
      .move(points.left)
      .curve(points.leftCp2, points.bottomCp1, points.bottom)
      .curve(points.bottomCp2, points.rightCp1, points.right)
      .curve(points.rightCp2, points.topCp1, points.top)
      .curve(points.topCp2, points.endCp1, points.end)
      .hide()

    paths.seam = paths.saBase.clone().join(drawEnd())

    if (complete) {
      //strips
      const crownTopHalf = options.crownTopNumber / 2

      if (options.crownTopStyle != 'pizza' && options.crownTopNumber > 1) {
        let j
        for (let i = 0; i < options.crownTopNumber; i++) {
          j = i + 1
          points['split' + i] = paths.seam.shiftFractionAlong(j / options.crownTopNumber)
        }
        if (options.crownTopStyle == 'striped') {
          let k
          for (let i = 0; i < crownTopHalf; i++) {
            k = options.crownTopNumber - 1 - i
            paths['split' + i] = new Path()
              .move(points['split' + k])
              .line(points['split' + i])
              .attr('class', 'fabric help')
              .attr('data-text', 'Cut & Add Seam All.')
              .attr('data-text-class', 'center text-xs')
            if (crownTopHalf % 1 != 0) {
              points['split' + crownTopHalf] = utils.beamsIntersect(
                points['split' + (crownTopHalf - 1.5)],
                points['split' + (crownTopHalf + 0.5)],
                points.origin,
                points['split' + (crownTopHalf - 0.5)]
              )
              paths['split' + (crownTopHalf - 0.5)] = new Path()
                .move(points['split' + crownTopHalf])
                .line(points['split' + (crownTopHalf - 0.5)])
                .attr('class', 'fabric help')
                .attr('data-text', 'Cut & Add Seam All.')
                .attr('data-text-class', 'center text-xs')
            }
          }
        }
        if (options.crownTopStyle == 'shapes') {
          let l
          for (let i = 0; i < options.crownTopNumber - 1; i++) {
            l = i + 1
            paths['split' + i] = new Path()
              .move(points['split' + l])
              .line(points['split' + i])
              .attr('class', 'fabric help')
              .attr('data-text', 'Cut & Add Seam All.')
              .attr('data-text-class', 'center text-xs')
            if (l == options.crownTopNumber - 1) {
              paths['split' + (options.crownTopNumber - 1)] = new Path()
                .move(points.split0)
                .line(points['split' + l])
                .attr('class', 'fabric help')
                .attr('data-text', 'Cut & Add Seam All.')
                .attr('data-text-class', 'center text-xs')
            }
          }
        }
      }
      //grainline
      points.grainlineFrom = points.origin
      points.grainlineTo = points.right
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      switch (crownTopNumber) {
        case 1:
          macro('sprinkle', {
            snippet: 'notch',
            on: ['left', 'bottom', 'right', 'top'],
          })
          break
        case 2:
          snippets.notch = new Snippet('notch', points.right)
          break
        case 3:
          snippets.notch = new Snippet('notch', points.bottom)
      }
      //title
      points.title = points.origin
        .shiftFractionTowards(points.top, 0.5)
        .shift(angle / 2, radius * 0.1)
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Crown (Top)',
        cutNr: crownTopNumber,
        scale: 0.5 / crownTopNumber,
        rotation: 360 - points.origin.angle(points.right),
      })
      //logo
      points.logo = points.origin.shiftFractionTowards(points.bottom, 0.5)
      macro('logorg', {
        at: points.logo,
        scale: radius / 175 / crownTopNumber,
        rotation: 360 - points.origin.angle(points.right),
      })
      //scalebox
      points.scalebox = points.origin.translate(-radius, radius)
      macro('miniscale', {
        at: points.scalebox,
      })
      if (sa) {
        if (options.crownTopStyle == 'pizza' && options.crownTopNumber > 1) {
          points.saLeft = points.left.translate(-sa, -sa)
          points.saEnd = points.end
            .shift(points.origin.angle(points.end), sa)
            .shift(points.endCp1.angle(points.end), sa)
          points.saOrigin =
            utils.beamsIntersect(
              points.saLeft,
              points.saLeft.shift(0, 1),
              points.saEnd,
              points.saEnd.shift(points.end.angle(points.origin), 1)
            ) || points.origin.shift(90, sa)

          paths.sa = paths.saBase
            .offset(sa)
            .line(points.saEnd)
            .line(points.saOrigin)
            .line(points.saLeft)
            .line(paths.saBase.offset(sa).start())
            .close()
            .attr('class', 'fabric sa')
        } else {
          paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
