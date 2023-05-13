import { logoTGSPlugin } from '@freesewing/plugin-logotgs'
import { base } from './base.mjs'

const pluginLogoTGS = ({ points, Point, paths, options, macro, part, store }) => {
  if (['logotgs', 'all'].indexOf(options.plugin) !== -1) {
    points.centre = new Point(0, 0)
    macro('logotgs', {
      at: points.centre,
      scale: options.logoTGSScale,
      rotation: options.logoTGSRotate,
    })
    macro('bannerbox', {
      topLeft: paths.logoTGSOuter.bbox().topLeft,
      bottomRight: paths.logoTGSOuter.bbox().bottomRight,
      text: 'macro = logotgs',
      ...store.get('bannerbox.macro'),
    })
  }
  return part
}

export const logotgs = {
  name: 'plugintest.logotgs',
  plugins: logoTGSPlugin,
  options: {
    logoTGSScale: { pct: 100, min: 10, max: 300, menu: 'logotgs' },
    logoTGSRotate: { deg: 0, min: -360, max: 360, menu: 'logotgs' },
  },
  after: base,
  draft: pluginLogoTGS,
}
