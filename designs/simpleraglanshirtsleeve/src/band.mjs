import { band as simpleShirtSleeveBand } from '@freesewing/simpleshirtsleeve'
import { sleeve } from './sleeve.mjs'

export const band = {
  name: 'simpleraglanshirtsleeve.band',
  after: sleeve,
  options: {
    //Imported
    ...simpleShirtSleeveBand.options,
  },
  draft: (sh) => {
    //draft
    const { part } = sh
    simpleShirtSleeveBand.draft(sh)
    return part
  },
}
