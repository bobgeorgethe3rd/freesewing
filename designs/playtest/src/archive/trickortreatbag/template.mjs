import { pluginMirror } from '@freesewing/plugin-mirror'
import { pctBasedOn } from '@freesewing/core'

export const template = {
  name: 'playtest.template',
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Style
    template: {
      dflt: 'A',
      list: [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'broomstick',
        'butterfly',
        'cat',
        'crown',
        'moon',
        'moons',
        'spiderwebC',
        'spiderwebS',
        'star',
        'stars',
        'train',
        'wandMoon',
        'wandStar',
        'witchHat',
      ],
      menu: 'style',
    },
  },
  plugins: [pluginMirror],
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
    log,
    absoluteOptions,
  }) => {
    //default
    const xDist = 210
    const yDist = 230
    const dist = xDist < yDist ? xDist : yDist
    //let's begin
    //box
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.translate(-xDist * 0.5, -yDist * 0.5)
    points.bottomLeft = points.topLeft.flipY(points.origin)
    points.bottomRight = points.bottomLeft.flipX(points.origin)
    points.topRight = points.bottomRight.flipY(points.origin)

    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (sa) {
      paths.sa = new Path()
        .move(points.topLeft.translate(-sa, -sa))
        .line(points.bottomLeft.translate(-sa, sa))
        .line(points.bottomRight.translate(sa, sa))
        .line(points.topRight.translate(sa, -sa))
        .line(points.topLeft.translate(-sa, -sa))
        .close()
        .attr('class', 'fabric sa')
    }
    //templates

    switch (options.template) {
      case 'A': {
      }

      case 'B':
        break
      case 'C':
        break
      case 'D':
        break
      case 'E':
        break
      case 'F':
        break
      case 'G':
        break
      case 'I':
        break
      case 'train':
        points.origin.attr('data-text', 'train')

        points.trainTankTopLeft = points.origin.translate(xDist * 0.15 * -1, yDist * 0.125 * -1)
        points.trainTankBottomLeft = points.trainTankTopLeft.flipY(points.origin)
        points.trainTankBottomRight = points.trainTankBottomLeft.flipX(points.origin)
        points.trainTankTopRight = points.trainTankBottomRight.flipY(points.origin)

        points.trainRunningTopLeft = new Point(-xDist * 0.4, points.trainTankBottomLeft.y)
        points.trainRunningTopRight = points.trainRunningTopLeft.flipX(points.origin)
        points.trainRunningBottomLeft = points.trainRunningTopLeft.shift(-90, yDist * 0.06)
        points.trainRunningBottomRight = points.trainRunningBottomLeft.flipX(points.origin)
        points.trainRunningBottomCornerLeft = points.trainRunningBottomLeft.shift(
          0,
          points.trainRunningTopLeft.dist(points.trainRunningBottomLeft) * 0.25
        )
        points.trainRunningTopCornerLeft = new Point(
          points.trainRunningBottomCornerLeft.x,
          points.trainRunningTopLeft.y +
            points.trainRunningTopLeft.dist(points.trainRunningBottomLeft) * 0.25
        )
        points.trainRunningBottomCornerRight = points.trainRunningBottomCornerLeft.flipX(
          points.origin
        )
        points.trainRunningTopCornerRight = points.trainRunningTopCornerLeft.flipX(points.origin)

        points.trainBoilerLeft = points.trainTankTopLeft.shift(90, yDist * 0.05)
        points.trainBoilerRight = points.trainBoilerLeft.flipX(points.origin)

        points.trainBunkerBottomRight = new Point(
          points.trainRunningTopCornerRight.x,
          points.trainRunningTopRight.y
        )
        points.trainBunkerBottomLeft = points.trainTankBottomRight.shiftFractionTowards(
          points.trainBunkerBottomRight,
          0.75
        )
        points.trainBunkerTop = new Point(
          points.trainBunkerBottomRight.x,
          (points.trainTankTopRight.y + points.trainBoilerRight.y) * 0.5
        )
        points.trainCabBottomRight = new Point(
          points.trainBunkerBottomLeft.x,
          points.trainBunkerTop.y
        )
        points.trainCabTopLeft = points.trainTankTopRight.shiftFractionTowards(
          points.trainBoilerRight,
          3
        )
        points.trainCabTopRight = new Point(points.trainCabBottomRight.x, points.trainCabTopLeft.y)

        points.trainCabRoofLeft = points.trainCabTopLeft.shiftFractionTowards(
          points.trainBoilerRight,
          0.15
        )
        points.trainCabRoofRight = new Point(points.trainCabTopRight.x, points.trainCabRoofLeft.y)

        paths.train = new Path()
          .move(points.trainRunningTopLeft)
          .line(points.trainRunningBottomLeft)
          .line(points.trainRunningBottomCornerLeft)
          .line(points.trainRunningTopCornerLeft)
          .line(points.trainRunningTopCornerRight)
          .line(points.trainRunningBottomCornerRight)
          .line(points.trainRunningBottomRight)
          .line(points.trainRunningTopRight)
          .line(points.trainRunningTopLeft)
          .move(points.trainTankTopLeft)
          .line(points.trainTankBottomLeft)
          .line(points.trainTankBottomRight)
          .line(points.trainTankTopRight)
          .line(points.trainTankTopLeft)
          .move(points.trainBunkerBottomRight)
          .line(points.trainBunkerTop)
          .line(points.trainCabBottomRight)
          .line(points.trainBunkerBottomLeft)
          .move(points.trainCabBottomRight)
          .line(points.trainCabTopRight)
          .line(points.trainCabTopLeft)
          .line(points.trainTankTopRight)
          .move(points.trainCabRoofLeft)
          .line(points.trainCabRoofRight)
          .move(points.trainBoilerRight)
          .line(points.trainBoilerLeft)
          .line(points.trainTankTopLeft)

        break
      case 'wandMoon':
        points.origin.attr('data-text', 'wandMoon')

        points.wandBottomAnchor = points.bottomLeft.translate((xDist * 2) / 21, (-yDist * 2) / 21)
        points.wandTopAnchor = points.topRight.translate((-xDist * 2) / 21, (yDist * 2) / 21)
        points.wandMoonAnchor = points.wandTopAnchor.shiftFractionTowards(
          points.wandBottomAnchor,
          1 / 3
        )
        points.wandMoonOrigin = points.wandMoonAnchor.shiftFractionTowards(
          points.wandTopAnchor,
          0.5
        )
        const wandMoonRadius = points.wandMoonOrigin.dist(points.wandMoonAnchor)
        /* points.wandMoonInnerOrigin = points.wandMoonOrigin.shift(points.wandMoonOrigin.angle(points.wandMoonAnchor) + 90, wandMoonRadius * 0.75)
		// points.wandMoonInnerOrigin = points.wandMoonOrigin.shift(0, wandMoonRadius * 0.75)
				
		points.wandMoonInnerTop = points.wandMoonOrigin
		.shift( points.wandMoonOrigin.angle(points.wandMoonAnchor) + 90, points.wandMoonInnerOrigin.dist(points.wandMoonOrigin) * 0.5)
		.shift(points.wandMoonOrigin.angle(points.wandTopAnchor),
        Math.sqrt(
          Math.pow(wandMoonRadius, 2) -
            Math.pow(points.wandMoonInnerOrigin.dist(points.wandMoonOrigin) * 0.5, 2)
        )
		)
		
		points.wandMoonInnerBottom = points.wandMoonOrigin
		.shift( points.wandMoonOrigin.angle(points.wandMoonAnchor) + 90, points.wandMoonInnerOrigin.dist(points.wandMoonOrigin) * 0.5)
		.shift(points.wandTopAnchor.angle(points.wandMoonOrigin),
        Math.sqrt(
          Math.pow(wandMoonRadius, 2) -
            Math.pow(points.wandMoonInnerOrigin.dist(points.wandMoonOrigin) * 0.5, 2)
        )
		)
		
		// points.wandMoonInnerTop = points.wandMoonOrigin.translate(points.wandMoonInnerOrigin.dist(points.wandMoonOrigin) * 0.5,
        // -Math.sqrt(
          // Math.pow(wandMoonRadius, 2) -
            // Math.pow(points.wandMoonInnerOrigin.dist(points.wandMoonOrigin) * 0.5, 2)
        // )
		// )
		
		// points.wandMoonInnerBottom = points.wandMoonInnerTop.flipY(points.wandMoonOrigin)
		
		points.wandMoonLeft = points.wandMoonAnchor.rotate(-90, points.wandMoonOrigin)
		points.wandMoonInnerLeft = points.wandMoonInnerOrigin.shiftTowards(points.wandMoonLeft, points.wandMoonOrigin.dist(points.wandMoonAnchor)) */

        // points.wandMoonLeft = points.wandMoonOrigin.shift(180, wandMoonRadius)
        // points.wandMoonInnerLeft = points.wandMoonInnerOrigin.shift(180, wandMoonRadius)

        points.wandMoonInnerTop = points.wandTopAnchor
        const wandMoonRotation = utils.rad2deg(
          Math.acos((wandMoonRadius * 0.75 * 0.5) / wandMoonRadius)
        )
        points.wandMoonInnerOrigin = points.wandMoonOrigin.shift(
          points.wandMoonOrigin.angle(points.wandMoonInnerTop) - wandMoonRotation,
          wandMoonRadius * 0.75
        )

        points.wandMoonInnerBottom = points.wandMoonOrigin
          .shift(
            points.wandMoonOrigin.angle(points.wandMoonInnerOrigin),
            points.wandMoonInnerOrigin.dist(points.wandMoonOrigin) * 0.5
          )
          .shift(
            points.wandMoonOrigin.angle(points.wandMoonInnerOrigin) - 90,
            Math.sqrt(
              Math.pow(wandMoonRadius, 2) -
                Math.pow(points.wandMoonInnerOrigin.dist(points.wandMoonOrigin) * 0.5, 2)
            )
          )

        points.wandMoonLeft = points.wandMoonOrigin.shift(
          points.wandMoonInnerOrigin.angle(points.wandMoonOrigin),
          wandMoonRadius
        )
        points.wandMoonInnerLeft = points.wandMoonInnerOrigin.shift(
          points.wandMoonInnerOrigin.angle(points.wandMoonOrigin),
          wandMoonRadius
        )

        const wandMoonOuterCpDistance =
          (4 / 3) *
          wandMoonRadius *
          Math.tan(
            utils.deg2rad(
              (points.wandMoonOrigin.angle(points.wandMoonLeft) -
                points.wandMoonOrigin.angle(points.wandMoonInnerTop)) /
                4
            )
          )
        const wandMoonInnerCpDistance =
          (4 / 3) *
          wandMoonRadius *
          Math.tan(
            Math.tan(
              utils.deg2rad(
                (points.wandMoonInnerOrigin.angle(points.wandMoonInnerLeft) -
                  points.wandMoonInnerOrigin.angle(points.wandMoonInnerTop)) /
                  4
              )
            )
          )

        points.wandMoonInnerTopCp2 = points.wandMoonInnerTop.shift(
          points.wandMoonOrigin.angle(points.wandMoonInnerTop) + 90,
          wandMoonOuterCpDistance
        )
        points.wandMoonLeftCp1 = points.wandMoonLeft.shift(
          points.wandMoonOrigin.angle(points.wandMoonLeft) - 90,
          wandMoonOuterCpDistance
        )
        points.wandMoonLeftCp2 = points.wandMoonLeftCp1.rotate(180, points.wandMoonLeft)
        points.wandMoonInnerBottomCp1 = points.wandMoonInnerBottom.shift(
          points.wandMoonOrigin.angle(points.wandMoonInnerBottom) - 90,
          wandMoonOuterCpDistance
        )

        points.wandMoonInnerBottomCp2 = points.wandMoonInnerBottom.shift(
          points.wandMoonInnerOrigin.angle(points.wandMoonInnerBottom) - 90,
          wandMoonInnerCpDistance
        )
        points.wandMoonInnerLeftCp1 = points.wandMoonInnerLeft.shift(
          points.wandMoonInnerOrigin.angle(points.wandMoonInnerLeft) + 90,
          wandMoonInnerCpDistance
        )
        points.wandMoonInnerLeftCp2 = points.wandMoonInnerLeftCp1.rotate(
          180,
          points.wandMoonInnerLeft
        )
        points.wandMoonInnerTopCp1 = points.wandMoonInnerTop.shift(
          points.wandMoonInnerOrigin.angle(points.wandMoonInnerTop) + 90,
          wandMoonInnerCpDistance
        )

        points.wandBottomLeft = points.wandBottomAnchor.shift(
          points.bottomLeft.angle(points.wandBottomAnchor) + 90,
          points.bottomLeft.dist(points.wandBottomAnchor) * 0.125
        )
        points.wandBottomRight = points.wandBottomLeft.rotate(180, points.wandBottomAnchor)

        points.wandTopLeft = utils.lineIntersectsCurve(
          points.wandBottomLeft,
          points.wandBottomLeft.shift(
            points.bottomLeft.angle(points.wandBottomAnchor),
            xDist + yDist
          ),
          points.wandMoonLeft,
          points.wandMoonLeftCp2,
          points.wandMoonInnerBottomCp1,
          points.wandMoonInnerBottom
        )
        points.wandTopRight = utils.lineIntersectsCurve(
          points.wandBottomRight,
          points.wandBottomRight.shift(
            points.bottomLeft.angle(points.wandBottomAnchor),
            xDist + yDist
          ),
          points.wandMoonLeft,
          points.wandMoonLeftCp2,
          points.wandMoonInnerBottomCp1,
          points.wandMoonInnerBottom
        )

        points.wamdMoonSparkleOrigin0 = points.topLeft.shiftFractionTowards(points.origin, 1 / 3)
        points.wamdMoonSparkleOrigin1 = points.bottomRight.shiftFractionTowards(
          points.origin,
          1 / 3
        )
        points.wamdMoonSparkleOrigin2 = new Point(points.wamdMoonSparkleOrigin0.x, points.origin.y)
        points.wamdMoonSparkleOrigin3 = new Point(
          (points.wamdMoonSparkleOrigin0.x * 1) / 6,
          points.wamdMoonSparkleOrigin0.y
        )
        points.wamdMoonSparkleOrigin4 = new Point(points.origin.x, points.wamdMoonSparkleOrigin1.y)
        points.wamdMoonSparkleOrigin5 = new Point(
          points.wamdMoonSparkleOrigin1.x,
          (points.wamdMoonSparkleOrigin1.y * 1) / 6
        )

        const wamdMoonSparkleDist =
          points.wamdMoonSparkleOrigin0.dist(points.wamdMoonSparkleOrigin3) <
          points.wamdMoonSparkleOrigin0.dist(points.wamdMoonSparkleOrigin2)
            ? points.wamdMoonSparkleOrigin0.dist(points.wamdMoonSparkleOrigin3) / 3
            : points.wamdMoonSparkleOrigin0.dist(points.wamdMoonSparkleOrigin2) / 3

        for (let i = 0; i <= 5; i++) {
          for (let j = 0; j < 10; j++) {
            points['wamdMoonSparklePoint' + i + j] = points['wamdMoonSparkleOrigin' + i].shift(
              90 + 360 * (j / 10),
              wamdMoonSparkleDist
            )
            paths['wamdMoonSparkleLine' + i + j] = new Path()
              .move(points['wamdMoonSparklePoint' + i + j])
              .line(points['wamdMoonSparkleOrigin' + i])
          }
        }

        paths.wandMoon = new Path()
          .move(points.wandTopLeft)
          .line(points.wandBottomLeft)
          .line(points.wandBottomRight)
          .line(points.wandTopRight)
          .move(points.wandMoonInnerTop)
          .curve(points.wandMoonInnerTopCp2, points.wandMoonLeftCp1, points.wandMoonLeft)
          .curve(points.wandMoonLeftCp2, points.wandMoonInnerBottomCp1, points.wandMoonInnerBottom)
          .curve(
            points.wandMoonInnerBottomCp2,
            points.wandMoonInnerLeftCp1,
            points.wandMoonInnerLeft
          )
          .curve(points.wandMoonInnerLeftCp2, points.wandMoonInnerTopCp1, points.wandMoonInnerTop)

        break
      case 'wandStar':
        points.origin.attr('data-text', 'wandStar')

        points.wandBottomAnchor = points.bottomLeft.translate((xDist * 2) / 21, (-yDist * 2) / 21)
        points.wandTopAnchor = points.topRight.translate((-xDist * 2) / 21, (yDist * 2) / 21)
        points.wandStarAnchor = points.wandTopAnchor.shiftFractionTowards(
          points.wandBottomAnchor,
          0.25
        )
        points.wandStarCorner1 = utils.beamsIntersect(
          points.wandStarAnchor,
          points.wandTopAnchor.rotate(54, points.wandStarAnchor),
          points.wandTopAnchor,
          points.wandStarAnchor.rotate(-18, points.wandTopAnchor)
        )
        points.wandStarCorner2 = points.wandStarAnchor.rotate(108, points.wandStarCorner1)
        points.wandStarCorner3 = points.wandStarCorner1.rotate(108, points.wandStarCorner2)
        points.wandStarCorner4 = points.wandStarCorner2.rotate(108, points.wandStarCorner3)
        points.wandStarTip1 = points.wandStarCorner2.shiftOutwards(
          points.wandStarCorner3,
          points.wandStarCorner2.dist(points.wandTopAnchor)
        )
        points.wandStarTip2 = points.wandStarCorner3.shiftOutwards(
          points.wandStarCorner4,
          points.wandStarCorner2.dist(points.wandTopAnchor)
        )
        points.wandStarTip3 = points.wandStarCorner4.shiftOutwards(
          points.wandStarAnchor,
          points.wandStarCorner2.dist(points.wandTopAnchor)
        )
        points.wandStarTip4 = points.wandStarAnchor.shiftOutwards(
          points.wandStarCorner1,
          points.wandStarCorner2.dist(points.wandTopAnchor)
        )

        points.wandBottomLeft = points.wandBottomAnchor.shift(
          points.bottomLeft.angle(points.wandBottomAnchor) + 90,
          points.bottomLeft.dist(points.wandBottomAnchor) * 0.125
        )
        points.wandBottomRight = points.wandBottomLeft.rotate(180, points.wandBottomAnchor)

        points.wandTopLeft = utils.beamsIntersect(
          points.wandBottomLeft,
          points.wandBottomLeft.shift(points.bottomLeft.angle(points.wandBottomAnchor), 1),
          points.wandStarAnchor,
          points.wandStarTip3
        )
        points.wandTopRight = utils.beamsIntersect(
          points.wandBottomRight,
          points.wandBottomRight.shift(points.bottomLeft.angle(points.wandBottomAnchor), 1),
          points.wandStarAnchor,
          points.wandStarTip2
        )

        points.wamdStarSparkleOrigin0 = points.topLeft.shiftFractionTowards(points.origin, 1 / 3)
        points.wamdStarSparkleOrigin1 = points.bottomRight.shiftFractionTowards(
          points.origin,
          1 / 3
        )
        points.wamdStarSparkleOrigin2 = new Point(points.wamdStarSparkleOrigin0.x, points.origin.y)
        points.wamdStarSparkleOrigin3 = new Point(
          (points.wamdStarSparkleOrigin0.x * 1) / 6,
          points.wamdStarSparkleOrigin0.y
        )
        points.wamdStarSparkleOrigin4 = new Point(points.origin.x, points.wamdStarSparkleOrigin1.y)
        points.wamdStarSparkleOrigin5 = new Point(
          points.wamdStarSparkleOrigin1.x,
          (points.wamdStarSparkleOrigin1.y * 1) / 6
        )

        const wamdStarSparkleDist =
          points.wamdStarSparkleOrigin0.dist(points.wamdStarSparkleOrigin3) <
          points.wamdStarSparkleOrigin0.dist(points.wamdStarSparkleOrigin2)
            ? points.wamdStarSparkleOrigin0.dist(points.wamdStarSparkleOrigin3) / 3
            : points.wamdStarSparkleOrigin0.dist(points.wamdStarSparkleOrigin2) / 3

        for (let i = 0; i <= 5; i++) {
          for (let j = 0; j < 10; j++) {
            points['wamdStarSparklePoint' + i + j] = points['wamdStarSparkleOrigin' + i].shift(
              90 + 360 * (j / 10),
              wamdStarSparkleDist
            )
            paths['wamdStarSparkleLine' + i + j] = new Path()
              .move(points['wamdStarSparklePoint' + i + j])
              .line(points['wamdStarSparkleOrigin' + i])
          }
        }

        paths.wandStar = new Path()
          .move(points.wandTopLeft)
          .line(points.wandBottomLeft)
          .line(points.wandBottomRight)
          .line(points.wandTopRight)
          .move(points.wandTopAnchor)
          .line(points.wandStarCorner3)
          .line(points.wandStarTip1)
          .line(points.wandStarCorner4)
          .line(points.wandStarTip2)
          .line(points.wandStarAnchor)
          .line(points.wandStarTip3)
          .line(points.wandStarCorner1)
          .line(points.wandStarTip4)
          .line(points.wandStarCorner2)
          .line(points.wandTopAnchor)
          .close()

        break
    }

    return part
  },
}
