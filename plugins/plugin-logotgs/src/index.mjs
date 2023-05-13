import { name, version } from '../data.mjs'

export const plugin = {
  name,
  version,
  macros: {
    logotgs: function (so, { points, Point, paths, Path, utils }) {
      //Example shorthand, you may wish to add other elements like utils

      const defaults = {
        //note these are common examples and can be removed
        scale: 1,
        rotation: 0,
      }
      const prefix = so.prefix || ''
      const suffix = so.suffix || ''

      let prefixFunction
      if (prefix != '') {
        prefixFunction = (string) => prefix + string.charAt(0).toUpperCase() + string.slice(1)
      } else {
        prefixFunction = (string) => string
      }
      // Passing `false` will remove the scalebox
      if (so === false) {
        for (const pointName in points) {
          if (pointName.match('logoTGS')) delete points[pointName]
          if (pointName.match('LogoTGS')) delete points[pointName]
        }

        for (const pathName in paths) {
          if (pathName.match('logoTGS')) delete paths[pathName]
          if (pathName.match('LogoTGS')) delete paths[pathName]
        }
        return true
      }

      so = { ...defaults, ...so }

      const scale = so.scale
      const rotation = so.rotation

      points[prefixFunction('logoTGS0') + suffix] = so.at.shift(214.3 - rotation, 13 * scale)
      points[prefixFunction('logoTGS1') + suffix] = points[
        prefixFunction('logoTGS0') + suffix
      ].shift(341.9 - rotation, 5.2 * scale)
      points[prefixFunction('logoTGS2') + suffix] = points[
        prefixFunction('logoTGS1') + suffix
      ].shift(270 - rotation, 3.9 * scale)
      points[prefixFunction('logoTGS3') + suffix] = points[
        prefixFunction('logoTGS2') + suffix
      ].shift(45 - rotation, 0.8 * scale)
      points[prefixFunction('logoTGS4') + suffix] = points[
        prefixFunction('logoTGS3') + suffix
      ].shift(0 - rotation, 0.8 * scale)
      points[prefixFunction('logoTGS6') + suffix] = points[
        prefixFunction('logoTGS4') + suffix
      ].shift(0 - rotation, 9.2 * scale)
      points[prefixFunction('logoTGS7') + suffix] = points[
        prefixFunction('logoTGS6') + suffix
      ].shift(270 - rotation, 14.8 * scale)
      points[prefixFunction('logoTGS5') + suffix] = points[
        prefixFunction('logoTGS4') + suffix
      ].shiftFractionTowards(points[prefixFunction('logoTGS6') + suffix], 0.15)
      points[prefixFunction('logoTGS8') + suffix] = points[
        prefixFunction('logoTGS7') + suffix
      ].shift(270 - rotation, 8.5 * scale)
      points[prefixFunction('logoTGS9') + suffix] = points[
        prefixFunction('logoTGS8') + suffix
      ].shift(223 - rotation, 12.2 * scale)
      points[prefixFunction('logoTGS10') + suffix] = points[
        prefixFunction('logoTGS9') + suffix
      ].shift(0 - rotation, 9.2 * scale)
      points[prefixFunction('logoTGS11') + suffix] = points[
        prefixFunction('logoTGS10') + suffix
      ].shift(61.4 - rotation, 21.3 * scale)
      points[prefixFunction('logoTGS12') + suffix] = points[
        prefixFunction('logoTGS11') + suffix
      ].shift(61.4 - rotation, 2.3 * scale)
      points[prefixFunction('logoTGS13') + suffix] = points[
        prefixFunction('logoTGS12') + suffix
      ].shift(33.3 - rotation, 4.2 * scale)
      points[prefixFunction('logoTGS14') + suffix] = points[
        prefixFunction('logoTGS13') + suffix
      ].shift(33.3 - rotation, 2.4 * scale)
      points[prefixFunction('logoTGS15') + suffix] = points[
        prefixFunction('logoTGS14') + suffix
      ].shift(33.6 - rotation, 1.8 * scale)
      points[prefixFunction('logoTGS16') + suffix] = points[
        prefixFunction('logoTGS15') + suffix
      ].shift(0 - rotation, 0.8 * scale)
      points[prefixFunction('logoTGS17') + suffix] = points[
        prefixFunction('logoTGS16') + suffix
      ].shift(270 - rotation, 2.8 * scale)
      points[prefixFunction('logoTGS18') + suffix] = points[
        prefixFunction('logoTGS17') + suffix
      ].shift(270 - rotation, 1.2 * scale)
      points[prefixFunction('logoTGS19') + suffix] = points[
        prefixFunction('logoTGS18') + suffix
      ].shift(250.6 - rotation, 1.8 * scale)
      points[prefixFunction('logoTGS20') + suffix] = points[
        prefixFunction('logoTGS19') + suffix
      ].shift(38.9 - rotation, 4.6 * scale)
      points[prefixFunction('logoTGS21') + suffix] = points[
        prefixFunction('logoTGS20') + suffix
      ].shift(72 - rotation, 9.4 * scale)
      points[prefixFunction('logoTGS22') + suffix] = points[
        prefixFunction('logoTGS21') + suffix
      ].shift(49.4 - rotation, 14.9 * scale)
      points[prefixFunction('logoTGS23') + suffix] = points[
        prefixFunction('logoTGS22') + suffix
      ].shift(90 - rotation, 10.9 * scale)
      points[prefixFunction('logoTGS24') + suffix] = points[
        prefixFunction('logoTGS23') + suffix
      ].shift(90 - rotation, 3.8 * scale)
      points[prefixFunction('logoTGS25') + suffix] = points[
        prefixFunction('logoTGS24') + suffix
      ].shift(111.7 - rotation, 1.9 * scale)
      points[prefixFunction('logoTGS26') + suffix] = points[
        prefixFunction('logoTGS25') + suffix
      ].shift(0 - rotation, 6.1 * scale)
      points[prefixFunction('logoTGS27') + suffix] = points[
        prefixFunction('logoTGS26') + suffix
      ].shift(0 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS28') + suffix] = points[
        prefixFunction('logoTGS27') + suffix
      ].shift(90 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS29') + suffix] = points[
        prefixFunction('logoTGS28') + suffix
      ].shift(90 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS30') + suffix] = points[
        prefixFunction('logoTGS29') + suffix
      ].shift(138.6 - rotation, 5.6 * scale)
      points[prefixFunction('logoTGS31') + suffix] = points[
        prefixFunction('logoTGS30') + suffix
      ].shift(180 - rotation, 3.4 * scale)
      points[prefixFunction('logoTGS32') + suffix] = points[
        prefixFunction('logoTGS31') + suffix
      ].shift(106.2 - rotation, 5.7 * scale)
      points[prefixFunction('logoTGS33') + suffix] = points[
        prefixFunction('logoTGS32') + suffix
      ].shift(127.9 - rotation, 8.6 * scale)
      points[prefixFunction('logoTGS34') + suffix] = points[
        prefixFunction('logoTGS33') + suffix
      ].shift(90 - rotation, 0.2 * scale)
      points[prefixFunction('logoTGS35') + suffix] = points[
        prefixFunction('logoTGS34') + suffix
      ].shift(326.3 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS36') + suffix] = points[
        prefixFunction('logoTGS35') + suffix
      ].shift(326.3 - rotation, 1.1 * scale)
      points[prefixFunction('logoTGS37') + suffix] = points[
        prefixFunction('logoTGS36') + suffix
      ].shift(0 - rotation, 0.5 * scale)
      points[prefixFunction('logoTGS38') + suffix] = points[
        prefixFunction('logoTGS37') + suffix
      ].shift(0 - rotation, 0.2 * scale)
      points[prefixFunction('logoTGS39') + suffix] = points[
        prefixFunction('logoTGS38') + suffix
      ].shift(90 - rotation, 0.2 * scale)
      points[prefixFunction('logoTGS40') + suffix] = points[
        prefixFunction('logoTGS39') + suffix
      ].shift(90 - rotation, 4.3 * scale)
      points[prefixFunction('logoTGS41') + suffix] = points[
        prefixFunction('logoTGS40') + suffix
      ].shift(45 - rotation, 9.6 * scale)
      points[prefixFunction('logoTGS42') + suffix] = points[
        prefixFunction('logoTGS41') + suffix
      ].shift(135 - rotation, 2.5 * scale)
      points[prefixFunction('logoTGS43') + suffix] = points[
        prefixFunction('logoTGS42') + suffix
      ].shift(180 - rotation, 6.6 * scale)
      points[prefixFunction('logoTGS44') + suffix] = points[
        prefixFunction('logoTGS43') + suffix
      ].shift(180 - rotation, 10.6 * scale)
      points[prefixFunction('logoTGS45') + suffix] = points[
        prefixFunction('logoTGS44') + suffix
      ].shift(225 - rotation, 8.1 * scale)
      points[prefixFunction('logoTGS46') + suffix] = points[
        prefixFunction('logoTGS45') + suffix
      ].shift(164.5 - rotation, 6.7 * scale)
      points[prefixFunction('logoTGS47') + suffix] = points[
        prefixFunction('logoTGS46') + suffix
      ].shift(180 - rotation, 7.4 * scale)
      points[prefixFunction('logoTGS48') + suffix] = points[
        prefixFunction('logoTGS47') + suffix
      ].shift(180 - rotation, 14.1 * scale)
      points[prefixFunction('logoTGS49') + suffix] = points[
        prefixFunction('logoTGS48') + suffix
      ].shift(217.9 - rotation, 11.4 * scale)
      points[prefixFunction('logoTGS51') + suffix] = points[
        prefixFunction('logoTGS49') + suffix
      ].shift(221.1 - rotation, 19.8 * scale)
      points[prefixFunction('logoTGS50') + suffix] = utils.beamsIntersect(
        points[prefixFunction('logoTGS48') + suffix],
        points[prefixFunction('logoTGS49') + suffix],
        points[prefixFunction('logoTGS51') + suffix],
        points[prefixFunction('logoTGS51') + suffix].shift(90 - rotation, 1)
      )
      points[prefixFunction('logoTGS52') + suffix] = points[
        prefixFunction('logoTGS51') + suffix
      ].shift(270 - rotation, 1.4 * scale)
      points[prefixFunction('logoTGS53') + suffix] = points[
        prefixFunction('logoTGS52') + suffix
      ].shift(346.2 - rotation, 11.3 * scale)
      points[prefixFunction('logoTGS54') + suffix] = points[
        prefixFunction('logoTGS53') + suffix
      ].shift(45 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS55') + suffix] = points[
        prefixFunction('logoTGS54') + suffix
      ].shift(321.4 - rotation, 0.6 * scale)
      points[prefixFunction('logoTGS56') + suffix] = points[
        prefixFunction('logoTGS55') + suffix
      ].shift(0 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS57') + suffix] = points[
        prefixFunction('logoTGS56') + suffix
      ].shift(270 - rotation, 1.2 * scale)
      points[prefixFunction('logoTGS58') + suffix] = points[
        prefixFunction('logoTGS57') + suffix
      ].shift(0 - rotation, 2.1 * scale)
      points[prefixFunction('logoTGS59') + suffix] = points[
        prefixFunction('logoTGS58') + suffix
      ].shift(0 - rotation, 1 * scale)
      points[prefixFunction('logoTGS60') + suffix] = points[
        prefixFunction('logoTGS59') + suffix
      ].shift(26.6 - rotation, 0.9 * scale)
      points[prefixFunction('logoTGS61') + suffix] = points[
        prefixFunction('logoTGS60') + suffix
      ].shift(137.1 - rotation, 1.9 * scale)
      points[prefixFunction('logoTGS62') + suffix] = points[
        prefixFunction('logoTGS61') + suffix
      ].shift(90 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS63') + suffix] = points[
        prefixFunction('logoTGS62') + suffix
      ].shift(324.5 - rotation, 0.9 * scale)
      points[prefixFunction('logoTGS64') + suffix] = points[
        prefixFunction('logoTGS63') + suffix
      ].shift(0 - rotation, 1.1 * scale)
      points[prefixFunction('logoTGS65') + suffix] = points[
        prefixFunction('logoTGS64') + suffix
      ].shift(180 - rotation, 0.2 * scale)
      points[prefixFunction('logoTGS66') + suffix] = points[
        prefixFunction('logoTGS65') + suffix
      ].shift(90 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS67') + suffix] = points[
        prefixFunction('logoTGS66') + suffix
      ].shift(336.8 - rotation, 0.8 * scale)
      points[prefixFunction('logoTGS68') + suffix] = points[
        prefixFunction('logoTGS67') + suffix
      ].shift(0 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS69') + suffix] = points[
        prefixFunction('logoTGS68') + suffix
      ].shift(0 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS70') + suffix] = points[
        prefixFunction('logoTGS69') + suffix
      ].shift(45 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS71') + suffix] = points[
        prefixFunction('logoTGS70') + suffix
      ].shift(135 - rotation, 0.8 * scale)
      points[prefixFunction('logoTGS72') + suffix] = points[
        prefixFunction('logoTGS71') + suffix
      ].shift(90 - rotation, 0.2 * scale)
      points[prefixFunction('logoTGS73') + suffix] = points[
        prefixFunction('logoTGS72') + suffix
      ].shift(329 - rotation, 0.6 * scale)
      points[prefixFunction('logoTGS74') + suffix] = points[
        prefixFunction('logoTGS73') + suffix
      ].shift(0 - rotation, 0.6 * scale)
      points[prefixFunction('logoTGS75') + suffix] = points[
        prefixFunction('logoTGS74') + suffix
      ].shift(138.4 - rotation, 1.2 * scale)
      points[prefixFunction('logoTGS76') + suffix] = points[
        prefixFunction('logoTGS75') + suffix
      ].shift(90 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS77') + suffix] = points[
        prefixFunction('logoTGS76') + suffix
      ].shift(0 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS78') + suffix] = points[
        prefixFunction('logoTGS77') + suffix
      ].shift(33.7 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS79') + suffix] = points[
        prefixFunction('logoTGS78') + suffix
      ].shift(319.4 - rotation, 0.9 * scale)
      points[prefixFunction('logoTGS80') + suffix] = points[
        prefixFunction('logoTGS79') + suffix
      ].shift(339.4 - rotation, 0.9 * scale)
      points[prefixFunction('logoTGS81') + suffix] = points[
        prefixFunction('logoTGS80') + suffix
      ].shift(135 - rotation, 0.1 * scale)
      points[prefixFunction('logoTGS82') + suffix] = points[
        prefixFunction('logoTGS81') + suffix
      ].shift(90 - rotation, 0.3 * scale)
      points[prefixFunction('logoTGS83') + suffix] = points[
        prefixFunction('logoTGS82') + suffix
      ].shift(0 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS84') + suffix] = points[
        prefixFunction('logoTGS83') + suffix
      ].shift(333.4 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS85') + suffix] = points[
        prefixFunction('logoTGS84') + suffix
      ].shift(128.7 - rotation, 0.6 * scale)
      points[prefixFunction('logoTGS86') + suffix] = points[
        prefixFunction('logoTGS85') + suffix
      ].shift(90 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS87') + suffix] = points[
        prefixFunction('logoTGS86') + suffix
      ].shift(26.6 - rotation, 0.5 * scale)
      points[prefixFunction('logoTGS88') + suffix] = points[
        prefixFunction('logoTGS87') + suffix
      ].shift(315 - rotation, 0.6 * scale)
      points[prefixFunction('logoTGS89') + suffix] = points[
        prefixFunction('logoTGS88') + suffix
      ].shift(333.4 - rotation, 0.5 * scale)
      points[prefixFunction('logoTGS90') + suffix] = points[
        prefixFunction('logoTGS89') + suffix
      ].shift(116.6 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS91') + suffix] = points[
        prefixFunction('logoTGS90') + suffix
      ].shift(63.4 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS92') + suffix] = points[
        prefixFunction('logoTGS91') + suffix
      ].shift(36.9 - rotation, 0.5 * scale)
      points[prefixFunction('logoTGS93') + suffix] = points[
        prefixFunction('logoTGS92') + suffix
      ].shift(21.8 - rotation, 0.5 * scale)
      points[prefixFunction('logoTGS94') + suffix] = points[
        prefixFunction('logoTGS93') + suffix
      ].shift(315 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS95') + suffix] = points[
        prefixFunction('logoTGS94') + suffix
      ].shift(90 - rotation, 0.6 * scale)
      points[prefixFunction('logoTGS96') + suffix] = points[
        prefixFunction('logoTGS95') + suffix
      ].shift(33.7 - rotation, 1.4 * scale)
      points[prefixFunction('logoTGS97') + suffix] = points[
        prefixFunction('logoTGS96') + suffix
      ].shift(315 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS98') + suffix] = points[
        prefixFunction('logoTGS97') + suffix
      ].shift(315 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS99') + suffix] = points[
        prefixFunction('logoTGS98') + suffix
      ].shift(243.4 - rotation, 1.2 * scale)
      points[prefixFunction('logoTGS100') + suffix] = points[
        prefixFunction('logoTGS99') + suffix
      ].shift(225 - rotation, 0.6 * scale)
      points[prefixFunction('logoTGS101') + suffix] = points[
        prefixFunction('logoTGS100') + suffix
      ].shift(135 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS102') + suffix] = points[
        prefixFunction('logoTGS101') + suffix
      ].shift(270 - rotation, 1.2 * scale)
      points[prefixFunction('logoTGS103') + suffix] = points[
        prefixFunction('logoTGS102') + suffix
      ].shift(180 - rotation, 0.5 * scale)
      points[prefixFunction('logoTGS104') + suffix] = points[
        prefixFunction('logoTGS103') + suffix
      ].shift(135 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS105') + suffix] = points[
        prefixFunction('logoTGS104') + suffix
      ].shift(270 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS106') + suffix] = points[
        prefixFunction('logoTGS105') + suffix
      ].shift(303.7 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS107') + suffix] = points[
        prefixFunction('logoTGS106') + suffix
      ].shift(243.4 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS108') + suffix] = points[
        prefixFunction('logoTGS107') + suffix
      ].shift(213.7 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS109') + suffix] = points[
        prefixFunction('logoTGS108') + suffix
      ].shift(143.1 - rotation, 0.5 * scale)
      points[prefixFunction('logoTGS110') + suffix] = points[
        prefixFunction('logoTGS109') + suffix
      ].shift(135 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS111') + suffix] = points[
        prefixFunction('logoTGS110') + suffix
      ].shift(270 - rotation, 0.9 * scale)
      points[prefixFunction('logoTGS112') + suffix] = points[
        prefixFunction('logoTGS111') + suffix
      ].shift(286 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS113') + suffix] = points[
        prefixFunction('logoTGS112') + suffix
      ].shift(225 - rotation, 0.6 * scale)
      points[prefixFunction('logoTGS114') + suffix] = points[
        prefixFunction('logoTGS113') + suffix
      ].shift(143.1 - rotation, 0.5 * scale)
      points[prefixFunction('logoTGS115') + suffix] = points[
        prefixFunction('logoTGS114') + suffix
      ].shift(116.6 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS116') + suffix] = points[
        prefixFunction('logoTGS115') + suffix
      ].shift(251.6 - rotation, 0.9 * scale)
      points[prefixFunction('logoTGS117') + suffix] = points[
        prefixFunction('logoTGS116') + suffix
      ].shift(288.4 - rotation, 0.9 * scale)
      points[prefixFunction('logoTGS118') + suffix] = points[
        prefixFunction('logoTGS117') + suffix
      ].shift(180 - rotation, 0.3 * scale)
      points[prefixFunction('logoTGS119') + suffix] = points[
        prefixFunction('logoTGS118') + suffix
      ].shift(123.7 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS120') + suffix] = points[
        prefixFunction('logoTGS119') + suffix
      ].shift(254.1 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS121') + suffix] = points[
        prefixFunction('logoTGS120') + suffix
      ].shift(296.6 - rotation, 0.9 * scale)
      points[prefixFunction('logoTGS122') + suffix] = points[
        prefixFunction('logoTGS121') + suffix
      ].shift(180 - rotation, 0.8 * scale)
      points[prefixFunction('logoTGS123') + suffix] = points[
        prefixFunction('logoTGS122') + suffix
      ].shift(101.3 - rotation, 1 * scale)
      points[prefixFunction('logoTGS124') + suffix] = points[
        prefixFunction('logoTGS123') + suffix
      ].shift(243.4 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS125') + suffix] = points[
        prefixFunction('logoTGS124') + suffix
      ].shift(270 - rotation, 0.7 * scale)
      points[prefixFunction('logoTGS126') + suffix] = points[
        prefixFunction('logoTGS125') + suffix
      ].shift(180 - rotation, 0.3 * scale)
      points[prefixFunction('logoTGS127') + suffix] = points[
        prefixFunction('logoTGS126') + suffix
      ].shift(135 - rotation, 0.3 * scale)
      points[prefixFunction('logoTGS128') + suffix] = points[
        prefixFunction('logoTGS127') + suffix
      ].shift(230.2 - rotation, 0.8 * scale)
      points[prefixFunction('logoTGS129') + suffix] = points[
        prefixFunction('logoTGS128') + suffix
      ].shift(270 - rotation, 0.9 * scale)
      points[prefixFunction('logoTGS130') + suffix] = points[
        prefixFunction('logoTGS129') + suffix
      ].shift(270 - rotation, 1.8 * scale)
      points[prefixFunction('logoTGS131') + suffix] = points[
        prefixFunction('logoTGS130') + suffix
      ].shift(0 - rotation, 3.5 * scale)
      points[prefixFunction('logoTGS132') + suffix] = points[
        prefixFunction('logoTGS131') + suffix
      ].shift(0 - rotation, 4.8 * scale)
      points[prefixFunction('logoTGS133') + suffix] = points[
        prefixFunction('logoTGS132') + suffix
      ].shift(34.7 - rotation, 1.6 * scale)
      points[prefixFunction('logoTGS134') + suffix] = points[
        prefixFunction('logoTGS133') + suffix
      ].shift(213.2 - rotation, 17.9 * scale)
      points[prefixFunction('logoTGS135') + suffix] = points[
        prefixFunction('logoTGS134') + suffix
      ].shift(270 - rotation, 11.4 * scale)
      points[prefixFunction('logoTGS136') + suffix] = points[
        prefixFunction('logoTGS135') + suffix
      ].shift(270 - rotation, 0.8 * scale)
      points[prefixFunction('logoTGS137') + suffix] = points[
        prefixFunction('logoTGS136') + suffix
      ].shift(0 - rotation, 0.3 * scale)
      points[prefixFunction('logoTGS138') + suffix] = points[
        prefixFunction('logoTGS137') + suffix
      ].shift(0 - rotation, 0.4 * scale)
      points[prefixFunction('logoTGS139') + suffix] = points[
        prefixFunction('logoTGS138') + suffix
      ].shift(48.6 - rotation, 13.5 * scale)
      points[prefixFunction('logoTGS140') + suffix] = points[
        prefixFunction('logoTGS139') + suffix
      ].shift(14.8 - rotation, 9.4 * scale)
      points[prefixFunction('logoTGS143') + suffix] = points[
        prefixFunction('logoTGS140') + suffix
      ].shift(57.8 - rotation, 8.3 * scale)
      points[prefixFunction('logoTGS142') + suffix] = utils.beamsIntersect(
        points[prefixFunction('logoTGS140') + suffix],
        points[prefixFunction('logoTGS140') + suffix].shift(14.8 - rotation, 1),
        points[prefixFunction('logoTGS143') + suffix],
        points[prefixFunction('logoTGS143') + suffix].shift(270 - rotation, 1)
      )
      points[prefixFunction('logoTGS141') + suffix] = points[
        prefixFunction('logoTGS140') + suffix
      ].shiftFractionTowards(points[prefixFunction('logoTGS142') + suffix], 0.1)
      points[prefixFunction('logoTGS144') + suffix] = points[
        prefixFunction('logoTGS143') + suffix
      ].shift(90 - rotation, 2.7 * scale)
      points[prefixFunction('logoTGS145') + suffix] = points[
        prefixFunction('logoTGS144') + suffix
      ].shift(57.7 - rotation, 3.6 * scale)
      points[prefixFunction('logoTGS146') + suffix] = points[
        prefixFunction('logoTGS145') + suffix
      ].shift(0 - rotation, 5 * scale)
      points[prefixFunction('logoTGS147') + suffix] = points[
        prefixFunction('logoTGS146') + suffix
      ].shift(315 - rotation, 6.9 * scale)
      points[prefixFunction('logoTGS148') + suffix] = points[
        prefixFunction('logoTGS147') + suffix
      ].shift(315 - rotation, 1.6 * scale)
      points[prefixFunction('logoTGS149') + suffix] = points[
        prefixFunction('logoTGS148') + suffix
      ].shift(0 - rotation, 0.9 * scale)
      points[prefixFunction('logoTGS150') + suffix] = points[
        prefixFunction('logoTGS149') + suffix
      ].shift(0 - rotation, 3.8 * scale)
      points[prefixFunction('logoTGS151') + suffix] = points[
        prefixFunction('logoTGS150') + suffix
      ].shift(40.8 - rotation, 3.8 * scale)

      const cpDistance = 46 * scale * 0.55191502449

      points[prefixFunction('logoTGSLeft') + suffix] = so.at.shift(180 - rotation, 46 * scale)
      points[prefixFunction('logoTGSTop') + suffix] = so.at.shift(90 - rotation, 46 * scale)
      points[prefixFunction('logoTGSRight') + suffix] = so.at.shift(-rotation, 46 * scale)
      points[prefixFunction('logoTGSBottom') + suffix] = so.at.shift(-90 - rotation, 46 * scale)
      points[prefixFunction('logoTGSCp1') + suffix] = points[prefixFunction('logoTGSLeft') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(90, points[prefixFunction('logoTGSLeft') + suffix])
      points[prefixFunction('logoTGSCp2') + suffix] = points[prefixFunction('logoTGSTop') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(-90, points[prefixFunction('logoTGSTop') + suffix])
      points[prefixFunction('logoTGSCp3') + suffix] = points[prefixFunction('logoTGSTop') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(90, points[prefixFunction('logoTGSTop') + suffix])
      points[prefixFunction('logoTGSCp4') + suffix] = points[
        prefixFunction('logoTGSRight') + suffix
      ]
        .shiftTowards(so.at, cpDistance)
        .rotate(-90, points[prefixFunction('logoTGSRight') + suffix])
      points[prefixFunction('logoTGSCp5') + suffix] = points[
        prefixFunction('logoTGSRight') + suffix
      ]
        .shiftTowards(so.at, cpDistance)
        .rotate(90, points[prefixFunction('logoTGSRight') + suffix])
      points[prefixFunction('logoTGSCp6') + suffix] = points[
        prefixFunction('logoTGSBottom') + suffix
      ]
        .shiftTowards(so.at, cpDistance)
        .rotate(-90, points[prefixFunction('logoTGSBottom') + suffix])
      points[prefixFunction('logoTGSCp7') + suffix] = points[
        prefixFunction('logoTGSBottom') + suffix
      ]
        .shiftTowards(so.at, cpDistance)
        .rotate(90, points[prefixFunction('logoTGSBottom') + suffix])
      points[prefixFunction('logoTGSCp8') + suffix] = points[prefixFunction('logoTGSLeft') + suffix]
        .shiftTowards(so.at, cpDistance)
        .rotate(-90, points[prefixFunction('logoTGSLeft') + suffix])
      paths[prefixFunction('logoTGSTangerineShark') + suffix] = new Path()
        .move(points[prefixFunction('logoTGSLeft') + suffix])
        .curve(
          points[prefixFunction('logoTGSCp1') + suffix],
          points[prefixFunction('logoTGSCp2') + suffix],
          points[prefixFunction('logoTGSTop') + suffix]
        )
        .curve(
          points[prefixFunction('logoTGSCp3') + suffix],
          points[prefixFunction('logoTGSCp4') + suffix],
          points[prefixFunction('logoTGSRight') + suffix]
        )
        .curve(
          points[prefixFunction('logoTGSCp5') + suffix],
          points[prefixFunction('logoTGSCp6') + suffix],
          points[prefixFunction('logoTGSBottom') + suffix]
        )
        .curve(
          points[prefixFunction('logoTGSCp7') + suffix],
          points[prefixFunction('logoTGSCp8') + suffix],
          points[prefixFunction('logoTGSLeft') + suffix]
        )
        .attr('data-text', 'Tangerine Shark')
        .attr('data-text-font-size', 12 * scale)
        .attr('style', `stroke-width: ${1 * scale};`)
      paths[prefixFunction('logoTGSPatterns') + suffix] = new Path()
        .move(points[prefixFunction('logoTGSLeft') + suffix])
        .curve(
          points[prefixFunction('logoTGSCp8') + suffix],
          points[prefixFunction('logoTGSCp7') + suffix],
          points[prefixFunction('logoTGSBottom') + suffix]
        )
        .curve(
          points[prefixFunction('logoTGSCp6') + suffix],
          points[prefixFunction('logoTGSCp5') + suffix],
          points[prefixFunction('logoTGSRight') + suffix]
        )
        .offset(14 * scale)
        .attr('data-text', 'Patterns')
        .attr('data-text-class', 'right')
        .attr('data-text-font-size', 12 * scale)
        .attr('style', `stroke-width: ${1 * scale};`)
      paths[prefixFunction('logoTGSOuter') + suffix] = paths[
        prefixFunction('logoTGSTangerineShark') + suffix
      ]
        .offset(-14 * scale)
        .attr('style', `stroke-width: ${1 * scale};`)

      paths[prefixFunction('logoTGSShark') + suffix] = new Path()
        .move(points[prefixFunction('logoTGS0') + suffix])
        .curve_(
          points[prefixFunction('logoTGS1') + suffix],
          points[prefixFunction('logoTGS2') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS3') + suffix],
          points[prefixFunction('logoTGS4') + suffix]
        )
        .curve(
          points[prefixFunction('logoTGS5') + suffix],
          points[prefixFunction('logoTGS6') + suffix],
          points[prefixFunction('logoTGS7') + suffix]
        )

        .curve_(
          points[prefixFunction('logoTGS8') + suffix],
          points[prefixFunction('logoTGS9') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS10') + suffix],
          points[prefixFunction('logoTGS11') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS12') + suffix],
          points[prefixFunction('logoTGS13') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS14') + suffix],
          points[prefixFunction('logoTGS15') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS16') + suffix],
          points[prefixFunction('logoTGS17') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS18') + suffix],
          points[prefixFunction('logoTGS19') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS20') + suffix],
          points[prefixFunction('logoTGS21') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS22') + suffix],
          points[prefixFunction('logoTGS23') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS24') + suffix],
          points[prefixFunction('logoTGS25') + suffix]
        )
        .line(points[prefixFunction('logoTGS26') + suffix])
        .curve_(
          points[prefixFunction('logoTGS27') + suffix],
          points[prefixFunction('logoTGS28') + suffix]
        )
        .curve(
          points[prefixFunction('logoTGS29') + suffix],
          points[prefixFunction('logoTGS30') + suffix],
          points[prefixFunction('logoTGS31') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS32') + suffix],
          points[prefixFunction('logoTGS33') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS34') + suffix],
          points[prefixFunction('logoTGS35') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS36') + suffix],
          points[prefixFunction('logoTGS37') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS38') + suffix],
          points[prefixFunction('logoTGS39') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS40') + suffix],
          points[prefixFunction('logoTGS41') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS42') + suffix],
          points[prefixFunction('logoTGS43') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS44') + suffix],
          points[prefixFunction('logoTGS45') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS46') + suffix],
          points[prefixFunction('logoTGS47') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS48') + suffix],
          points[prefixFunction('logoTGS49') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS50') + suffix],
          points[prefixFunction('logoTGS51') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS52') + suffix],
          points[prefixFunction('logoTGS53') + suffix]
        )
        .line(points[prefixFunction('logoTGS54') + suffix])
        .curve_(
          points[prefixFunction('logoTGS55') + suffix],
          points[prefixFunction('logoTGS56') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS57') + suffix],
          points[prefixFunction('logoTGS58') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS59') + suffix],
          points[prefixFunction('logoTGS60') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS61') + suffix],
          points[prefixFunction('logoTGS62') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS63') + suffix],
          points[prefixFunction('logoTGS64') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS65') + suffix],
          points[prefixFunction('logoTGS66') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS67') + suffix],
          points[prefixFunction('logoTGS68') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS69') + suffix],
          points[prefixFunction('logoTGS70') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS71') + suffix],
          points[prefixFunction('logoTGS72') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS73') + suffix],
          points[prefixFunction('logoTGS74') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS75') + suffix],
          points[prefixFunction('logoTGS76') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS77') + suffix],
          points[prefixFunction('logoTGS78') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS79') + suffix],
          points[prefixFunction('logoTGS80') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS81') + suffix],
          points[prefixFunction('logoTGS82') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS83') + suffix],
          points[prefixFunction('logoTGS84') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS85') + suffix],
          points[prefixFunction('logoTGS86') + suffix]
        )
        .line(points[prefixFunction('logoTGS87') + suffix])
        .curve_(
          points[prefixFunction('logoTGS88') + suffix],
          points[prefixFunction('logoTGS89') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS90') + suffix],
          points[prefixFunction('logoTGS91') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS92') + suffix],
          points[prefixFunction('logoTGS93') + suffix]
        )
        .line(points[prefixFunction('logoTGS94') + suffix])
        .line(points[prefixFunction('logoTGS95') + suffix])
        .curve_(
          points[prefixFunction('logoTGS96') + suffix],
          points[prefixFunction('logoTGS97') + suffix]
        )
        .curve(
          points[prefixFunction('logoTGS98') + suffix],
          points[prefixFunction('logoTGS99') + suffix],
          points[prefixFunction('logoTGS100') + suffix]
        )
        .line(points[prefixFunction('logoTGS101') + suffix])
        .curve_(
          points[prefixFunction('logoTGS102') + suffix],
          points[prefixFunction('logoTGS103') + suffix]
        )
        .line(points[prefixFunction('logoTGS104') + suffix])
        .curve_(
          points[prefixFunction('logoTGS105') + suffix],
          points[prefixFunction('logoTGS106') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS107') + suffix],
          points[prefixFunction('logoTGS108') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS109') + suffix],
          points[prefixFunction('logoTGS110') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS111') + suffix],
          points[prefixFunction('logoTGS112') + suffix]
        )
        .line(points[prefixFunction('logoTGS113') + suffix])
        .curve_(
          points[prefixFunction('logoTGS114') + suffix],
          points[prefixFunction('logoTGS115') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS116') + suffix],
          points[prefixFunction('logoTGS117') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS118') + suffix],
          points[prefixFunction('logoTGS119') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS120') + suffix],
          points[prefixFunction('logoTGS121') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS122') + suffix],
          points[prefixFunction('logoTGS123') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS124') + suffix],
          points[prefixFunction('logoTGS125') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS126') + suffix],
          points[prefixFunction('logoTGS127') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS128') + suffix],
          points[prefixFunction('logoTGS129') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS130') + suffix],
          points[prefixFunction('logoTGS131') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS132') + suffix],
          points[prefixFunction('logoTGS133') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS134') + suffix],
          points[prefixFunction('logoTGS135') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS136') + suffix],
          points[prefixFunction('logoTGS137') + suffix]
        )
        .curve(
          points[prefixFunction('logoTGS138') + suffix],
          points[prefixFunction('logoTGS139') + suffix],
          points[prefixFunction('logoTGS140') + suffix]
        )
        .curve(
          points[prefixFunction('logoTGS141') + suffix],
          points[prefixFunction('logoTGS142') + suffix],
          points[prefixFunction('logoTGS143') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS144') + suffix],
          points[prefixFunction('logoTGS145') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS146') + suffix],
          points[prefixFunction('logoTGS147') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS148') + suffix],
          points[prefixFunction('logoTGS149') + suffix]
        )
        .curve_(
          points[prefixFunction('logoTGS150') + suffix],
          points[prefixFunction('logoTGS151') + suffix]
        )

        .attr('class', 'canvas') // fill-canvas')
        .attr('style', `stroke-width: ${0.5 * scale};`)
    },
  },
}

// More specifically named exports
export const logoTGSPlugin = plugin
export const pluginLogoTGS = plugin
