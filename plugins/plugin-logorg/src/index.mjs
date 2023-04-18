import { name, version } from '../data.mjs'

export const plugin = {
  name,
  version,
  macros: {
    logorg: function (so, { points, Point, paths, Path, utils }) {
      const defaults = {
        scale: 1,
        rotation: 0,
      }

      const prefix = so.prefix || ''
      const suffix = so.suffix || ''
      let size
      if (so.size) {
        size = 'text-' + so.size
      } else {
        size = 'text-lg'
      }

      let prefixFunction
      if (prefix != '') {
        prefixFunction = (string) => prefix + string.charAt(0).toUpperCase() + string.slice(1)
      } else {
        prefixFunction = (string) => string
      }
      // Passing `false` will remove the scalebox
      if (so === false) {
        for (let id of [
          'logoRG0',
          'logoRG1',
          'logoRG2',
          'logoRG3',
          'logoRG4',
          'logoRG5',
          'logoRG6',
          'logoRG7',
          'logoRG8',
          'logoRG9',
          'logoRG10',
          'logoRG11',
          'logoRG12',
          'logoRG13',
          'logoRG14',
          'logoRG15',
          'logoRG16',
          'logoRG17',
          'logoRG18',
          'logoRG19',
          'logoRG20',
          'logoRG21',
          'logoRG22',
          'logoRG23',
          'logoRGTarget',
          'logoRGLeft',
          'logoRGTop',
          'logoRGRight',
          'logoRGBottom',
          'logoRGCp1',
          'logoRGCp2',
          'logoRGCp3',
          'logoRGCp4',
          'logoRGCp5',
          'logoRGCp6',
          'logoRGCp7',
          'logoRGCp8',
        ])
          delete points[prefixFunction(id) + suffix]
        for (let id of [
          'logoRG',
          'logoRGCrown',
          'logoRobertGeorge',
          'logoRGPatterns',
          'logoRGOuter',
        ])
          delete paths[prefixFunction(id) + suffix]
        return true
      }

      so = { ...defaults, ...so }

      const scale = so.scale
      const rotation = so.rotation

      points[prefixFunction('logoRG0') + suffix] = so.at.shift(-105 - rotation, 33 * scale * 0.2)
      points[prefixFunction('logoRG4') + suffix] = points[prefixFunction('logoRG0') + suffix].shift(
        165 - rotation,
        25 * scale
      )
      points[prefixFunction('logoRG1') + suffix] = points[
        prefixFunction('logoRG4') + suffix
      ].rotate(180, points[prefixFunction('logoRG0') + suffix])
      points[prefixFunction('logoRGTarget') + suffix] = points[
        prefixFunction('logoRG0') + suffix
      ].shift(255 - rotation, 5 * scale)
      points[prefixFunction('logoRG2') + suffix] = points[
        prefixFunction('logoRG1') + suffix
      ].shiftFractionTowards(points[prefixFunction('logoRGTarget') + suffix], 0.5)
      points[prefixFunction('logoRG3') + suffix] = points[
        prefixFunction('logoRG4') + suffix
      ].shiftFractionTowards(points[prefixFunction('logoRGTarget') + suffix], 0.5)
      points[prefixFunction('logoRG6') + suffix] = points[prefixFunction('logoRG0') + suffix].shift(
        75 - rotation,
        33 * scale
      )
      points[prefixFunction('logoRG5') + suffix] = points[prefixFunction('logoRG6') + suffix].shift(
        165 - rotation,
        25 * scale
      )
      points[prefixFunction('logoRG7') + suffix] = points[
        prefixFunction('logoRG5') + suffix
      ].rotate(180, points[prefixFunction('logoRG6') + suffix])

      points[prefixFunction('logoRG9') + suffix] = utils.beamsIntersect(
        points[prefixFunction('logoRG6') + suffix],
        points[prefixFunction('logoRG5') + suffix],
        points[prefixFunction('logoRG3') + suffix],
        points[prefixFunction('logoRG2') + suffix].rotate(
          90,
          points[prefixFunction('logoRG3') + suffix]
        )
      )

      points[prefixFunction('logoRG10') + suffix] = points[
        prefixFunction('logoRG9') + suffix
      ].rotate(180, points[prefixFunction('logoRG6') + suffix])
      points[prefixFunction('logoRG8') + suffix] = points[
        prefixFunction('logoRG3') + suffix
      ].shiftFractionTowards(points[prefixFunction('logoRG9') + suffix], 2 / 3)
      points[prefixFunction('logoRG11') + suffix] = points[
        prefixFunction('logoRG2') + suffix
      ].shiftFractionTowards(points[prefixFunction('logoRG10') + suffix], 2 / 3)

      paths[prefixFunction('logoRGCrown') + suffix] = new Path()
        .move(points[prefixFunction('logoRG4') + suffix])
        .curve_(
          points[prefixFunction('logoRG5') + suffix],
          points[prefixFunction('logoRG6') + suffix]
        )
        ._curve(
          points[prefixFunction('logoRG7') + suffix],
          points[prefixFunction('logoRG1') + suffix]
        )
        .hide()

      points[prefixFunction('logoRG12') + suffix] = points[
        prefixFunction('logoRG4') + suffix
      ].shift(180 - rotation, 16 * scale)
      points[prefixFunction('logoRG13') + suffix] = points[prefixFunction('logoRG12') + suffix]
        .shiftFractionTowards(points[prefixFunction('logoRG4') + suffix], 0.25)
        .rotate(90, points[prefixFunction('logoRG12') + suffix])
      points[prefixFunction('logoRG14') + suffix] = paths[
        prefixFunction('logoRGCrown') + suffix
      ].shiftAlong(4 * scale)

      points[prefixFunction('logoRG15') + suffix] = so.at.shiftOutwards(
        points[prefixFunction('logoRG1') + suffix],
        16 * scale
      )
      points[prefixFunction('logoRG16') + suffix] = points[prefixFunction('logoRG15') + suffix]
        .shiftFractionTowards(points[prefixFunction('logoRG1') + suffix], 0.25)
        .rotate(-90, points[prefixFunction('logoRG15') + suffix])
      points[prefixFunction('logoRG17') + suffix] = paths[prefixFunction('logoRGCrown') + suffix]
        .reverse()
        .shiftAlong(4 * scale)

      points[prefixFunction('logoRG19') + suffix] = points[
        prefixFunction('logoRG9') + suffix
      ].rotate(-7, points[prefixFunction('logoRG6') + suffix])
      points[prefixFunction('logoRG18') + suffix] = points[
        prefixFunction('logoRG19') + suffix
      ].shift(243 - rotation, 5 * scale)
      points[prefixFunction('logoRG20') + suffix] = points[
        prefixFunction('logoRG18') + suffix
      ].rotate(180, points[prefixFunction('logoRG19') + suffix])
      points[prefixFunction('logoRG22') + suffix] = points[
        prefixFunction('logoRG10') + suffix
      ].rotate(7, points[prefixFunction('logoRG6') + suffix])
      points[prefixFunction('logoRG21') + suffix] = points[
        prefixFunction('logoRG22') + suffix
      ].shift(82 - rotation, 5 * scale)
      points[prefixFunction('logoRG23') + suffix] = points[
        prefixFunction('logoRG21') + suffix
      ].rotate(180, points[prefixFunction('logoRG22') + suffix])

      paths[prefixFunction('logoRG') + suffix] = new Path()
        .move(points[prefixFunction('logoRG1') + suffix])
        .curve(
          points[prefixFunction('logoRG2') + suffix],
          points[prefixFunction('logoRG3') + suffix],
          points[prefixFunction('logoRG4') + suffix]
        )
        .curve_(
          points[prefixFunction('logoRG5') + suffix],
          points[prefixFunction('logoRG6') + suffix]
        )
        ._curve(
          points[prefixFunction('logoRG7') + suffix],
          points[prefixFunction('logoRG1') + suffix]
        )
        //visor back
        .line(points[prefixFunction('logoRG15') + suffix])
        .curve_(
          points[prefixFunction('logoRG16') + suffix],
          points[prefixFunction('logoRG17') + suffix]
        )
        //visor ear flap
        .move(points[prefixFunction('logoRG2') + suffix])
        .line(points[prefixFunction('logoRG3') + suffix])
        .curve(
          points[prefixFunction('logoRG8') + suffix],
          points[prefixFunction('logoRG9') + suffix],
          points[prefixFunction('logoRG6') + suffix]
        )
        .curve(
          points[prefixFunction('logoRG10') + suffix],
          points[prefixFunction('logoRG11') + suffix],
          points[prefixFunction('logoRG2') + suffix]
        )
        //visor front
        .move(points[prefixFunction('logoRG4') + suffix])
        .line(points[prefixFunction('logoRG12') + suffix])
        .curve_(
          points[prefixFunction('logoRG13') + suffix],
          points[prefixFunction('logoRG14') + suffix]
        )
        //tie
        .move(points[prefixFunction('logoRG6') + suffix])
        ._curve(
          points[prefixFunction('logoRG18') + suffix],
          points[prefixFunction('logoRG19') + suffix]
        )
        .curve_(
          points[prefixFunction('logoRG20') + suffix],
          points[prefixFunction('logoRG6') + suffix]
        )
        ._curve(
          points[prefixFunction('logoRG21') + suffix],
          points[prefixFunction('logoRG22') + suffix]
        )
        .curve_(
          points[prefixFunction('logoRG23') + suffix],
          points[prefixFunction('logoRG6') + suffix]
        )

      const cpDistance = 46 * scale * 0.55191502449

      points[prefixFunction('logoRGLeft') + suffix] = so.at.shift(180 - rotation, 46 * scale)
      points[prefixFunction('logoRGTop') + suffix] = so.at.shift(90 - rotation, 46 * scale)
      points[prefixFunction('logoRGRight') + suffix] = so.at.shift(-rotation, 46 * scale)
      points[prefixFunction('logoRGBottom') + suffix] = so.at.shift(-90 - rotation, 46 * scale)
      points[prefixFunction('logoRGCp1') + suffix] = points[prefixFunction('logoRGLeft') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(90, points[prefixFunction('logoRGLeft') + suffix])
      points[prefixFunction('logoRGCp2') + suffix] = points[prefixFunction('logoRGTop') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(-90, points[prefixFunction('logoRGTop') + suffix])
      points[prefixFunction('logoRGCp3') + suffix] = points[prefixFunction('logoRGTop') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(90, points[prefixFunction('logoRGTop') + suffix])
      points[prefixFunction('logoRGCp4') + suffix] = points[prefixFunction('logoRGRight') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(-90, points[prefixFunction('logoRGRight') + suffix])
      points[prefixFunction('logoRGCp5') + suffix] = points[prefixFunction('logoRGRight') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(90, points[prefixFunction('logoRGRight') + suffix])
      points[prefixFunction('logoRGCp6') + suffix] = points[prefixFunction('logoRGBottom') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(-90, points[prefixFunction('logoRGBottom') + suffix])
      points[prefixFunction('logoRGCp7') + suffix] = points[prefixFunction('logoRGBottom') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(90, points[prefixFunction('logoRGBottom') + suffix])
      points[prefixFunction('logoRGCp8') + suffix] = points[prefixFunction('logoRGLeft') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(-90, points[prefixFunction('logoRGLeft') + suffix])
      paths[prefixFunction('logoRobertGeorge') + suffix] = new Path()
        .move(points[prefixFunction('logoRGLeft') + suffix])
        .curve(
          points[prefixFunction('logoRGCp1') + suffix],
          points[prefixFunction('logoRGCp2') + suffix],
          points[prefixFunction('logoRGTop') + suffix]
        )
        .curve(
          points[prefixFunction('logoRGCp3') + suffix],
          points[prefixFunction('logoRGCp4') + suffix],
          points[prefixFunction('logoRGRight') + suffix]
        )
        .attr('data-text', 'Robert George')
        .attr('data-text-class', size)
      paths[prefixFunction('logoRGPatterns') + suffix] = new Path()
        .move(points[prefixFunction('logoRGRight') + suffix])
        .curve(
          points[prefixFunction('logoRGCp5') + suffix],
          points[prefixFunction('logoRGCp6') + suffix],
          points[prefixFunction('logoRGBottom') + suffix]
        )
        .curve(
          points[prefixFunction('logoRGCp7') + suffix],
          points[prefixFunction('logoRGCp8') + suffix],
          points[prefixFunction('logoRGLeft') + suffix]
        )
        .attr('data-text', 'suɹǝʇʇɐԀ')
        .attr('data-text-class', size)
      paths[prefixFunction('logoRGOuter') + suffix] = paths[
        prefixFunction('logoRobertGeorge') + suffix
      ]
        .join(paths[prefixFunction('logoRGPatterns') + suffix])
        .offset(-14 * scale)
    },
  },
}

// More specifically named exports
export const logoRGPlugin = plugin
export const pluginLogoRG = plugin
