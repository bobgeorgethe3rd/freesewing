export const apBase = (
  part,
  appliqueNumber,
  appliqueLength,
  appliqueIncrement,
  appliqueSa = false
) => {
  const { Point, points } = part.shorthand()

  points.origin0 = new Point(0, 0)

  let j
  for (let i = 0; i < appliqueNumber - 1; i++) {
    j = i + 1
    points['origin' + j] = points['origin' + i].shift(
      0,
      appliqueLength * 1.5 + appliqueIncrement * j + appliqueSa * 0.5
    )
  }
}
