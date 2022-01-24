import freesewing from '@freesewing/core'
import Brian from '@freesewing/brian'
import Hugo from '@freesewing/hugo'
import plugins from '@freesewing/plugin-bundle'
import config from '../config'
// Parts
import draftNeckband from './neckband'
import draftFront from './front'
import draftPocket from './pocket'
import draftPocketFacing from './pocketfacing'

// Create design
const Pattern = new freesewing.Design(config, plugins)

// Attach draft methods to prototype
Pattern.prototype.draftBase = function (part) {
  return new Brian(this.settings).draftBase(part)
}
Pattern.prototype.draftFrontBase = function (part) {
  return new Brian(this.settings).draftFront(part)
}
Pattern.prototype.draftBackBase = function (part) {
  return new Brian(this.settings).draftBack(part)
}
Pattern.prototype.draftSleeveBase = function (part) {
  return new Brian(this.settings).draftSleeve(part)
}
Pattern.prototype.draftSleevecap = function (part) {
  return new Brian(this.settings).draftSleevecap(part)
}

// Attach draft methods from Hugo
for (let m of [
  'draftBack',
  'draftCuff',
  'draftSleeve',
  'draftWaistband',
]) {
  Pattern.prototype[m] = function(part) {
    return new Hugo(this.settings)[m](part)
  }
}

Pattern.prototype.draftFrontHugo = function (part) {
  return new Hugo(this.settings).draftFront(part)
}
Pattern.prototype.draftPocketHugo = function (part) {
  return new Hugo(this.settings).draftPocket(part)
}
Pattern.prototype.draftPocketFacingHugo = function (part) {
  return new Hugo(this.settings).draftPocketFacing(part)
}

Pattern.prototype.draftNeckband = draftNeckband
Pattern.prototype.draftFront = draftFront
Pattern.prototype.draftPocket = draftPocket
Pattern.prototype.draftPocketFacing = draftPocketFacing

export default Pattern
