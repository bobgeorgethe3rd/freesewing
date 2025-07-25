// This file is auto-generated | Any changes you make will be overwritten.
import { Spencer } from '../src/index.mjs'

// Shared tests
import { testPatternConfig } from '../../../tests/designs/config.mjs'
import { testPatternDrafting } from '../../../tests/designs/drafting.mjs'
import { testPatternSampling } from '../../../tests/designs/sampling.mjs'

// Test config
testPatternConfig(Spencer)

// Test drafting - Change the second parameter to `true` to log errors
testPatternDrafting(Spencer, false)

// Test sampling - Change the second parameter to `true` to log errors
testPatternSampling(Spencer, false)
