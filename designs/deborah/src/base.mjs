import { base as waystoneBase } from '@freesewing/waystone'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const base = {
  name: 'deborah.base',
  from: waystoneBase,
  hideDependencies: true,
  options: {},
  plugins: [pluginBundle],
  draft: draftBase,
}

function draftBase({
  options,
  Point,
  Path,
  points,
  paths,
  Snippet,
  snippets,
  complete,
  sa,
  paperless,
  macro,
  part,
  measurements,
  utils,
}) {
  // Complete?
  if (complete) {
    if (sa) {
    }
  }

  // Paperless?
  if (paperless) {
  }

  return part
}
