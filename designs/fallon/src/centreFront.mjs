import { skirtBase } from './skirtBase.mjs'
import { pocket } from '@freesewing/wanda'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const centreFront = {
  name: 'fallon.centreFront',
  from: skirtBase,
  after: pocket,
  hide: {
    from: true,
  },
  options: {
    //Construction
    seams: { dflt: 'all', list: ['all', 'sideSeam', 'sideFront', 'none'], menu: 'construction' },
    skirtHemWidth: { pct: 1, min: 0, max: 10, menu: 'construction' },
    waistFacingHemWidth: { pct: 2, min: 1, max: 10, menu: 'construction' },
  },
  plugins: [pluginLogoRG],
  draft: ({
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
    Snippet,
    absoluteOptions,
    log,
  }) => {
    //removing paths
    for (let i in paths) delete paths[i]
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.hemL)
      ._curve(points.hemLCp2, points.hemD)
      .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
      .hide()

    const drawHemBase = () => {
      if (options.seams != 'none') {
        if (options.seams == 'all' || options.seams == 'sideFront') {
          return paths.hemBase.split(points.hemD)[1].hide()
        } else {
          return paths.hemBase.split(points.hemZ)[1].hide()
        }
      } else {
        return paths.hemBase
      }
    }

    paths.cf = new Path().move(points.cfHem).line(points.cfWaist).hide()

    paths.cfWaist = new Path()
      .move(points.cfWaist)
      .curve(points.cfWaistCp2, points.waistPanel0Cp1, points.waistPanel0)
      .curve(points.waistPanel0Cp2, points.waist0LeftCp1, points.waist0Left)
      .hide()

    const drawWaistSeam = () => {
      if (options.seams != 'none') {
        if (options.seams == 'all' || options.seams == 'sideFront') {
          return paths.cfWaist
        } else {
          return paths.cfWaist
            .clone()
            .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
            .curve(points.dartTipDCp, points.waist1RightCp1, points.waist1Right)
            .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
            .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
        }
      } else {
        return paths.cfWaist
          .clone()
          .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
          .curve(points.dartTipDCp, points.waist1RightCp1, points.waist1Right)
          .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
          .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
          .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
          .curve(points.dartTipECp, points.waist2RightCp1, points.waist2Right)
          .curve(points.waist2RightCp2, points.waistPanel2Cp1, points.waistPanel2)
          .curve(points.waistPanel2Cp2, points.waist2LeftCp1, points.waist2Left)
      }
    }

    const drawSaRight = () => {
      if (options.seams != 'none') {
        if (options.seams == 'all' || options.seams == 'sideFront') {
          return new Path()
            .move(points.waist0Left)
            .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
            .line(points.hemD)
        } else {
          return new Path()
            .move(points.waist1Left)
            .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
            .line(points.hemZ)
        }
      } else {
        return new Path()
          .move(points.waist2Left)
          .curve(points.waist2LeftCp2, points.dartTipFCp, points.dartTipF)
          .line(points.curveStartL)
          .curve(points.curveStartLCp2, points.hemLCp1, points.hemL)
      }
    }

    paths.seam = drawHemBase().join(paths.cf).join(drawWaistSeam()).join(drawSaRight())

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfHem
      points.cutOnFoldTo = points.cfWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //notches
      if (options.pocketsBool && (options.seams == 'none' || options.seams == 'sideSeam')) {
        points.pocketOpeningTop = drawSaRight().shiftAlong(store.get('pocketOpening'))

        points.pocketOpeningBottom = drawSaRight().shiftAlong(store.get('pocketOpeningLength'))
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      let titleName
      if (options.seams == 'all' || options.seams == 'sideFront') {
        titleName = 'Centre Front'
      } else {
        titleName = 'Front'
      }
      points.title = new Point(points.waist0Left.x * 1.05, points.cfHem.y * 0.6)
      macro('title', {
        nr: '1',
        title: titleName,
        at: points.title,
      })
      //logo
      points.logo = new Point(points.waist0LeftCp1.x, points.cfHem.y * 0.7)
      macro('logorg', {
        at: points.logo,
        scale: 0.75,
      })
      //scalebox
      points.scalebox = new Point(points.waist0LeftCp1.x, points.cfHem.y * 0.8)
      macro('scalebox', {
        at: points.scalebox,
      })
      //facings
      let hemFacingSplit
      if (options.seams != 'none') {
        if (options.seams == 'all' || options.seams == 'sideFront') {
          hemFacingSplit = points.hemFacingD
        } else {
          hemFacingSplit = points.hemFacingSplitZ
        }
      } else {
        hemFacingSplit = points.hemFacingSplitL
      }

      paths.hemFacing = new Path()
        .move(points.hemFacingL)
        .curve(points.hemFacingLCp1, points.hemFacingDCp2, points.hemFacingD)
        .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
        .split(hemFacingSplit)[1]
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')

      if (options.waistbandStyle == 'none') {
        const drawWaistFacing = () => {
          if (options.seams != 'none') {
            if (options.seams == 'all' || options.seams == 'sideFront') {
              return new Path().move(points.waistFacingD)
            } else {
              return new Path()
                .move(points.waistFacingE)
                .curve(points.waistFacingECp2, points.waistFacingDCp1, points.waistFacingD)
            }
          } else {
            return new Path()
              .move(points.waistFacingF)
              .curve(points.waistFacingFCp2, points.waistFacingECp1, points.waistFacingE)
              .curve(points.waistFacingECp2, points.waistFacingDCp1, points.waistFacingD)
          }
        }
        paths.waistFacing = drawWaistFacing()
          .curve(points.waistFacingDCp2, points.cfWaistFacingCp1, points.cfWaistFacing)
          .attr('class', 'interfacing')
          .attr('data-text', 'Waist Facing - Line')
          .attr('data-text-class', 'center')
      }
      //darts and seams

      if (options.seams == 'none' || options.seams == 'sideSeam') {
        if (options.seams == 'none') {
          paths.sideDart = new Path()
            .move(points.waist1Left)
            .line(points.dartTopE)
            .line(points.waist2Right)
            .attr('class', 'fabric help')
        }
        paths.frontDart = new Path()
          .move(points.waist0Left)
          .line(points.dartTopD)
          .line(points.waist1Right)
          .attr('class', 'fabric help')
      }

      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100

        const drawWaistSa = () => {
          if (options.seams != 'none') {
            if (options.seams == 'all' || options.seams == 'sideFront') {
              return paths.cfWaist
            } else {
              return paths.cfWaist
                .clone()
                .line(points.dartTopD)
                .line(points.waist1Right)
                .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
                .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
            }
          } else {
            return paths.cfWaist
              .clone()
              .line(points.dartTopD)
              .line(points.waist1Right)
              .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
              .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
              .line(points.dartTopE)
              .line(points.waist2Right)
              .curve(points.waist2RightCp2, points.waistPanel2Cp1, points.waistPanel2)
              .curve(points.waistPanel2Cp2, points.waist2LeftCp1, points.waist2Left)
          }
        }

        paths.hemFacingSa = drawHemBase()
          .offset(hemSa)
          .line(points.cfHemFacing)
          .join(paths.hemFacing.reverse().offset(sa))
          .join(drawSaRight().split(hemFacingSplit)[1].offset(sa))
          .close()
          .attr('class', 'interfacing sa')

        if (options.waistbandStyle == 'none') {
          paths.waistFacingSa = paths.waistFacing
            .offset(sa * options.waistFacingHemWidth * 100)
            .line(points.cfWaist)
            .join(drawWaistSa().offset(sa))
            .join(drawSaRight().split(paths.waistFacing.start())[0].offset(sa))
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = drawHemBase()
          .offset(hemSa)
          .join(paths.cf)
          .join(drawWaistSa().offset(sa))
          .join(drawSaRight().offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
