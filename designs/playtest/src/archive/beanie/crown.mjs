import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginGore } from '@freesewing/plugin-gore'
import { pluginMirror } from '@freesewing/plugin-mirror'

export const crown = {
  name: 'playtest.crown',
  plugins: [pluginBundle, pluginGore, pluginMirror],
  options: {
    //Fit
    headEase: { pct: 6.6, min: 0, max: 20, menu: 'fit' },
    //Style
    crownLength: { pct: 55, min: 40, max: 60, menu: 'style' },
    crownNumber: { count: 2, min: 2, max: 4, menu: 'style' },
    //inbuiltHeadband: { bool: false, menu: 'style' },
    headbandWidth: {
      pct: 17.1, //20.6, //17.1,
      min: 8,
      max: 25.7,
      snap: 5,
      ...pctBasedOn('head'),
      menu: 'style',
    },
    //Construction
    inbuiltLining: { bool: false, menu: 'construction' },
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
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
  }) => {
    //measures
    const headCircumference = measurements.head * (1 + options.headEase)
    //let's begin
    points.origin = new Point(0, 0)

    macro('gore', {
      from: points.origin,
      radius: headCircumference / 2 / Math.PI,
      gores: options.crownNumber * 2,
      extraLength: ((options.crownLength - 0.5) * headCircumference) / 2,
      prefix: 'crown_',
      render: true,
    })
    //remove paths
    for (let i in paths) delete paths[i]
    //rotate and flip all points
    points.crown_p3 = points.crown_p3.shift(
      180, //options.inbuiltHeadband
      //? absoluteOptions.headbandWidth * 2
      /* : */ absoluteOptions.headbandWidth
    )
    for (let p in points) points[p] = points[p].rotate(90, points.origin)
    for (let p in points) points[p + 'F'] = points[p].flipX(points.origin)

    paths.saBase0 = new Path()
      .move(points.crown_p2F)
      .curve(points.crown_Cp2F, points.crown_Cp1F, points.crown_p1)
      .curve(points.crown_Cp1, points.crown_Cp2, points.crown_p2)
      .hide()

    for (let i = 1; i < options.crownNumber; i++) {
      for (let p in points)
        points[p + i] = points[p].shift(0, points.crown_p3.dist(points.crown_p3F) * i)

      paths['saBase' + i] = new Path()
        .move(points['crown_p2F' + i])
        .curve(points['crown_Cp2F' + i], points['crown_Cp1F' + i], points['crown_p1' + i])
        .curve(points['crown_Cp1' + i], points['crown_Cp2' + i], points['crown_p2' + i])
        .join(paths['saBase' + (i - 1)])
        .hide()

      //notches
      if (complete) snippets['crown_p2' + i] = new Snippet('notch', points['crown_p2' + i])
    }

    paths.saBase = paths['saBase' + (options.crownNumber - 1)].hide()

    macro('mirror', {
      mirror: [points.crown_p3, points.crown_p3F1],
      paths: ['saBase'],
      prefix: 'm',
    })

    //paths
    //if points.crown_p3 is at the beginning it lessens the work for trim
    paths.seam = options.inbuiltLining ? paths.mSaBase.reverse() : new Path().move(points.crown_p3)

    paths.seam = paths.seam
      .line(points['crown_p3F' + (options.crownNumber - 1)])
      .line(points['crown_p2F' + (options.crownNumber - 1)])
      .join(paths.saBase)
      .line(points.crown_p2)
      .line(points.crown_p3)
      .close()
      .setClass('fabric')

    if (sa) {
      //doesn't need close() as already done. Adding close() causes more lag with trim()
      paths.sa = paths.seam.offset(sa).trim().setClass('fabric sa')
    }

    //stores
    store.set('headCircumference', headCircumference)
    //grainline
    points.grainlineFrom = points.crown_p1
    points.grainlineTo = points.origin
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //notches
    if (complete) {
      if (options.inbuiltLining) {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['crown_p3', 'crown_p3F1'],
        })
      } else {
        points.crownMid = points.crown_p3.shiftFractionTowards(
          points['crown_p3F' + (options.crownNumber - 1)],
          0.5
        )
        snippets.crownMid = new Snippet('notch', points.crownMid)
      }
    }
    //cutlist
    // store.cutlist.setCut({ cut: 2, from: 'fabric' })
    // if(!options.inbuiltLining) store.cutlist.setCut({ cut: 2, from: 'lining' })
    //title
    points.title = points.crown_p2F.shiftFractionTowards(points.crown_p3F, 0.5)
    macro('title', {
      at: points.title,
      nr: 1,
      title: 'crown',
      cutNr: 2,
      scale: 0.5,
    })
    // Paperless?
    if (paperless) {
      macro('vd', {
        from: points.crown_p1,
        to: points.crown_p2,
        x: points.crown_p3.x - sa - 15,
        prefix: 'vd0',
      })
      macro('vd', {
        from: points.crown_p2,
        to: points.crown_p3,
        x: points.crown_p3.x - sa - 15,
        prefix: 'vd1',
      })
      macro('vd', {
        from: points.crown_p1,
        to: points.crown_p3,
        x: points.crown_p3.x - sa - 30,
        prefix: 'vd2',
      })
      macro('hd', {
        from: points.crown_p2,
        to: points.crown_p1,
        y: points.crown_p1.y - sa - 15,
        prefix: 'hd0',
      })
      macro('hd', {
        from: points.crown_p1,
        to: points.crown_p2F,
        y: points.crown_p1.y - sa - 15,
        prefix: 'hd1',
      })
      macro('hd', {
        from: points.crown_p2,
        to: points.crown_p2F,
        y: points.crown_p1.y - sa - 30,
        prefix: 'hd2',
      })
      macro('hd', {
        from: points.crown_p3,
        to: points['crown_p3F' + (options.crownNumber - 1)],
        y: points.origin.y + sa + 15,
        prefix: 'hd3',
      })
      points.crown_p1.addText('Angle: ' + 180 / options.crownNumber + '°', 'fill-mark')
    }

    return part
  },
}
