import { frontBase as daisyFrontBase } from '@freesewing/daisy'
import { back as backDaisy } from '@freesewing/daisy'
import { front as frontDaisy } from '@freesewing/daisy'
import { frontArmholePitchDart } from '@freesewing/daisy'

export const frontBase = {
  name: 'playtest.frontBase',
  from: daisyFrontBase,
  after: backDaisy,
  hide: {
    from: true,
    after: true,
    inherited: true,
  },
  options: {
    //Imported
    ...frontDaisy.options,
    //Constant
    bustDartPlacement: 'armholePitch', //Locked for Playtest
    bustDartLength: 1, //Locked for Playtest
    waistDartLength: 1, //Locked for Playtest
    // bustDartCurve: 1,
    bustDartFraction: 0.5, //Altered for Playtest
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
  },
  measurements: ['waistToKnee'],
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
    frontArmholePitchDart(sh)
    //removing paths and snippets not required from Daisy
    const keepThese = ['seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daisyGuides) paths.daisyGuide = paths.seam.clone().attr('class', 'various lashed')
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('scalebox', false)
    //princess seams
    points.bustDartTopCp1 = utils.beamIntersectsY(
      points.waistDartLeft,
      points.bust,
      points.armholePitch.y
    )
    // paths.guide = new Path()
    // .move(points.bust)
    // ._curve(points.bustDartTopCp1, points.armholePitch)

    return part
  },
}
