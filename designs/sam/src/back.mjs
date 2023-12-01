import { backBase } from '@freesewing/sammie'
import { back as sammieBack } from '@freesewing/sammie'

export const back = {
  name: 'sam.back',
  from: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...sammieBack.options,
    //Style
    backDrop: { pct: 0, min: 0, max: 100, menu: 'style' }, //Altered for sam
    //Construction
    closurePosition: {
      dflt: 'sideLeft',
      list: ['front', 'sideLeft', 'back', 'sideRight'],
      menu: 'construction',
    },
  },
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    sammieBack.draft(sh)

    return part
  },
}
