import { front as frontAimee } from '@freesewing/aimee'

export const frontBase = {
  name: 'shannon.frontBase',
  from: frontAimee.from,
  after: frontAimee.after,
  hide: {
    from: true,
    after: true,
    inherited: true,
  },
  measurements: frontAimee.measurements,
  optionalMeasurements: frontAimee.optionalMeasurements,
  options: {
    //Imported
    ...frontAimee.options,
    //Constants
    waistDartLength: 1, //Locked for Shannon
    fullSleeves: false, //Locked for Shannon
    //Darts
    bustDartLength: { pct: 70, min: 60, max: 100, menu: 'darts' }, //Altered for Shannon
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
    frontAimee.draft(sh)
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //let's begin

    //guides
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.bust)
        .line(points.waistDartRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
        .line(points.bustDartTip)
        .line(points.bustDartTop)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.cfWaist)
        .attr('class', 'various lashed')

      paths.armLine = new Path()
        .move(points.sideWaist)
        .line(points.underArmCurveStart)
        .curve(
          points.underArmCurveStartCp2,
          points.bodiceSleeveBottomMinCp1,
          points.bodiceSleeveBottomMin
        )
        .line(points.bodiceSleeveBottomMax)
        .line(points.bodiceSleeveTopMax)
        .line(points.hps)
        .attr('class', 'various lashed')

      paths.anchorLines = new Path()
        .move(points.bodiceSleeveBottomMin)
        .line(points.bodiceSleeveTopMin)
        .move(points.elbowBottom)
        .line(points.elbowTop)
        .move(points.bodiceSleeveBottomMax)
        .line(points.bodiceSleeveTopMax)
        .attr('class', 'various lashed')
    }

    return part
  },
}
