const markers = `
<marker orient="auto" refY="4.0" refX="0.0" id="grainlineFrom" style="overflow:visible;" markerWidth="12" markerHeight="8">
	<path class="note fill-note" d="M 0,4 L 12,0 C 10,2 10,6  12,8 z" />
</marker>
<marker orient="auto" refY="4.0" refX="12.0" id="grainlineTo" style="overflow:visible;" markerWidth="12" markerHeight="8">
	<path class="note fill-note" d="M 12,4 L 0,0 C 2,2 2,6  0,8 z" />
</marker>`

const dflts = { text: 'grainline' }

// Export hooks and macros
export const grainlineHooks = {
  preRender: [
    function (svg) {
      if (svg.defs.indexOf(markers) === -1) svg.defs += markers
    },
  ],
}

export const grainlineMacros = {
  grainline: function (so = {}, { points, paths, Path, complete, setGrain }) {
    let prefix
    if (so.id) {
      prefix = '_' + so.id
    } else {
      prefix = ''
    }

    const id = prefix + '_grainline'

    if (so === false) {
      for (const pointName in points) {
        if (pointName.match('_grainline')) delete points[pointName]
      }
      for (const pathName in paths) {
        if (pathName.match('_grainline')) delete paths[pathName]
      }
      setGrain(90) // Restoring default
      return true
    }
    so = {
      ...dflts,
      ...so,
    }
    // setGrain relies on plugin-cutlist
    if (typeof setGrain === 'function') {
      setGrain(so.from.angle(so.to))
    }
    if (complete) {
      points[id + 'From'] = so.from.shiftFractionTowards(so.to, 0.05)
      points[id + 'To'] = so.to.shiftFractionTowards(so.from, 0.05)
      paths[id] = new Path()
        .move(points[id + 'From'])
        .line(points[id + 'To'])
        .attr('class', 'note')
        .attr('marker-start', 'url(#grainlineFrom)')
        .attr('marker-end', 'url(#grainlineTo)')
        .attr('data-text', so.text)
        .attr('data-text-class', 'center fill-note')
    }
  },
}
