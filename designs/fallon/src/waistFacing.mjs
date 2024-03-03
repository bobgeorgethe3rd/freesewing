import { waistFacing as wandaWaistFacing } from '@freesewing/wanda'
import { skirtBase } from './skirtBase.mjs'

export const waistFacing = {
  name: 'fallon.waistFacing',
  from: skirtBase,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...wandaWaistFacing.options,
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
    wandaWaistFacing.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 8,
        title: 'Waist Facing',
        at: points.title,
        scale: 0.25,
      })
    }

    return part
  },
}
