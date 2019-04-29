import { version } from "../package.json";

export default {
  name: "hugo",
  version,
  code: "Joost De Cock",
  department: "menswear",
  type: "pattern",
  difficulty: 3,
  tags: ["top", "basics"],
  optionGroups: {
    fit: ["bicepsEase", "chestEase", "cuffEase", "ribbingStretchFactor"],
    style: ["lengthBonus", "sleeveLengthBonus", "ribbingWidth"],
    advanced: ["acrossBackFactor", "backNeckCutout"]
  },
  measurements: [
    "bicepsCircumference",
    "centerBackNeckToWaist",
    "chestCircumference",
    "naturalWaistToHip",
    "neckCircumference",
    "shoulderSlope",
    "shoulderToShoulder",
    "hipsCircumference",
    "shoulderToWrist",
    "wristCircumference",
    "headCircumference"
  ],
  parts: ["waistband", "cuff"],
  dependencies: {
    frontBase: "base",
    front: "frontBase",
    backBase: "base",
    back: "backBase",
    sleeveBase: "sleevecap",
    sleeve: "sleeveBase",
    pocket: "front",
    pocketFacing: "pocket",
    hoodCenter: "hoodSide",
    hoodSide: ["front", "back"]
  },
  inject: {
    frontBase: "base",
    front: "frontBase",
    backBase: "base",
    back: "backBase",
    sleeveBase: "sleevecap",
    sleeve: "sleeveBase",
    pocket: "front",
    pocketFacing: "pocket"
  },
  hide: ["base", "frontBase", "backBase", "sleeveBase", "sleevecap"],
  options: {
    // Constants
    brianFitSleeve: false,
    collarEase: 0.05,
    collarFactor: 4.3,
    armholeDepthFactor: 0.5,
    shoulderEase: 0,
    shoulderSlopeReduction: 0,
    frontArmholeDeeper: 0,
    sleevecapEase: 0,
    sleevecapBackFactorX: 0.5,
    sleevecapBackFactorY: 0.35,
    sleevecapFrontFactorX: 0.5,
    sleevecapFrontFactorY: 0.35,
    sleevecapQ1Offset: 0.03,
    sleevecapQ2Offset: 0,
    sleevecapQ3Offset: 0,
    sleevecapQ4Offset: 0.03,
    sleevecapQ1Spread1: 0.05,
    sleevecapQ1Spread2: 0.05,
    sleevecapQ2Spread1: 0.05,
    sleevecapQ2Spread2: 0.05,
    sleevecapQ3Spread1: 0.05,
    sleevecapQ3Spread2: 0.05,
    sleevecapQ4Spread1: 0.05,
    sleevecapQ4Spread2: 0.05,
    sleeveWidthGuarantee: 1,

    // Percentages
    acrossBackFactor: { pct: 97, min: 93, max: 100 },
    backNeckCutout: { pct: 5, min: 2, max: 8 },
    bicepsEase: { pct: 15, min: 0, max: 50 },
    chestEase: { pct: 8, min: -4, max: 20 },
    cuffEase: { pct: 20, min: 0, max: 200 },
    lengthBonus: { pct: 10, min: 0, max: 20 },
    sleeveLengthBonus: { pct: 0, min: -40, max: 10 },
    ribbingStretchFactor: { pct: 5, min: 0, max: 10 },
    ribbingWidth: { pct: 10, min: 4, max: 20 }
  }
};
