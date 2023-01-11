// Import dependencies
import freesewing from '@freesewing/core'
import plugins from '@freesewing/plugin-bundle'
// Import configuration
import config from '../config'
// Import parts
import draftWandaSkirtBase from './wandaSkirtBase'
import draftSkirtBase from './skirtBase'
import draftCentreFront from './centreFront'
import draftSwingPanel from './swingPanel'
import draftSideFront from './sideFront'
import draftSidePanel from './sidePanel'
import draftSidePanelB from './sidePanelB'
import draftBackPanel from './backPanel'
import draftWaistband from './waistband'
import draftSwingWaistband from './swingWaistband'
import draftPlacket from './placket'
import draftWatchPocket from './watchPocket'
import draftPocket from './pocket'

// Create the new design
const Design = new freesewing.Design(config, plugins)

// Pattern.prototype.draftWandaSkirtBase = function (part) {
  // return new Wanda(this.settings).draftSkirtBase(part)
// }

// for (let p of ['pocket', 'watchPocket', 'placket']) {
  // Pattern.prototype[`draftWanda${p}` + 'Wanda'] = function (part) {
    // return new Wanda(this.settings)[`draft${p}`](part)
  // }
// }

// Attach the draft methods to the prototype
Design.prototype.draftWandaSkirtBase = draftWandaSkirtBase
Design.prototype.draftSkirtBase = draftSkirtBase
Design.prototype.draftCentreFront = draftCentreFront
Design.prototype.draftSwingPanel = draftSwingPanel
Design.prototype.draftSideFront = draftSideFront
Design.prototype.draftSidePanel = draftSidePanel
Design.prototype.draftSidePanelB = draftSidePanelB
Design.prototype.draftBackPanel = draftBackPanel
Design.prototype.draftWaistband = draftWaistband
Design.prototype.draftSwingWaistband = draftSwingWaistband
Design.prototype.draftPlacket = draftPlacket
Design.prototype.draftWatchPocket = draftWatchPocket
Design.prototype.draftPocket = draftPocket

// Export the new Design
export default Design
