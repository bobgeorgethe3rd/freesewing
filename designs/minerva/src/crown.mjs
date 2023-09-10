import { crown as mildredCrown } from '@freesewing/mildred'

export const crown = {
  name: 'minerva.crown',
  plugins: [...mildredCrown.plugins],
  options: {
    //Imported
    ...mildredCrown.options,
  },
  measurements: [...mildredCrown.measurements],
  draft: (sh) => mildredCrown.draft(sh),
}
