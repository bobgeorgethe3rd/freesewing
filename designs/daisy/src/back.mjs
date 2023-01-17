import { back as backBella } from '@freesewing/bella'

export const back = {
  name: 'back',
  from: backBella,
  hideDependencies: true,
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
  }) => {
    return part
  },
}
