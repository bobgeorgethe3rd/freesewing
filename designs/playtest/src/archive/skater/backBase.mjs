import { back as daisyBack } from '@freesewing/daisy'
import { sideFront } from './sideFront.mjs'

export const backBase = {
  name: 'playtest.backBase',
  from: daisyBack,
  after: sideFront,
  hide: {
    from: true,
    inherited: true,
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
    //let's begin
    points.armholePitchCp3 = utils.beamIntersectsY(
      points.dartBottomLeft,
      points.dartTip,
      points.armholePitch.y
    )

    return part
  },
}
