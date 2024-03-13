import { back as backDaisy } from '@freesewing/daisy'
import { back } from './back.mjs'
import { sideBackArmholePitch } from './sideBackArmholePitch.mjs'
import { sideBackArmhole } from './sideBackArmhole.mjs'
import { sideBackShoulder } from './sideBackShoulder.mjs'
import { sideBackBustShoulder } from './sideBackBustShoulder.mjs'

export const sideBack = {
  name: 'peach.sideBack',
  from: backDaisy,
  after: back,
  hide: {
    from: true,
  },
  draft: (sh) => {
    const { options, part } = sh

    switch (options.bustDartPlacement) {
      case 'armhole':
        return sideBackArmhole.draft(sh)
      case 'shoulder':
        return sideBackShoulder.draft(sh)
      case 'bustshoulder':
        return sideBackBustShoulder.draft(sh)
      default:
        return sideBackArmholePitch.draft(sh)
    }

    return part
  },
}
