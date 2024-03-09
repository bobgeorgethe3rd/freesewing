import { back as backDaisy } from '@freesewing/daisy'
import { sideBackArmholePitch } from '@freesewing/peach'
import { back } from './back.mjs'

export const sideBack = {
  name: 'rose.sideBack',
  from: backDaisy,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...sideBackArmholePitch.options,
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
      log,
    } = sh

    if (options.bodiceStyle == 'seam') {
      sideBackArmholePitch.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      macro('title', {
        at: points.title,
        nr: '8',
        title: 'Side Front',
        scale: 0.5,
      })
    }

    return part
  },
}
