import { back as backAimee } from '@freesewing/aimee'
import { frontBase } from './frontBase.mjs'

export const back = {
  name: 'shannon.back',
  from: backAimee.from,
  after: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...backAimee.options,
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
    //dolman sleeve
    paths.underArmCurve = new Path()
      .move(points.underArmCurveStart)
      .curve(
        points.underArmCurveStartCp2,
        points.bodiceSleeveBottomMinCp1,
        points.bodiceSleeveBottomMin
      )

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
    points.dolmanSleeveTipCp2 = points.dolmanSleeveTip.shiftFractionTowards(
      points.dolmanSleeveCpTarget,
      0.5
    )
    points.dolmanSleeveBackCp1 = points.dolmanSleeveBack.shiftFractionTowards(
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

    paths.skirt = new Path()
      .move(points.cbNeck)
      .line(points.cArmhole)
      .curve(points.cbWaist, points.cbWaist, points.cbHem)
      .curve(points.cbHemCp2, points.sideHemCp1, points.sideHem)
      .curve(points.sideWaist, points.sideWaist, points.underArmCurveStart)

    paths.dolman = new Path()
      .move(points.dolmanSleeveTip)
      .curve(points.dolmanSleeveTipCp2, points.dolmanSleeveBackCp1, points.dolmanSleeveBack)
      .line(points.dolmanSleeveBackAnchor)
      .move(points.bodiceSleeveBottomMin)
      .line(points.dolmanMidAnchor)

    return part
  },
}
