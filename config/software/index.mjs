import designsByType from './designs.json' assert { type: 'json' }
import packages from './packages.json' assert { type: 'json' }
import plugins from './plugins.json' assert { type: 'json' }
import sites from './sites.json' assert { type: 'json' }

// Helper method to construct summary objects
const unpack = (obj, folder) =>
  Object.fromEntries(
    Object.keys(obj).map((name) => [
      name,
      { name, folder, type: folder.slice(0, -1), description: obj[name] },
    ])
  )

// Helper method to construct summary objects for designs
const unpackDesigns = (obj, folder) =>
  Object.fromEntries(
    Object.keys(obj).map((name) => [
      name,
      { name, folder, type: folder.slice(0, -1), ...obj[name] },
    ])
  )

const designs = {
  ...designsByType.blocks,
  ...designsByType.bodices,
  ...designsByType.bottoms,
  ...designsByType.collars,
  ...designsByType.costumes,
  ...designsByType.dresses,
  ...designsByType.hats,
  ...designsByType.jackets,
  ...designsByType.jumpsuits,
  ...designsByType.pockets,
  ...designsByType.skirts,
  ...designsByType.sleeves,
  ...designsByType.swimwear,
  ...designsByType.tops,
  ...designsByType.waistbands,
  ...designsByType.undergarments,
  ...designsByType.utilities,
}

// Re-Export imported JSON
export { designs, designsByType, packages, plugins, sites }

// All software
export const software = {
  ...unpackDesigns(designs, 'designs'),
  ...unpack(plugins, 'plugins'),
  ...unpack(packages, 'packages'),
  ...unpack(sites, 'sites'),
}

// All software published on NPM
export const publishedSoftware = {
  ...unpackDesigns(designs, 'designs'),
  ...unpack(plugins, 'plugins'),
  ...unpack(packages, 'packages'),
}

export const publishedTypes = ['designs', 'packages', 'plugins']
export const types = [...publishedTypes, 'sites']
