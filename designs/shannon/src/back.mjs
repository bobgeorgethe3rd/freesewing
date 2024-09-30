import { back as backAimee } from '@freesewing/aimee'
import { front } from './front.mjs'

export const back = {
  name: 'shannon.back',
  from: backAimee.from,
  after: front,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...backAimee.options,
    //Armhole
    backArmholePitchWidth: { pct: 97, min: 95, max: 98.5, menu: 'armhole' }, //Unlocked for Shannon
    backArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' }, //Unlocked for Shannon
    backArmholePitchDepth: { pct: 50, min: 45, max: 65, menu: 'armhole' }, //Unlocked for Shannon
    //Construction
    cbSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Shannon
  },
  draft: (sh) => {
    const {
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
    } = sh
    //draft
    backAimee.draft(sh)
    //removing paths and snippets not required from Bella
    const keepThese = ['daisyGuide', 'armLine', 'anchorLines']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    //measures
    const skirtLength = store.get('skirtLength')
    const skirtCentreAngle = store.get('skirtCentreAngle')
    const skirtSideAngle = store.get('skirtSideAngle')
    //let's begin
    points.sideHem = points.sideWaist.shift(skirtSideAngle, skirtLength)
    points.skirtOrigin = utils.beamsIntersect(
      points.sideHem,
      points.sideWaist,
      points.cbWaist,
      points.cbWaist.shift(skirtCentreAngle - 180, 1)
    )
    const skirtRadius = points.skirtOrigin.dist(points.sideHem)
    const skirtCpDistance =
      (4 / 3) * skirtRadius * Math.tan(utils.deg2rad((skirtSideAngle - skirtCentreAngle) / 4))
    points.cbHem = points.skirtOrigin.shiftTowards(points.cbWaist, skirtRadius)
    points.cbHemCp2 = points.cbHem
      .shiftTowards(points.skirtOrigin, skirtCpDistance)
      .rotate(-90, points.cbHem)
    points.sideHemCp1 = points.sideHem
      .shiftTowards(points.skirtOrigin, skirtCpDistance)
      .rotate(90, points.sideHem)
    points.underArmCurveStartCp1 = points.underArmCurveStartCp2.rotate(
      180,
      points.underArmCurveStart
    )
    //dolman sleeve
    paths.underArmCurve = new Path()
      .move(points.underArmCurveStart)
      .curve(
        points.underArmCurveStartCp2,
        points.bodiceSleeveBottomMinCp1,
        points.bodiceSleeveBottomMin
      )
      .hide()

    points.dolmanSleeveBack = paths.underArmCurve.shiftFractionAlong(0.5)
    points.dolmanSleeveTip = points.shoulderRise.shiftFractionTowards(
      points.bodiceSleeveTopMin,
      0.5
    )
    points.dolmanSleeveCpTarget = utils.beamsIntersect(
      points.dolmanSleeveTip,
      points.hps.rotate(90, points.dolmanSleeveTip),
      points.dolmanSleeveBack,
      paths.underArmCurve.shiftFractionAlong(0.49).rotate(-90, points.dolmanSleeveBack)
    )
    points.dolmanSleeveTipCp1 = points.dolmanSleeveTip.shiftFractionTowards(
      points.dolmanSleeveCpTarget,
      0.5
    )
    points.dolmanSleeveBackCp2 = points.dolmanSleeveBack.shiftFractionTowards(
      points.dolmanSleeveCpTarget,
      0.5
    )
    points.dolmanMidAnchor = utils.beamsIntersect(
      points.bodiceSleeveBottomMin,
      points.bodiceSleeveBottomMin.shift(
        points.dolmanSleeveCpTarget.angle(points.dolmanSleeveTip),
        1
      ),
      points.hps,
      points.shoulderRise
    )
    points.dolmanSleeveBackAnchor = utils.beamsIntersect(
      points.dolmanSleeveBack,
      points.dolmanSleeveBack.shift(points.dolmanSleeveCpTarget.angle(points.dolmanSleeveTip), 1),
      points.hps,
      points.shoulderRise
    )
    //paths
    paths.hemBase = new Path()
      .move(points.cbHem)
      .curve(points.cbHemCp2, points.sideHemCp1, points.sideHem)
      .hide()

    paths.saRight = new Path()
      .move(points.sideHem)
      .curve(points.sideWaist, points.underArmCurveStartCp1, points.underArmCurveStart)
      .hide()

    paths.dolman = new Path()
      .move(points.dolmanSleeveBack)
      .curve(points.dolmanSleeveBackCp2, points.dolmanSleeveTipCp1, points.dolmanSleeveTip)
      .hide()
    points.dolmanMid = paths.dolman.shiftFractionAlong(0.5)

    const drawSaRight = () => {
      if (options.sleeveStyle == 'inbuilt') {
        return paths.saRight.join(paths.underArmCurve).line(points.bodiceSleeveBottom)
      }
      if (options.sleeveStyle == 'dolman') {
        return paths.saRight.join(paths.underArmCurve).split(points.dolmanSleeveBack)[0]
      }
      if (options.sleeveStyle == 'inset') {
        return paths.saRight.line(points.armhole)
      }
    }
    const drawArm = () => {
      if (options.sleeveStyle == 'inbuilt') {
        return new Path().move(points.bodiceSleeveBottom).line(points.bodiceSleeveTop)
      }
      if (options.sleeveStyle == 'dolman') {
        return paths.dolman
      }
      if (options.sleeveStyle == 'inset') {
        return new Path()
          .move(points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
      }
    }

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    paths.saLeft = new Path()
      .move(points.cbNeck)
      .line(points.cArmhole)
      .curve(points.cbWaist, points.cbWaist, points.cbHem)
      .hide()

    paths.seam = paths.hemBase
      .join(drawSaRight())
      .join(drawArm())
      .line(points.hps)
      .join(paths.cbNeck)
      .join(paths.saLeft)
      .close()

    //stoes
    store.set('neckBack', paths.cbNeck.length())
    if (options.sleeveStyle == 'dolman') {
      store.set('scyeBackWidth', points.dolmanSleeveBack.dist(points.dolmanSleeveTip))
      store.set('scyeBackDepth', points.dolmanSleeveBackAnchor.dist(points.dolmanSleeveTip))
      store.set('backArmholeLength', paths.dolman.length())
      store.set('backArmholeToArmholePitch', paths.dolman.length() * 0.5)
      store.set('dolmanBackExWidth', points.bodiceSleeveBottomMin.dist(points.dolmanMidAnchor))
      store.set('dolmanBackExDepth', points.dolmanMidAnchor.dist(points.dolmanSleeveBackAnchor))
    }
    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.hps.x * 0.5, points.cbNeck.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.cbNotch = new Snippet('bnotch', points.cArmhole)
      snippets.underArmCurveStart = new Snippet('notch', points.underArmCurveStart)
      if (options.sleeveLength > 0 && options.fullSleeves && options.sleeveStyle == 'inbuilt') {
        snippets.bodiceSleeveBottomMin = new Snippet('notch', points.bodiceSleeveBottomMin)
      }
      if (options.sleeveStyle == 'dolman') {
        snippets.dolmanMid = new Snippet('bnotch', points.dolmanMid)
      }
      //title
      points.title = points.dartBottomEdge
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Back',
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const cbSa = sa * options.cbSaWidth * 100

        points.saCbHem = points.cbHem
          .shift(points.cbWaist.angle(points.cbHem), hemSa)
          .shift(points.cbHemCp2.angle(points.cbHem), cbSa)
        points.saSideHem = points.sideHem
          .shift(points.sideWaist.angle(points.sideHem), hemSa)
          .shift(points.sideHemCp1.angle(points.sideHem), sideSeamSa)

        points.saRightEnd = drawSaRight().offset(sideSeamSa).end()
        points.saDolmanSleeveBack = points.saRightEnd.shift(
          points.dolmanSleeveBack.angle(points.saRightEnd) + 90,
          armholeSa
        )
        points.saDolmanSleeveTip = points.dolmanSleeveTip
          .shift(points.dolmanSleeveTipCp1.angle(points.dolmanSleeveTip), shoulderSa)
          .shift(points.hps.angle(points.shoulderRise), armholeSa)
        const drawSaArm = () => {
          if (options.sleeveStyle == 'inbuilt') {
            return new Path()
              .move(points.saRightEnd)
              .line(points.saBodiceSleeveBottom)
              .line(points.saBodiceSleeveTop)
          }
          if (options.sleeveStyle == 'dolman') {
            return new Path()
              .move(points.saRightEnd)
              .line(points.saDolmanSleeveBack)
              .join(paths.dolman.offset(armholeSa))
              .line(points.saDolmanSleeveTip)
          }
          if (options.sleeveStyle == 'inset') {
            points.saHps = utils.beamsIntersect(
              paths.cbNeck.offset(neckSa).start(),
              paths.cbNeck
                .offset(neckSa)
                .start()
                .shift(points.hps.angle(points.shoulder) + 90, 1),
              points.shoulder.shiftTowards(points.hps, shoulderSa).rotate(-90, points.shoulder),
              points.hps.shiftTowards(points.shoulder, shoulderSa).rotate(90, points.hps)
            )
            return new Path()
              .move(points.saRightEnd)
              .line(points.saArmholeCorner)
              .join(drawArm().offset(armholeSa))
              .line(points.saShoulderCorner)
          }
        }

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saSideHem)
          .join(drawSaRight().offset(sideSeamSa))
          .join(drawSaArm())
          .line(points.saHps)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbNeck)
          .join(paths.saLeft.offset(cbSa))
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
