import { sideWaistFacing as wandaSideWaistFacing } from '@freesewing/wanda'
import { skirtBase } from './skirtBase.mjs'
import { waistFacing } from './waistFacing.mjs'

export const sideWaistFacing = {
  name: 'fallon.sideWaistFacing',
  from: skirtBase,
  after: waistFacing,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...wandaSideWaistFacing.options,
  },
  draft: (sh) => {
    const {
      macro,
      points,
      Point,
      paths,
      Path,
      utils,
      options,
      measurements,
      snippets,
      Snippet,
      store,
      complete,
      part,
    } = sh
    //set Render
    if (options.waistbandStyle != 'none') {
      part.hide()
      return part
    }
    wandaSideWaistFacing.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 9,
        title: 'Side Waist Facing',
        at: points.title,
        scale: 0.25,
        rotation: 90 - points.dartTipD.angle(points.waistD),
      })
    }

    return part
  },
}
