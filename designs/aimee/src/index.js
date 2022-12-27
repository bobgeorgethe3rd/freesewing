import freesewing from '@freesewing/core'
import Bella from '@freesewing/bella'
import plugins from '@freesewing/plugin-bundle'
import config from '../config'
import draftFrontBase from './frontBase'
import draftBack from './back'
import draftFront from './front'
import draftSleeve from './sleeve'

// Create new design
const Pattern = new freesewing.Design(config, plugins)

// Attach the draft methods to the prototype
Pattern.prototype.draftFrontBella = function (part) {
  return new Bella(this.settings).draftFrontSideDart(part)
}
Pattern.prototype.draftBackBella = function (part) {
  return new Bella(this.settings).draftBack(part)
}

Pattern.prototype.draftFrontBase = draftFrontBase
Pattern.prototype.draftBack = draftBack
Pattern.prototype.draftFront = draftFront
Pattern.prototype.draftSleeve = draftSleeve


export default Pattern
