import { version } from './package.json'

export default {
  name: 'aimee',
  version,
  optionGroups: {
    fit: [
	'chestEase',
	'waistEase',
	'bustSpanEase',
	'fullChestEaseReduction',
	'wristEase',
	],
	style: [
	'fullSleeves',
	'fitSleeves',
	'sleeveLengthBonus',
	'armholeDrop',
	'underArmCurve',
	],
    darts: [
	'backDartHeight',
	'waistDartLength',
	],
    armhole: [
      'armholeDepth',
      'backArmholeSlant',
      'frontArmholeCurvature',
      'backArmholeCurvature',
      'frontArmholePitchDepth',
      'backArmholePitchDepth',
    ],
    advanced: [
      'backNeckCutout',
      'backHemSlope',
      'frontShoulderWidth',
      'highBustWidth',
      'shoulderToShoulderEase',
	  'shoulderRise',
    ],
  },
  measurements: [
    'highBust',
    'chest',
    'underbust',
    'waist',
    'waistBack',
    'bustSpan',
    'neck',
    'hpsToBust',
    'hpsToWaistFront',
    'hpsToWaistBack',
    'shoulderToShoulder',
    'shoulderSlope',
	'shoulderToWrist',
    // FIXME: Measurement from waist up to armhole (for sleeveless)
  ],
  dependencies: {
    frontBella: 'backBella',
    front: 'back',
    sleeve: ['back', 'front',],
  },
  inject: {
	front: 'frontBella',
	back: 'backBella',
  },
  hide: [
  'frontBella',
  'backBella',
  ],
  parts: [
  ],
  options: {
	  
	//Bella
    // Constants
    acrossBackFactor: 0.925,
    shoulderSlopeBack: 1.23,
    neckWidthBack: 0.197,
    neckWidthFront: 0.17,
    backDartLocation: 0.145,
    backCenterWaistReduction: 0.35,
    collarFactor: 0.19,
	bustDartLength: 1, //changed for Aimee
	bustDartCurve: 0, //changed for Aimee
	 
    // Fit
	chestEase: { pct: 11, min: 5, max: 20 },
    waistEase: { pct: 5, min: 1, max: 20 },
    bustSpanEase: { pct: 10, min: 0, max: 20 },
	fullChestEaseReduction: { pct: 4, min: 0, max: 8 },
	
	//Darts
	backDartHeight: { pct: 46, min: 38, max: 54 },
    waistDartLength: { pct: 90, min: 75, max: 95 },
 
	
	//Armhole
	armholeDepth: { pct: 44, min: 38, max: 46 },
    backArmholeSlant: { deg: 5, min: 1, max: 9 },
	frontArmholeCurvature: { pct: 63, min: 50, max: 85 },
    backArmholeCurvature: { pct: 63, min: 50, max: 85 },
	frontArmholePitchDepth: { pct: 29, max: 31, min: 27 },
    backArmholePitchDepth: { pct: 35, max: 40, min: 30 },
	
	//Advanced
	backNeckCutout: { pct: 6, min: 3, max: 9 },
	backHemSlope: { deg: 2.5, min: 0, max: 5 },
	frontShoulderWidth: { pct: 95, max: 98, min: 92 },
	highBustWidth: { pct: 86, max: 92, min: 80 },
	shoulderToShoulderEase: { pct: -0.5, min: -1, max: 5 },
	
	//Aimee
	//Fit
	wristEase: {pct: 10, min: 0, max: 20},
	
	//Style
	fullSleeves: {bool : true},
	fitSleeves: {bool : true},
	sleeveLengthBonus: {pct: 0, min: -10, max: 20},
	armholeDrop: {pct: 12.4, min: 10, max: 15},
	underArmCurve: {pct: 4.3, min: 3, max: 8},
	
	//Advanced
	shoulderRise: {pct: 1.5, min: 0, max: 2},
  },
}