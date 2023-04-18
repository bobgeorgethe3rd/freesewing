const markers = `
<marker id="sewTogetherStart" markerWidth="4" markerHeight="4" orient="auto" refX="0" refY="2">
  <path class="note stroke-sm" d="M4,4 L0,2 4,0" />
</marker>
<marker id="sewTogetherEnd" markerWidth="4" markerHeight="4" orient="auto" refX="4" refY="2">
  <path class="note stroke-sm" d="M0,0 L4,2 0,4" />
</marker>
<marker id="sewTogetherCross" markerWidth="4" markerHeight="4" orient="auto" refX="2" refY="2">
  <path d="M 0,0 L 4,4 M 4,0 L 0,4" class="note stroke-sm"/>
</marker>
`

// Export hooks
export const sewtogetherHooks = {
  preRender: [
    function (svg) {
      if (svg.defs.indexOf(markers) === -1) svg.defs += markers
    },
  ],
}

// Export macros
export const sewtogetherMacros = {
  sewTogether: function (so, { points, paths, Path, complete, sa }) {
    if (so === false) {
      for (const pointName in points) {
        if (pointName.match('sewtogether')) delete points[pointName]
      }
      for (const pathName in paths) {
        if (pathName.match('sewtogether')) delete paths[pathName]
      }
      return true
    }
    so = {
      ...so,
    }

    let prefix
    if (so.prefix) {
      prefix = so.prefix + '_sewtogether'
    } else {
      ;('sewtogether')
    }

    if (complete) {
      if (null == so.middle) {
        so.middle = so.from.shiftFractionTowards(so.to, 0.5)
      }
      points[prefix + 'From'] = so.from
      points[prefix + 'Middle'] = so.middle
      points[prefix + 'To'] = so.to

      points[prefix + 'FromCp'] = points[prefix + 'From'].shift(
        points[prefix + 'From'].angle(points[prefix + 'Middle']) + 90,
        points[prefix + 'From'].dist(points[prefix + 'Middle']) / 1.5
      )
      points[prefix + 'ToCp'] = points[prefix + 'To'].shift(
        points[prefix + 'To'].angle(points[prefix + 'Middle']) - 90,
        points[prefix + 'To'].dist(points[prefix + 'Middle']) / 1.5
      )

      if (so.hinge) {
        points[prefix + 'Hinge'] = points[prefix + 'Middle'].shift(
          points[prefix + 'Middle'].angle(points[prefix + 'To']) +
            Math.abs(
              points[prefix + 'Middle'].angle(points[prefix + 'From']) -
                points[prefix + 'Middle'].angle(points[prefix + 'To'])
            ) /
              2 +
            (sa ? 180 : 0),
          sa
            ? sa
            : Math.min(
                points[prefix + 'From'].dist(points[prefix + 'Middle']),
                points[prefix + 'From'].dist(points[prefix + 'Middle'])
              ) / 4
        )
        paths[prefix + 'SewTogetherHinge'] = new Path()
          .move(points[prefix + 'Middle'])
          .line(points[prefix + 'Hinge'])
          .attr('marker-start', 'url(#sewTogetherCross)')
          .attr('class', 'dotted note stroke-sm')
      }
      paths[prefix + 'SewTogether'] = new Path()
        .move(points[prefix + 'From'])
        .curve(points[prefix + 'FromCp'], points[prefix + 'ToCp'], points[prefix + 'To'])
        .attr('class', 'dotted note stroke-sm')
        .attr('marker-start', 'url(#sewTogetherStart)')
        .attr('marker-end', 'url(#sewTogetherEnd)')
        .attr('data-text', 'sewTogether')
        .attr('data-text-class', 'center fill-note text-xs')
    }
  },
}
