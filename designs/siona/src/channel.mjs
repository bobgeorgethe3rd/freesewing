import { pluginRingSector } from '@freesewing/plugin-ringsector'
import { dress } from './dress.mjs'

export const channel = {
  name: 'siona.channel',
  after: dress,
  plugins: [pluginRingSector],
  draft: ({ store, sa, Point, points, Path, paths, options, paperless, macro, part }) => {
    if (
      options.bandType != 'channel' ||
      store.get('channelInnerRadius') + store.get('bandWidth') > store.get('outerRadius')
    ) {
      if (
        options.bandType == 'channel' &&
        store.get('channelInnerRadius') + store.get('bandWidth') > store.get('outerRadius')
      ) {
        store.flag.info({
          msg: `siona:lengthTooShortForChannel`,
        })
      }
      return part.hide()
    }
    //let's begin
    points.origin = new Point(0, 0)
    macro('ringsector', {
      point: points.origin,
      angle: options.dressFullness,
      insideRadius: store.get('channelInnerRadius'),
      outsideRadius: store.get('channelInnerRadius') + store.get('bandWidth'),
      rotate: true,
    })
    //details
    //grainline
    points.cutOnFoldFrom = points.__macro_ringsector_ringsector_in2Flipped.shiftFractionTowards(
      points.__macro_ringsector_ringsector_ex2Flipped,
      0.1
    )
    points.cutOnFoldTo = points.__macro_ringsector_ringsector_ex2Flipped.shiftFractionTowards(
      points.__macro_ringsector_ringsector_in2Flipped,
      0.1
    )
    macro('cutonfold', {
      from: points.cutOnFoldFrom,
      to: points.cutOnFoldTo,
      grainline: true,
    })
    //title
    points.title = points.__macro_ringsector_ringsector_in1.shiftFractionTowards(
      points.__macro_ringsector_ringsector_ex1,
      0.5
    )
    macro('title', { at: points.title, nr: 6, title: 'channel', scale: 0.25 })

    if (sa) {
      paths.saBase = new Path()
        .move(points.__macro_ringsector_ringsector_ex2Flipped)
        .curve(
          points.__macro_ringsector_ringsector_ex2cFlipped,
          points.__macro_ringsector_ringsector_ex1cFlipped,
          points.__macro_ringsector_ringsector_ex1
        )
        .curve(
          points.__macro_ringsector_ringsector_ex1c,
          points.__macro_ringsector_ringsector_ex2c,
          points.__macro_ringsector_ringsector_ex2
        )
        .line(points.__macro_ringsector_ringsector_in2)
        .curve(
          points.__macro_ringsector_ringsector_in2c,
          points.__macro_ringsector_ringsector_in1c,
          points.__macro_ringsector_ringsector_in1
        )
        .curve(
          points.__macro_ringsector_ringsector_in1cFlipped,
          points.__macro_ringsector_ringsector_in2cFlipped,
          points.__macro_ringsector_ringsector_in2Flipped
        )
        .hide()

      paths.centre = new Path()
        .move(points.__macro_ringsector_ringsector_in2Flipped)
        .line(points.__macro_ringsector_ringsector_ex2Flipped)
        .hide()

      paths.sa = paths.saBase
        .offset(sa)
        .line(points.__macro_ringsector_ringsector_in2Flipped)
        .line(points.__macro_ringsector_ringsector_ex2Flipped)
        .close()
        .attr('class', 'fabric sa')
    }

    if (paperless) {
      macro('vd', {
        from: points.__macro_ringsector_ringsector_center,
        to: points.__macro_ringsector_ringsector_in2Flipped,
        x: points.__macro_ringsector_ringsector_center.x - 15,
        force: true,
        id: 'vRadius',
      })
      macro('vd', {
        from: points.__macro_ringsector_ringsector_in2Flipped,
        to: points.__macro_ringsector_ringsector_ex2Flipped,
        x: points.__macro_ringsector_ringsector_center.x - 15,
        force: true,
        id: 'vLength',
      })
      macro('vd', {
        from: points.__macro_ringsector_ringsector_center,
        to: points.__macro_ringsector_ringsector_ex2Flipped,
        x: points.__macro_ringsector_ringsector_center.x - 30,
        force: true,
        id: 'vFull',
      })
      if (options.dressFullness < 90) {
        macro('vd', {
          from: points.__macro_ringsector_ringsector_center,
          to: points.__macro_ringsector_ringsector_in2,
          x: points.__macro_ringsector_ringsector_center.x,
          force: true,
          id: 'vSide',
        })
        macro('ld', {
          from: points.__macro_ringsector_ringsector_center,
          to: points.__macro_ringsector_ringsector_in2,
          force: true,
          id: 'lSide',
        })
      }
      macro('hd', {
        from: points.__macro_ringsector_ringsector_center,
        to: points.__macro_ringsector_ringsector_in2,
        y: points.__macro_ringsector_ringsector_in2.y,
        force: true,
        id: 'hSide',
      })
      macro('ld', {
        from: points.__macro_ringsector_ringsector_in2,
        to: points.__macro_ringsector_ringsector_ex2,
        d: sa + 15,
        force: true,
        id: 'lSideLength',
      })
    }

    return part
  },
}
