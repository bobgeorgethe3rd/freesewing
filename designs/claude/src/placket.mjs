import { placket as basicPlacket } from '@freesewing/basicplacket'
import { pocket } from './pocket.mjs'

export const placket = {
  name: 'claude.placket',
  after: pocket,
  options: {
    //Imported
    ...basicPlacket.options,
    //Plackets
    placketType: { dflt: 'placket', list: ['placket', 'shield', 'none'], menu: 'plackets' },
  },
  draft: (sh) => {
    const {
      store,
      sa,
      Point,
      points,
      Path,
      paths,
      options,
      complete,
      paperless,
      macro,
      utils,
      measurements,
      part,
      snippets,
      log,
      absoluteOptions,
    } = sh
    //set Render
    if (options.placketType == 'none' || options.waistbandElastic) {
      store.set('waistbandPlacketWidth', 0)
      part.hide()
      return part
    }
    //measures
    const pocketOpening = store.get('pocketOpening')
    const pocketOpeningLength = store.get('pocketOpeningLength')

    store.set(
      'placketLength',
      options.pocketsBool &&
        pocketOpening + pocketOpeningLength + store.get('pocketDepth') <
          store.get('pocketMaxLength') &&
        (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight')
        ? (pocketOpening + pocketOpeningLength) * (1 + options.placketLength)
        : measurements.waistToFloor * options.placketLength
    )

    store.set('placketWidth', measurements.waist * options.placketWidth)

    if (complete && sa) {
      const closureSa = sa * options.closureSaWidth * 100
      store.set('placketSideSeamSa', closureSa)
      if (options.placketType == 'shield') store.set('waistbandSideSa', closureSa)
    }
    //draft
    basicPlacket.draft(sh)

    //stores
    let titleName
    if (options.placketType == 'placket') {
      titleName == 'Placket'
      store.set('waistbandPlacketWidth', points.topLeft.dist(points.topRight))
    } else {
      titleName == 'Zipper Shield'
      store.set('waistbandPlacketWidth', 0)
    }

    if (complete) {
      //notches
      if (options.closurePosition == 'side') {
        points.pocketOpeningNotch0 = points.topRight.shift(-90, pocketOpening)
        points.pocketOpeningNotch1 = points.topRight.shift(-90, pocketOpening + pocketOpeningLength)
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningNotch0', 'pocketOpeningNotch1'],
        })
      }
      //titles
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Placket',
        cutNr: 2,
        scale: 1 / 3,
      })
    }

    return part
  },
}
