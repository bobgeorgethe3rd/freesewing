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
  cutonfold: function (so, { points, paths, Path, complete, setCutOnFold, setGrain, scale }) {
    if (so === false) {
      for (const pointName in points) {
        if (pointName.match('cutonfold')) delete points[pointName]
      }
      for (const pathName in paths) {
        if (pathName.match('cutonfold')) delete paths[pathName]
      }
      // setCutOnFold relies on plugin-cutlist
      if (typeof setCutOnFold === 'function') {
        setCutOnFold(false) // Restore default
      }
      return true
    }
    so = {
      offset: 15,
      margin: 5,
      ...so,
    }
    let prefix
    if (so.prefix) {
      prefix = so.prefix + '_cutonfold'
    } else {
      prefix = 'cutonfold'
    }

    if (typeof setCutOnFold === 'function') {
      setCutOnFold(so.from, so.to)
      if (so.grainline) setGrain(so.from.angle(so.to))
    }
    if (complete) {
      points[prefix + 'From'] = so.from.shiftFractionTowards(so.to, so.margin / 100)
      points[prefix + 'To'] = so.to.shiftFractionTowards(so.from, so.margin / 100)
      points[prefix + 'Via1'] = points[prefix + 'From']
        .shiftTowards(so.from, so.offset * scale)
        .rotate(-90, points[prefix + 'From'])
      points[prefix + 'Via2'] = points[prefix + 'To']
        .shiftTowards(so.to, so.offset * scale)
        .rotate(90, points[prefix + 'To'])
      const text = so.grainline ? 'cutOnFoldAndGrainline' : 'cutOnFold'
      paths[prefix + 'Cutonfold'] = new Path()
        .move(points[prefix + 'From'])
        .line(points[prefix + 'Via1'])
        .line(points[prefix + 'Via2'])
        .line(points[prefix + 'To'])
        .attr('class', 'note')
        .attr('marker-start', 'url(#cutonfoldFrom)')
        .attr('marker-end', 'url(#cutonfoldTo)')
        .attr('data-text', text)
        .attr('data-text-class', 'center fill-note')
    }
  },
}
