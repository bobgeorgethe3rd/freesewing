import { version } from './package.json'
import freesewing from '@freesewing/core'
const { pctBasedOn } = freesewing

export default {
  name: 'scarlett',
  version,
  optionGroups: {
    fit: [
	'waistEase',
	],
    style: [
	'style',
	'umbrellaFullness',
	//'umbrellaExtenstion', //locked for Scarlett
	'lengthBonus',
	'placketWidth',
	'placketLength',
	'waistbandWidth',
	'crotchCuvre',
	'crossCuvre',
	],
	darts: [
	'frontDartWidth',
	'sideDartWidth',
	'hipDartWidth',
	'dartLength'
	],
    pockets: [
	'pocketDepth',
	'pocketWidth',
	'pocketFacingDepth',
	'pocketStart'
	],
	construction: [
	//'frontDart',
	'sideDart',
	'hemWidth',
	'pocketHemWidth',
	'facings',
	'facingWidth',
	'waistbandFold',
	'waistbandOverlapSide',
	],
	advanced: [
	'crotchDrop',
	'scalePockets'
	],
  },
  measurements: [
  'crossSeam',
  'crossSeamFront',
  // 'seat',
  'waist',
  'hips',
  'waistToFloor',
  'waistToHips',
  'waistToSeat',
  'waistToUpperLeg',
  // 'upperLeg',
  ],
  dependencies: {
	  waistband: ['skirtBase', 'placket'],
	  swingWaistband: 'skirtBase',
	  pocket: 'skirtBase',
  },
  inject: {
	  skirtBase: 'wandaSkirtBase',
	  centreFront: 'skirtBase',
	  swingPanel: 'skirtBase',
	  sideFront: 'skirtBase',
	  sidePanel: 'skirtBase',
	  sidePanelB: 'skirtBase',
	  backPanel: 'skirtBase',
  },
  hide: ['wandaSkirtBase', 'skirtBase',],
  parts: ['wandaSkirtBase', 'placket', 'watchPocket',],
  options: {
    //Wanda
	//Constants
	cpFraction: 0.55191502449,
	fullDress: false, //This allows for the skirtBase to be extended out and used for Diagram 77, "The Full Dress Skirt"
	sidePanelFullness: 3 / 8, //This is changed to an optional optional for 50% to 75% for Diagram 77, "The Full Dress Skirt"
	//Fit
	waistEase: {pct: 1, min: 0, max: 20},
	
	//Style
    style: { dflt:'bell', list:['straight','bell','umbrella']},
    umbrellaFullness: {pct: 5 / 12 * 100, min: 40, max: 50},
    umbrellaExtenstion: 1 / 16, //locked for Scarlett
	//fabricWidth: { dflt:'wide', list:['narrow','wide']},
	lengthBonus: {pct: -2, min: -30, max: 10},
	placketWidth: {pct: 1 / 24 * 100, min: 1 /32 * 100, max: 5 / 96 * 100},
	placketLength: {pct: 20, min: 15, max: 30},
	waistbandWidth: { pct: 3.75, min: 1, max: 8, snap: 5, ...pctBasedOn('waistToFloor') },
	
	//Darts
	frontDartWidth: {pct: 1 / 24 * 100, min: 1 / 32 * 100, max: 5 / 96 * 100},
	sideDartWidth: {pct: 1 / 24 * 100, min: 1 / 32 * 100, max: 5 / 96 * 100},
	hipDartWidth: {pct: 5 / 96* 100, min: 1 / 32 * 100, max: 1 / 16 *100},
	dartLength: {pct: 9 / 80 * 100, min: 1 / 10 * 100, max: 3 / 20 * 100},
	
	//Pockets
	pocketDepth: {pct: 3 / 10 *100, min:20, max:50},
	//pocketDepth: {pct: 50, min: 30, max: 80},
	pocketWidth: {pct: 11 / 36 * 100, min: 30, max: 40},
	pocketFacingDepth: {pct: 5 / 12 * 100, min: 40, max: 50},
	pocketStart: {pct: 3 / 40 * 100, min: 5, max: 10},
	
	//Construction
	//frontDart: { dflt:'dart', list:['seam','dart']}, not needed for Scarlett
	sideDart: { dflt:'dart', list:['seam','dart']}, //Altered for Scarlett
	hemWidth: {pct: 5, min: 1, max: 10}, //Altered for Scarlett
	pocketHemWidth: {pct: 2, min: 1, max: 10}, //Need to add to Wanda
	facingWidth: {pct: 11 / 40 * 100, min: 5, max: 35}, //Moved and Altered for Scarlett
	
	//Advanced
	scalePockets: {bool : true},
	
	//Scarlett
	//Style
	crotchCuvre: {pct: 100, min: 50, max: 100},
	crossCuvre: {pct: 100, min: 50, max: 100},
	
	//Construction
	facings: {bool: true},
	waistbandFold: {dflt: 'folded', list: ['folded', 'two']},
	waistbandOverlapSide: {dflt: 'right', list:['right', 'left']},
	//Advanced
	crotchDrop: {pct: 2, min: 0, max: 15},
  },
}

