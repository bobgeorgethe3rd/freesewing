//

import { Design } from '@freesewing/core'
import { data } from '../data.mjs'
// Parts
import { frontBase } from './frontBase.mjs'
import { back } from './back.mjs'
import { front } from './front.mjs'

import { frontWaistDart } from './frontWaistDart.mjs'
// import { frontWaistSplitDart } from './frontWaistSplitDart.mjs'
import { front2WaistDart } from './front2WaistDart.mjs'
import { frontFrenchDart } from './frontFrenchDart.mjs'
import { frontSideDart } from './frontSideDart.mjs'
import { frontBustSideDart } from './frontBustSideDart.mjs'
// import { frontSideSplitDart } from './frontSideSplitDart.mjs'
// import { front2SideDart } from './front2SideDart.mjs'
import { frontUnderarmDart } from './frontUnderarmDart.mjs'
import { frontArmholeDart } from './frontArmholeDart.mjs'
import { frontArmholePitchDart } from './frontArmholePitchDart.mjs'
import { frontShoulderDart } from './frontShoulderDart.mjs'
import { frontBustShoulderDart } from './frontBustShoulderDart.mjs'
// import { front2ShoulderDart } from './front2ShoulderDart.mjs'
// import { frontNeckDart } from './frontNeckDart.mjs'
// import { frontCfDart } from './frontCfDart.mjs'

// Create new design
const Daisy = new Design({
  data,
  parts: [frontBase, back, front],
})

// Named exports
export {
  frontBase,
  back,
  front,
  frontWaistDart,
  // frontWaistSplitDart,
  front2WaistDart,
  frontFrenchDart,
  frontSideDart,
  frontBustSideDart,
  // frontSideSplitDart,
  // front2SideDart,
  frontUnderarmDart,
  frontArmholeDart,
  frontArmholePitchDart,
  frontShoulderDart,
  frontBustShoulderDart,
  // front2ShoulderDart,
  // frontNeckDart,
  // frontCfDart,
  Daisy,
}
