import { crown as mildredCrown } from '@freesewing/mildred'

export const crown = {
  name: 'merlin.crown',
  plugins: [...mildredCrown.plugins],
  options: {
    //Imported
    ...mildredCrown.options,
    //Style
    crownLength: { pct: 103.6, min: 80, max: 200, menu: 'style' }, //altered for Merlin
    crownNumber: { count: 1, min: 1, max: 6, menu: 'style' }, //altered for Merlin
  },
  measurements: [...mildredCrown.measurements],
  draft: (sh) => mildredCrown.draft(sh),
}
