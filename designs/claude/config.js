import { version } from './package.json'
import freesewing from '@freesewing/core'
const { pctBasedOn } = freesewing

export default {
  name: 'claude',
  version,
  design: 'bobgeorgethe3rd',
  code: 'bobgeorgethe3rd',
  department: '',
  type: '',
  difficulty: 3,
  tags: [ ],
  optionGroups: {
    fit: [
	'waistEase',
	'hipsEase',
	'seatEase',
	],
	style: [
	'waistband',
	'waistHeight',
	'waistbandWidth',
	'waistbandOverlapSide',
	'waistbandOverlap',
	'skirtPanels',
	'skirtFullness',
	'skirtGatheringMethod',
	'skirtGathering',
	'skirtHighLength',
	'skirtHighLengthBonus',
	'skirtLength',
	,'skirtLengthBonus',
	],
	pockets: [
	'pockets',
	'pocketStyle',
	'pocketOpening',
	'pocketWidth',
	'pocketDepth'
	],
	construction: [
	'closurePosition',
	'waistbandFold',
	'placket',
	'placketWidth',
	'placketLength',
	'skirtFacings',
	'skirtFacingWidth',
	'pocketBottomSeamWidth',
	'waistFacingWidth',
	'skirtHemWidth',
	],
	advanced:[
	'fitSeat',
	],
  },
  measurements: [
	'waist',
	'hips',
	'seat',
	'waistToHips',
	'waistToSeat',
	'waistToKnee',
	'waistToUpperLeg',
	'waistToFloor',
	'wrist',
	],
  dependencies: {
  },
  inject: {

	},
  hide: [],
  parts: ['skirtBase',],
  options: {
	//Claude
	//Constants
	cpFraction: 0.55191502449,
	highLow: false,
	useStoredWaist: false, //Turn on and use store.set('storedWaist', value ) to match widths when using in conjuction. 
	
	// Fit
	waistEase: { pct: 1, min: 0, max: 5 },
	hipsEase: { pct: 1, min: 0, max: 5 },
	seatEase: {pct: 5, min: 0, max: 15},
	
	// Style
	waistband:{ dflt: 'straight', list: ['straight', 'curved', 'elastic', 'none'] }, //can be set to straight, curved or none for bodice.
	waistHeight: { pct: 100, min: 0, max: 100 },
	waistbandWidth: { pct: 4.5, min: 1, max: 6, snap: 5, ...pctBasedOn('waistToFloor') }, //not elastics to allow .5cm
	waistbandOverlapSide: {dflt: 'right', list:['right', 'left']},
	waistbandOverlap: {pct: 0, min: 0, max: 15},
	skirtPanels:{ count: 1, min: 1, max: 20 },
	skirtFullness: {pct: 100, min: 5, max: 200},
	skirtGatheringMethod: {dflt: 'increase', list:['increase', 'spread']},
	skirtGathering: { pct: 0, min: 0, max: 300 },
	skirtHighLength: {dflt: 'waistToKnee', list:['waistToThigh','waistToKnee','waistToCalf']},
	skirtHighLengthBonus: { pct: 0, min: -20, max: 30 },
	skirtLength:{ dflt:'waistToAnkle', list:['waistToKnee','waistToCalf','waistToAnkle','waistToFloor']},
	skirtLengthBonus: { pct: 0, min: -20, max: 30 },
	skirtFacings:{ bool : true },
	skirtFacingWidth: { pct: 9.1, min: 5, max: 28, snap: 5, ...pctBasedOn('waistToFloor')}, //adjusted for size 40 before it was size 46
	
	//Pocket
	pockets: {bool : true},
	pocketStyle: { dflt:'kidney', list:['kidney','round','envelope']},
	//pocketOpening: { pct: 11.6, min: 10, max: 20 },
	pocketOpening: { pct: 7.1, min: 5, max: 15 },
	pocketWidth: { pct: 80, min: 70, max: 90 },
	//pocketDepth: { pct: 30, min: 20, max: 60 },
	pocketDepth: { pct: 18.5, min: 15, max: 40 },
	
	//Consturction
    closurePosition: {dflt: 'back', list: ['back', 'side'],},
    waistbandFold: {dflt: 'seam', list: ['seam', 'folded'],}, //does not apply to curved
	placket:{ bool : true },
	placketWidth: {pct: 5.9, min: 5, max: 8},
	//placketLength: {pct: 25, min: 10, max: 50},
	placketLength: {pct: 18.9, min: 10, max: 25},
	pocketBottomSeamWidth: { pct: 2, min: 1, max: 10 },
	waistFacingWidth: { pct: 2, min: 1, max: 10 },
	skirtHemWidth: { pct: 5, min: 1, max: 15 },
	
	//Advanced
	fitSeat: {bool: true},
  },
}
