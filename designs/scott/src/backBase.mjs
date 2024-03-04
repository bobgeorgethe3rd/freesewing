import { pctBasedOn } from '@freesewing/core'
import { back as backDaisy } from '@freesewing/daisy'
import { frontBase } from './frontBase.mjs'

export const backBase = {
  name: 'scott.backBase',
  from: backDaisy,
  after: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    backNeckHeight: { pct: 46, min: 38, max: 54, menu: 'style' },
    //Plackets
    placketWidth: {
      pct: 3.7,
      min: 3,
      max: 4.5,
      snap: 3.175,
      ...pctBasedOn('waist'),
      menu: 'plackets',
    },
    placketStyle: {
      dflt: 'separate',
      list: ['separate', 'inbuilt', 'facing', 'none'],
      menu: 'plackets',
    },
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
  }) => {
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    //measurements
    let placketWidth
    if (options.closurePosition == 'back' && options.placketStyle != 'none') {
      placketWidth = absoluteOptions.placketWidth
    } else {
      placketWidth = 0
    }
    //let's begin
    points.shoulderTop = points.shoulder.shiftTowards(points.hps, store.get('sideShoulderLength'))
    points.neckBackCorner = new Point(
      points.shoulderTop.x,
      points.cbWaist.y * options.backNeckHeight
    )
    points.cbTop = new Point(points.cbNeck.x, points.neckBackCorner.y)
    const dartShift = points.dartTip.x - points.neckBackCorner.x
    points.dartBottomLeft = points.dartBottomLeft.shift(180, dartShift)
    points.dartBottomRight = points.dartBottomRight.shift(180, dartShift)
    //seam shaping
    const dartHeight = points.dartBottomLeft.y - points.neckBackCorner.y
    points.dartBottomLeftCp2 = points.dartBottomLeft.shift(90, dartHeight * 0.5)
    points.dartBottomRightCp1 = new Point(points.dartBottomRight.x, points.dartBottomLeftCp2.y)
    points.neckBackCornerCp = points.neckBackCorner.shift(-90, dartHeight * 0.25)
    points.dartTip = points.dartTip.shift(180, dartShift)
    //placket

    if (options.placketStyle == 'separate') {
      points.neckBack = points.cbTop.shiftTowards(points.neckBackCorner, placketWidth * 0.5)
    }
    if (options.placketStyle == 'inbuilt') {
      points.neckBack = points.cbTop.shift(180, placketWidth * 1.5)
    }
    if (options.placketStyle == 'facing') {
      points.neckBack = points.cbTop.shift(180, placketWidth * 0.5)
    }
    if (options.placketStyle == 'none' || options.closurePosition != 'back') {
      points.neckBack = points.cbTop
    }
    points.waistLeft = new Point(points.neckBack.x, points.cbWaist.y)
    //stores
    store.set('placketWidth', placketWidth)
    store.set('waistbandPlacketWidth', placketWidth)
    store.set('waistbandOverlap', placketWidth)
    store.set('backPlacketLength', points.waistLeft.dist(points.neckBack))

    store.set(
      'waistBack',
      (points.cbWaist.dist(points.dartBottomLeft) +
        points.dartBottomRight.dist(points.sideWaist) -
        placketWidth / 2) *
        4
    )

    store.set('storedWaist', (store.get('waistFront') + store.get('waistBack')) / 2)
    //guides
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cbWaist)
        .line(points.dartBottomLeft)
        .line(points.dartTip)
        .line(points.dartBottomRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        ._curve(points.cbNeckCp1, points.cbNeck)
        .line(points.cbWaist)
        .close()
        .attr('class', 'various lashed')
    }
    paths.back = new Path()
      .move(points.waistLeft)
      .line(points.dartBottomLeft)
      .curve(points.dartBottomLeftCp2, points.neckBackCornerCp, points.neckBackCorner)
      .line(points.neckBack)
      .line(points.waistLeft)

    paths.sideBack = new Path()
      .move(points.dartBottomRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.shoulderTop)
      .line(points.neckBackCorner)
      .curve(points.neckBackCornerCp, points.dartBottomRightCp1, points.dartBottomRight)

    return part
  },
}
