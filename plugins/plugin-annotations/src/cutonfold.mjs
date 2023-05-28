const markers = `
<marker orient="auto" refY="4.0" refX="0.0" id="cutonfoldFrom" style="overflow:visible;" markerWidth="12" markerHeight="8">
	<path class="note fill-note" d="M 0,4 L 12,0 C 10,2 10,6  12,8 z" />
</marker>
<marker orient="auto" refY="4.0" refX="12.0" id="cutonfoldTo" style="overflow:visible;" markerWidth="12" markerHeight="8">
	<path class="note fill-note" d="M 12,4 L 0,0 C 2,2 2,6  0,8 z" />
</marker>
`

// Export hooks
export const cutonfoldHooks = {
  preRender: [
    function (svg) {
      if (svg.defs.indexOf(markers) === -1) svg.defs += markers
    },
  ],
}
// Export macros
export const cutonfoldMacros = {
  cutonfold: function (
    so,
    { points, paths, Path, complete, setCutonfold, store, setGrain, scale }
  ) {
    let prefix
    if (so.id) {
      prefix = '_' + so.id
    } else {
      prefix = ''
    }
    const id = prefix + '_cutonfold'

    if (so === false) {
      for (const pointName in points) {
        if (pointName.match('_cutonfold')) delete points[pointName]
      }
      for (const pathName in paths) {
        if (pathName.match('_cutonfold')) delete paths[pathName]
      }
      // setCutonfold relies on plugin-cutlist
      if (typeof setCutonfold === 'function') {
        setCutonfold(false) // Restore default
      }
      return true
    }
    so = {
      offset: 15,
      margin: 5,
      detail: true,
      ...so,
    }
    if (typeof setCutonfold === 'function') {
      setCutonfold(so.from, so.to)
      if (so.grainline) store.cutlist.setGrain(so.from.angle(so.to))
    }
    if ((complete && so.detail) || !so.detail) {
      points[id + 'From'] = so.from.shiftFractionTowards(so.to, so.margin / 100)
      points[id + 'To'] = so.to.shiftFractionTowards(so.from, so.margin / 100)
      points[id + 'Via1'] = points[id + 'From']
        .shiftTowards(so.from, so.offset * scale)
        .rotate(-90, points[id + 'From'])
      points[id + 'Via2'] = points[id + 'To']
        .shiftTowards(so.to, so.offset * scale)
        .rotate(90, points[id + 'To'])
      const text = so.grainline ? 'cutOnFoldAndGrainline' : 'cutOnFold'
      paths[id + 'Cutonfold'] = new Path()
        .move(points[id + 'From'])
        .line(points[id + 'Via1'])
        .line(points[id + 'Via2'])
        .line(points[id + 'To'])
        .attr('class', 'note')
        .attr('marker-start', 'url(#cutonfoldFrom)')
        .attr('marker-end', 'url(#cutonfoldTo)')
        .attr('data-text', text)
        .attr('data-text-class', 'center fill-note')
    }
  },
}
