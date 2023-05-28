const titleMacro = function (so, { points, scale, locale, store, complete }) {
  let prefix
  if (so.id) {
    prefix = '_' + so.id
  } else {
    prefix = ''
  }

  const id = prefix + '_title'

  // Passing `false` will remove the title
  if (so === false) {
    for (const pointName in points) {
      if (pointName.match('_title')) delete points[pointName]
    }
    return true
  }

  const transform = function (anchor) {
    const cx = anchor.x - so.scale * anchor.x
    const cy = anchor.y - so.scale * anchor.y

    return `matrix(${so.scale}, 0, 0, ${so.scale}, ${cx}, ${cy}) rotate(${so.rotation} ${anchor.x} ${anchor.y})`
  }
  const defaults = {
    scale: 1,
    rotation: 0,
    detail: true,
  }

  so = { ...defaults, ...so }
  if ((complete && so.detail) || !so.detail) {
    so.scale = so.scale * scale
    let overwrite = true
    if (so.append) overwrite = false
    points[id + 'Nr'] = so.at
      .clone()
      .attr('data-text', so.nr, overwrite)
      .attr('data-text-class', 'text-4xl fill-note font-bold')
      .attr('data-text-transform', transform(so.at))
    let shift = 8
    if (so.title) {
      points[id + 'Name'] = so.at
        .shift(-90 - so.rotation, shift * so.scale)
        .attr('data-text', so.title)
        .attr('data-text-class', 'text-lg fill-current font-bold')
        .attr('data-text-transform', transform(so.at.shift(-90 - so.rotation, 13 * so.scale)))
      shift += 8
    }
    let name = store.data?.name || 'No Name'
    name = name.replace('@freesewing/', '')
    points[id + 'Pattern'] = so.at
      .shift(-90 - so.rotation, shift * so.scale)
      .attr('data-text', name)
      .attr('data-text', 'v' + (store.data?.version || 'No Version'))
      .attr('data-text-class', 'fill-note')
      .attr('data-text-transform', transform(so.at.shift(-90 - so.rotation, shift * so.scale)))
    if (store.data.for) {
      shift += 8
      points[id + 'For'] = so.at
        .shift(-90 - so.rotation, shift * so.scale)
        .attr('data-text', '( ' + store.data.for + ' )')
        .attr('data-text-class', 'fill-current font-bold')
        .attr('data-text-transform', transform(so.at.shift(-90 - so.rotation, shift * so.scale)))
    }
    shift += 6
    const now = new Date()
    let hours = now.getHours()
    let mins = now.getMinutes()
    if (hours < 10) hours = `0${hours}`
    if (mins < 10) mins = `0${mins}`
    points[id + 'ExportDate'] = so.at
      .shift(-90 - so.rotation, shift * so.scale)
      .attr(
        'data-text',
        now.toLocaleDateString(locale || 'en', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      )
      .attr('data-text', `@ ${hours}:${mins}`)
      .attr('data-text-class', 'text-sm')
      .attr('data-text-transform', transform(so.at.shift(-90 - so.rotation, shift * so.scale)))
  }
}

// Export macros
export const titleMacros = { title: titleMacro }
