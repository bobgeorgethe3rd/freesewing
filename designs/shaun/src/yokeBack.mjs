import { backBase } from './backBase.mjs'
import { back } from './back.mjs'

export const yokeBack = {
  name: 'shaun.yokeBack',
  from: backBase,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Style
    yokeBackOnBias: { bool: false, menu: 'style' },
    //Construction
    yokeBackOnFold: { bool: true, menu: 'construction' },
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
    log,
  }) => {
    //set Render
    if (!options.yokeBack) {
      part.hide()
      return part
    }
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //let's begin
    paths.saBottom = new Path().move(points.cbYoke).line(points.yokeBack).hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .split(points.yokeBack)[1]
      .hide()

    paths.saTop = new Path()
      .move(points.shoulder)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .hide()

    paths.cb = new Path().move(points.cbNeck).line(points.cbYoke).hide()

    if (options.yokeBackOnBias && options.yokeBackOnFold) {
      macro('mirror', {
        mirror: [points.cbNeck, points.cbYoke],
        paths: ['saBottom', 'armhole', 'saTop'],
        prefix: 'm',
      })
    }
    const drawSeamLeft = () => {
      if (options.yokeBackOnBias && options.yokeBackOnFold) {
        return paths.mSaTop.reverse().join(paths.mArmhole.reverse()).join(paths.mSaBottom.reverse())
      } else {
        return paths.cb
      }
    }

    paths.seam = paths.saBottom.join(paths.armhole).join(paths.saTop).join(drawSeamLeft()).close()

    if (complete) {
      //grainline
      let cbSa
      if (options.yokeBackOnBias) {
        cbSa = sa
        if (options.yokeBackOnFold) {
          points.grainlineFrom = points.cbNeck.shift(180, points.cbNeck.dist(points.cbYoke) / 2)
        } else {
          points.grainlineFrom = points.cbNeck
        }
        points.grainlineTo = utils.beamsIntersect(
          points.grainlineFrom,
          points.grainlineFrom.shift(-45, 1),
          points.cbYoke,
          points.yokeBack
        )
      } else {
        if (options.yokeBackOnFold) {
          cbSa = 0
          points.cutOnFoldFrom = points.cbNeck
          points.cutOnFoldTo = points.cbYoke
          macro('cutonfold', {
            from: points.cutOnFoldFrom,
            to: points.cutOnFoldTo,
            grainline: true,
          })
        } else {
          cbSa = sa
          points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.5)
          points.grainlineTo = new Point(points.grainlineFrom.x, points.cbYoke.y)
        }
      }
      if (points.grainlineFrom) {
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      if (points.yokeBack.y > points.armholePitch.y) {
        snippets.armholePitch = new Snippet('notch', points.armholePitch)
      }
      if (options.yokeBackOnBias && options.yokeBackOnFold) {
        snippets.cb = new Snippet('bnotch', points.cbYoke)
      }
      snippets.backTopCurveEnd = new Snippet('notch', points.backTopCurveEnd)
      //title
      points.title = points.cbNeckCp1.shift(-90, points.cbNeck.dist(points.cbYoke) / 2)
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Yoke Back',
        scale: 1 / 3,
      })
      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100
        const drawSALeft = () => {
          if (options.yokeBackOnBias && options.yokeBackOnFold) {
            return paths.mSaTop
              .reverse()
              .offset(sa)
              .join(paths.mArmhole.reverse().offset(armholeSa))
              .join(paths.mSaBottom.reverse().offset(sa))
          } else {
            return paths.cb.offset(cbSa)
          }
        }
        paths.sa = paths.saBottom
          .offset(sa)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .join(paths.saTop.offset(sa))
          .join(drawSALeft())
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
