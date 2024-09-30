const titleMacro = function (so, { points, part, utils, measurements, scale, locale, store }) {
  const prefix = (so.prefix || '') + '_title'

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

  let measurementCount = 1
  for (const measurementName in measurements) {
    if (measurementName == 'chest') {
      measurementCount *= 5
    }
    if (measurementName == 'waist') {
      measurementCount *= 7
    }
    if (measurementName == 'hips') {
      measurementCount *= 9
    }
    if (measurementName == 'seat') {
      measurementCount *= 11
    }
  }

  let measurementName
  if (measurementCount == 1) {
    for (const measurementsName in measurements) {
      if (measurementsName) {
        measurementName = measurementsName
        break
      } else {
        measurementName = false
      }
    }
  } else {
    if (measurementCount % 5 === 0) {
      measurementName = 'chest'
    } else {
      if (measurementCount % 7 === 0) {
        measurementName = 'waist'
      } else {
        if (measurementCount % 9 === 0) {
          measurementName = 'hips'
        } else {
          measurementName = 'seat'
        }
      }
    }
  }

  const defaults = {
    scale: 1,
    rotation: 0,
    cutNr: 'NaN',
    measurement: measurementName,
    onFold: true,
  }

  so = { ...defaults, ...so }
  so.scale = so.scale * scale
  let overwrite = true
  if (so.append) overwrite = false
  points[prefix + '_titleNr'] = so.at
    .clone()
    .attr('data-text', so.nr, overwrite)
    .attr('data-text-class', 'text-4xl fill-note font-bold')
    .attr('data-text-transform', transform(so.at))
  let shift = 8
  const designNumber = store.data?.number || '0000'
  points[prefix + '_titleDesign'] = so.at
    .shift(-90 - so.rotation, shift * so.scale)
    .attr('data-text', utils.capitalize(store.data?.name.replace('@freesewing/', '')))
    .attr('data-text', ' #' + designNumber)
    .attr('data-text-class', 'text-lg fill-current font-bold')
    .attr('data-text-transform', transform(so.at.shift(-90 - so.rotation, 13 * so.scale)))
  shift += 15
  if (so.title) {
    points[prefix + '_titleName'] = so.at
      .shift(-90 - so.rotation, shift * so.scale)
      .attr('data-text', so.title)
      .attr('data-text-class', 'text-lg fill-current font-bold')
      .attr('data-text-transform', transform(so.at.shift(-90 - so.rotation, shift * so.scale)))
  }

  if (so.cutNr) {
    shift += 13
    points[prefix + '_titleCut'] = so.at
      .shift(-90 - so.rotation, shift * so.scale)
      .attr('data-text', 'Cut ' + so.cutNr)
      .attr('data-text-class', 'text-lg fill-current font-bold')
      .attr('data-text-transform', transform(so.at.shift(-90 - so.rotation, shift * so.scale)))
    for (const pointName in points) {
      if (pointName.match('_cutonfold') && so.onFold) {
        points[prefix + '_titleCut'].attr('data-text', ' on fold')
        break
      }
    }
  }
  if (so.measurement) {
    shift += 13
    points[prefix + '_titleMeasurement'] = so.at
      .shift(-90 - so.rotation, shift * so.scale)
      .attr(
        'data-text',
        utils.capitalize(so.measurement) + ': ' + utils.units(measurements[so.measurement])
      )
      .attr('data-text-class', 'text-lg fill-current font-bold')
      .attr('data-text-transform', transform(so.at.shift(-90 - so.rotation, shift * so.scale)))
  }

  if (store.data.for) {
    shift += 8
    points[prefix + '_titleFor'] = so.at
      .shift(-90 - so.rotation, shift * so.scale)
      .attr('data-text', '( ' + store.data.for + ' )')
      .attr('data-text-class', 'fill-current font-bold')
      .attr('data-text-transform', transform(so.at.shift(-90 - so.rotation, shift * so.scale)))
  }

  shift += 8
  points[prefix + '_titleVersion'] = so.at
    .shift(-90 - so.rotation, shift * so.scale)
    .attr('data-text', 'v' + (store.data?.version || 'No Version'))
    .attr('data-text-class', 'fill-note')
    .attr('data-text-transform', transform(so.at.shift(-90 - so.rotation, shift * so.scale)))

  shift += 6
  const now = new Date()
  let hours = now.getHours()
  let mins = now.getMinutes()
  if (hours < 10) hours = `0${hours}`
  if (mins < 10) mins = `0${mins}`
  points[prefix + 'ExportDate'] = so.at
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

// Export macros
export const titleMacros = { title: titleMacro }
