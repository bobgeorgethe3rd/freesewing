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
    yokeBackSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
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
    macro('cutonfold', false)
    delete points.grainlineFrom
    delete points.grainlineTo
    //let's begin
    paths.saBottom = new Path().move(points.cbYoke).line(points.yokeBack).hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .split(points.yokeBack)[1]
      .hide()

    paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    if (options.yokeBackOnBias && options.yokeBackSaWidth == 0) {
      macro('mirror', {
        mirror: [points.cbNeck, points.cbYoke],
        paths: ['saBottom', 'armhole', 'shoulder', 'cbNeck'],
        prefix: 'm',
      })
    }
    const drawSeamLeft = () => {
      if (options.yokeBackOnBias && options.yokeBackSaWidth == 0) {
        return paths.mCbNeck
          .reverse()
          .join(paths.mShoulder.reverse())
          .join(paths.mArmhole.reverse())
          .join(paths.mSaBottom.reverse())
      } else {
        return new Path().move(points.cbNeck).line(points.cbYoke)
      }
    }

    paths.seam = paths.saBottom
      .join(paths.armhole)
      .join(paths.shoulder)
      .join(paths.cbNeck)
      .join(drawSeamLeft())
      .close()

    if (complete) {
      //grainline
      if (options.yokeBackOnBias) {
        if (options.yokeBackSaWidth == 0) {
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
        if (options.yokeBackSaWidth == 0) {
          points.cutOnFoldFrom = points.cbNeck
          points.cutOnFoldTo = points.cbYoke
          macro('cutonfold', {
            from: points.cutOnFoldFrom,
            to: points.cutOnFoldTo,
            grainline: true,
          })
        } else {
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
      if (options.yokeBackOnBias && options.yokeBackSaWidth == 0) {
        snippets.cb = new Snippet('bnotch', points.cbYoke)
        snippets.fBackTopCurveEnd = new Snippet(
          'notch',
          points.backTopCurveEnd.flipX(points.cbYoke)
        )
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
        const neckSa = sa * options.neckSaWidth * 100
        const yokeBackSa = sa * options.yokeBackSaWidth * 100

        points.saYokeBack = points.yokeBack.translate(armholeSa, sa)
        points.saFYokeBack = points.saYokeBack.flipX(points.cbYoke)

        points.saCbNeck = points.cbNeck.translate(-yokeBackSa, -neckSa)
        points.saCbYoke = new Point(points.saCbNeck.x, points.cbYoke.y + sa)

        const drawSALeft = () => {
          if (options.yokeBackOnBias && options.yokeBackSaWidth == 0) {
            return paths.mCbNeck
              .reverse()
              .offset(neckSa)
              .line(points.saHps.flipX(points.cbNeck))
              .line(points.saShoulderCorner.flipX(points.cbNeck))
              .join(paths.mArmhole.reverse().offset(armholeSa))
              .line(points.saFYokeBack)
              .join(paths.mSaBottom.reverse().offset(sa))
          } else {
            return new Path().move(points.saCbNeck).line(points.saCbYoke)
          }
        }
        paths.sa = paths.saBottom
          .offset(sa)
          .line(points.saYokeBack)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saShoulderCorner)
          .line(points.saHps)
          .join(paths.cbNeck.offset(neckSa))
          .join(drawSALeft())
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
