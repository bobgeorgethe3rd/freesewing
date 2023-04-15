# Change log for: FreeSewing (global)


## Unreleased

### global

#### Removed

 - The `@freesewing/components` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported.
 - The `@freesewing/css-theme` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported.
 - The `@freesewing/config-helpers` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported. Use the `@freesewing/snapseries` package for various helpers for snapped percentage options. The `pctBasedOn` helper method is now available as a named export from `@freesewing/core`
 - The `@freesewing/i18n` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported.
 - The `@freesewing/mui-theme` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported.
 - The `@freesewing/pattern-info` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported.
 - The `@freesewing/plugin-export-dxf` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported.
 - The `@freesewing/snapseries` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported.
 - The `@freesewing/utils` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported.
 - The `gatsby-remark-jargon` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported.
 - The `remark-jargon` package is not part of FreeSewing v3. While v2 versions remain available, this package is no longer supported. Use `rehype-jargon` instead.

<<<<<<< HEAD
### plugin-banner

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-bartack

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns
=======
### albert

#### Fixed

 - Workaround for not finding a suitable legband radius

### unice

#### Added

 - Added new Front Curve and Back Curve style options

#### Changed

 - Updated gusset to always curve inward

#### Fixed

 - Fixed bug which prevented parts from being generated as intended

### waralee

#### Added

 - Added *mini* version of main pants part
 - Added new pocket options
 - Added seperate waistband options
 - Added bow tie placement option

#### Fixed

 - Fixed crotch depth issue
 - Fixed pocket size issue
 - Fixed waist shaping issue
>>>>>>> 73b2c4821cc57dfa7c8ca0667ae53a7959135575

### plugin-bundle

#### Removed

 - Named exports of the bundled plugins are no longer available

### plugin-bust

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-flip

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-gore

#### Breaking

 - The `goreNumber` props is removed. Please use `gores` instead

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-i18n

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-measurements

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-mirror

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-round

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-sprinkle

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-svgattr

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-theme

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### plugin-versionfree-svg

#### Removed

 - This plugin no longer sets its version as an SVG attribute when rendering patterns

### snapseries

#### Breaking

 - Named export `smallsteps` has been renamed to `smallSteps`
 - Named export `bigsteps` has been renamed to `bigSteps`


## 2.22.0 (2022-08-23)

<<<<<<< HEAD
### plugin-title

#### Added

 - Added support for removing the title via a macro call
 - Added a render timestamp to the title
=======
### octoplushy

#### Added

 - Octoplushy is a new design for an octopus or squid plushy

### bent

#### Added

 - Support drafting for high bust

### breanna

#### Fixed

 - Fixed bug where a large shoulder slope could cause an error. Fixes [#2516](https://github.com/freesewing/freesewing/issues/2516)

### brian

#### Added

 - Support drafting for high bust

#### Fixed

 - Make s3 options sticky to zero below 10% to avoid path split issues. Fixes [#2249](https://github.com/freesewing/freesewing/issues/2249)

### titan

#### Added

 - Added additional notches to aid alignment

### aaron

#### Added

 - Support drafting for high bust

### carlton

#### Added

 - Support drafting for high bust

### cathrin

#### Fixed

 - Removed seam allowance from Part1a foldline. Fixes [#2545](https://github.com/freesewing/freesewing/issues/2545)

### charlie

#### Changed

 - Renamed back pocket jet to back pocket welt

### diana

#### Added

 - Support drafting for high bust

### huey

#### Added

 - Support drafting for high bust

### hugo

#### Added

 - Support drafting for high bust Closes [#802](https://github.com/freesewing/freesewing/issues/802)

### paco

#### Changed

 - Fix hem allowance. Closes [#2350](https://github.com/freesewing/freesewing/issues/2350)

#### Fixed

 - Make hem allowance taper outwards to match the leg Fixes [#2350](https://github.com/freesewing/freesewing/issues/2350)

### simon

#### Added

 - Support drafting for high bust

#### Fixed

 - Fix issue with boxPleat and yoke Fixes [#2400](https://github.com/freesewing/freesewing/issues/2400)
 - Removed superfluous notches in button placket, buttonhole placket, and split yoke. Fixes [#2399](https://github.com/freesewing/freesewing/issues/2399)

### simone

#### Added

 - Added Bust-aligned buttons option and functionality. Closes [#2154] (https://github.com/freesewing/freesewing/issues/2154)
 - Added a notch at the center front bustline.

#### Fixed

 - Don't do a negative FBA from there's no need for an FBA Fixes [#2121](https://github.com/freesewing/freesewing/issues/2121)
 - Duplicate config rather than mutating the imported simon config

### sven

#### Added

 - Support drafting for high bust

### tamiko

#### Added

 - Support drafting for high bust

### teagan

#### Added

 - Support drafting for high bust

### wahid

#### Added

 - Support drafting for high bust

#### Fixed

 - Prevent facing/lining overlap when shoulders get very narrow fixes [#2233](https://github.com/freesewing/freesewing/issues/2233)
 - Fixed dependency issue with pocketFacing part
 - Added grainlines

### yuri

#### Added

 - Support drafting for high bust
>>>>>>> 73b2c4821cc57dfa7c8ca0667ae53a7959135575


## 2.21.3 (2022-07-02)

### core

#### Changed

 - Make generatePartTransform a named export

### new-design

#### Changed

 - We're now loading content from the main branch by default

#### Fixed

 - Add bin entry to package.json


## 2.21.2 (2022-06-30)


## 2.21.1 (2022-06-28)


## 2.21.0 (2022-06-27)

### examples

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### legend

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugintest

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### rendertest

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### tutorial

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-bundle

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-bust

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-flip

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-gore

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-i18n

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-measurements

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-mirror

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-round

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-sprinkle

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-svgattr

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-theme

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### plugin-versionfree-svg

#### Changed

 - Migrated from Rollup to Esbuild for all builds

### core

#### Changed

 - Migrated from Rollup to Esbuild for all builds
 - The `pctBasedOn()` helper method for pattern config was moved to config-helpers We did not make this a breaking change since it's only used internally.

### i18n

#### Changed

 - Migrated from Rollup to Esbuild for all builds

#### Fixed

 - Added missing lab namespace for English

### models

#### Changed

 - Migrated from Rollup to Esbuild for all builds


## 2.20.8 (2022-05-21)

### core

#### Fixed

 - Fixed warning message when moving to a non-existing point
 - Fixed incorrect decision in Path.boundary()


## 2.20.7 (2022-02-20)


## 2.20.6 (2022-02-17)


## 2.20.5 (2022-02-17)

### core

#### Fixed

 - Fix bug in Svg.escapeText() that only escaped the first quote

### backend

#### Fixed

 - Mitigate risk of denial-of-service attacks in catch-all route


## 2.20.4 (2022-01-28)


## 2.20.3 (2022-01-28)

### core

#### Changed

 - Setting Path.render() no longer raises an info message
 - Always raise debug, but only store it whend debug is enabled


## 2.20.2 (2022-01-27)

### i18n

#### Fixed

 - Patterns options were always in English due to symlinks being used


## 2.20.1 (2022-01-27)


## 2.20.0 (2022-01-24)

### examples

#### Added

 - Added plugin_gore example

#### Changed

 - Switched to default import for version from package.json

### legend

#### Changed

 - Switched to default import for version from package.json

### plugintest

#### Added

 - Added the plugintest pattern which is used for testing plugins

#### Changed

 - Switched to default import for version from package.json

### rendertest

#### Changed

 - Restructured the pattern to allow inclusion of individual parts in Example component
 - Switched to default import for version from package.json

### tutorial

#### Changed

 - Switched to default import for version from package.json

### plugin-bundle

#### Changed

 - plugin-banner is now part of plugin-bundle
 - plugin-bartack is now part of plugin-bundle

### plugin-flip

#### Added

 - Added support for flipping around the Y-axis

### plugin-gore

#### Changed

 - The `goreNumber` property of the gore macro has been renamed to `gores`
 - Using `goreNumber` is now deprecated in favor of `gore` and will be removed in the next majot version

### plugin-sprinkle

#### Added

 - Added support for `scale` to scale all sprinkled snippets
 - Added support for `rotate` to rotate all sprinkled snippets

### core

#### Added

 - Added support for `settings.scale`

### i18n

#### Fixed

 - Fixed issue that was causing plugin translations to always be in English


## 2.19.9 (2022-01-09)


## 2.19.8 (2022-01-08)

### core

#### Fixed

 - Remove CSS var in SVG to preserve styling Fixes [#1606](https://github.com/freesewing/freesewing/issues/1606)


## 2.19.7 (2022-01-06)


## 2.19.6 (2021-12-29)

### rendertest

#### Changed

 - Updated the rendertest pattern to be more concise

### plugin-bundle

#### Added

 - Added (esm) unit tests

### plugin-bust

#### Added

 - Added (esm) unit tests

### plugin-flip

#### Added

 - Added (esm) unit tests

### plugin-gore

#### Added

 - Added (esm) unit tests

### plugin-i18n

#### Added

 - Added (esm) unit tests

### plugin-measurements

#### Added

 - Added (esm) unit tests

### plugin-mirror

#### Added

 - Added (esm) unit tests

### plugin-round

#### Added

 - Added (esm) unit tests

### plugin-sprinkle

#### Added

 - Added (esm) unit tests

### plugin-svgattr

#### Added

 - Added (esm) unit tests

### plugin-theme

#### Added

 - Added (esm) unit tests

### plugin-versionfree-svg

#### Added

 - Added (esm) unit tests

### core

#### Added

 - Added the new attributes.setIfUnset() method
 - Added the new `scale` setting


## 2.19.5 (2021-11-13)

### core

#### Fixed

 - Fixed a copy-paste error that caused the `absoluteOptions` shorthand property to be a proxy for the regular options object instead. Note that this bug (and proxying in general) only occurs in debug mode.


## 2.19.4 (2021-11-09)


## 2.19.3 (2021-11-05)


## 2.19.2 (2021-11-02)


## 2.19.1 (2021-10-23)


## 2.19.0 (2021-10-17)

### plugin-versionfree-svg

#### Added

 - This is a plugin to strip (FreeSewing) versdion info out of the SVG to allow you to diff your SVG output between FreeSewing versions
 - Initial release

### core

#### Added

 - Added support for snapped percentage options See https://github.com/freesewing/freesewing/discussions/1331

#### Changed

 - Pattern.on() is now chainable as it returns the Pattern object

### i18n

#### Fixed

 - Fixed bug in resolving of shared pattern options
 - Removed optional chaining which broke node v12 support

### snapseries

#### Added

 - Initial release of `@freesewing/snapseries` wich holds commonly used series of snap values for percentage options


## 2.18.0 (2021-09-09)

### core

#### Fixed

 - Handle path.offset() of very short curves with control points on the start or end point Closes [#1257](https://github.com/freesewing/freesewing/issues/1257)

### i18n

#### Added

 - Added translations for Yuri

#### Fixed

 - Added optional chaining so missing options always lead to clear error message


## 2.17.4 (2021-08-20)


## 2.17.3 (2021-08-16)

### i18n

#### Added

 - New translations


## 2.17.2 (2021-08-15)

### i18n

#### Added

 - Added new ffsa option for simon & simone

### models

#### Added

 - Added the new `bustPointToUnderbust` measurement for future bikini pattern


## 2.17.1 (2021-07-14)

### core

#### Fixed

 - Fixed edge case in utils.beamsIntersect() when line is almost vertical See [#1206](https://github.com/freesewing/freesewing/issues/1206)


## 2.17.0 (2021-07-01)

### tutorial

#### Fixed

 - Set department in the config to one of the newly accepted values

### plugin-bundle

#### Changed

 - Include plugin-buttons
 - Include plugin-mirror

### plugin-mirror

#### Changed

 - Is now included in plugin-bundle

### core

#### Fixed

 - Fix a bug in `path.shiftAlong` where no point is returned if the distance to shift is a fraction of one step (1/25mm) into a new path segment See [#1140](https://github.com/freesewing/freesewing/issues/1140)

### i18n

#### Changed

 - Changed antman references to antperson


## 2.16.2 (2021-05-05)

### i18n

#### Changed

 - String updates


## 2.16.1 (2021-05-30)

### i18n

#### Added

 - New translations for pattern filter


## 2.16.0 (2021-05-24)

### i18n

#### Changed

 - Changes to cfp strings


## 2.15.4 (2021-05-08)


## 2.15.3 (2021-05-05)


## 2.15.2 (2021-04-28)

### core

#### Fixed

 - Path.shiftAlong takes now an optional second paramter to control the number of steps the path will be divided in per Mm (if it's a curve) default is 25 See [#976](https://github.com/freesewing/freesewing/issues/976)


## 2.15.1 (2021-04-24)

### core

#### Fixed

 - Fixed bug in the dependency resolved when dependecies are passed as a string See [#971](https://github.com/freesewing/freesewing/issues/971)


## 2.15.0 (2021-04-15)

### examples

#### Added

 - Added examples for bartack plugin
 - Added examples for new buttonhole-start/end snippets

### plugin-theme

#### Added

 - Added the path.bartack class

### core

#### Added

 - The part.getId() method now takes an optional prefix argument

#### Changed

 - Don't round coordinates internally to avoid path.split misses

### i18n

#### Added

 - Added translation for new Titan options
 - Added translations for Charlie


## 2.14.0 (2021-03-07)

### i18n

#### Added

 - Added translations for Cornelius


## 2.13.2 (2021-02-21)


## 2.13.1 (2021-02-14)


## 2.13.0 (2021-02-13)

### i18n

#### Added

 - Translation for Hortensia


## 2.12.1 (2021-01-27)


## 2.12.0 (2021-01-19)


## 2.11.3 (2021-01-16)

<<<<<<< HEAD
### plugin-scalebox

#### Added

 - Now includes the miniscale macro

#### Changed

 - Took my name off the patterns
=======
### albert

#### Fixed

 - Added missing scalebox

### florence

#### Fixed

 - Added missing scalebox

### florent

#### Fixed

 - Added missing scalebox

### holmes

#### Fixed

 - Added missing scalebox

### bent

#### Fixed

 - Added missing scalebox

### bruce

#### Fixed

 - Added missing scalebox

### huey

#### Fixed

 - Added missing scalebox
 - Added cut-on-fold indicator to pocket
 - Removed lingering notch from pocket part

### hugo

#### Fixed

 - Removed inherited notches

### jaeger

#### Fixed

 - Added missing scalebox

### shin

#### Fixed

 - Added missing scalebox

### simon

#### Fixed

 - Cleaned up notches
 - Marked where to match fabric on closure

### simone

#### Fixed

 - Cleaned up notches

### wahid

#### Fixed

 - Added missing scalebox
 - Proper styling for SA on front and back

### waralee

#### Fixed

 - Added missing scalebox
>>>>>>> 73b2c4821cc57dfa7c8ca0667ae53a7959135575


## 2.11.2 (2021-01-11)


## 2.11.1 (2021-01-11)


## 2.11.0 (2021-01-10)

<<<<<<< HEAD
### plugin-notches

#### Added

 - Initial release. See [#757](https://github.com/freesewing/freesewing/issues/757)
=======
### shin

#### Fixed

 - Removed unused lengthBonus option
>>>>>>> 73b2c4821cc57dfa7c8ca0667ae53a7959135575

### i18n

#### Changed

 - New strings for new features

#### Fixed

 - Type in Simon title


## 2.10.7 (2020-11-18)


## 2.10.6 (2020-11-15)


## 2.10.5 (2020-11-14)

### i18n

#### Fixed

 - Added missing `cty.` translations to non-English language files


## 2.10.4 (2020-11-13)


## 2.10.3 (2020-11-08)

### core

#### Changed

 - Renderprops now includes SVG with preRender hook applied


## 2.10.2 (2020-11-07)

### core

#### Fixed

 - Fixed bundled bezier-js version


## 2.10.1 (2020-11-07)

### core

#### Changed

 - Switched to bezier-js v3


## 2.10.0 (2020-10-17)


## 2.9.0 (2020-10-02)

<<<<<<< HEAD
### plugin-dimension

#### Added

 - Added support for passing in the ID used to add paths to the part
 - Added the `rmd` macro that removes dimensions

### plugin-title

#### Added

 - Added support for cutting instructions. Closes [#500](https://github.com/freesewing/freesewing/issues/500)
=======
### teagan

#### Added

 - Teagan is a T-shirt pattern
>>>>>>> 73b2c4821cc57dfa7c8ca0667ae53a7959135575

### core

#### Added

 - Parts not get a `name` property set that hold their (own) name/id
 - Added the `info` type to raised events
 - Added support for conditional loading of plugins

### i18n

#### Added

 - Added translations for plugin-title
 - Added translations for teagan
 - Added some translations for the UI

#### Fixed

 - Replaced a few identical files with symlinks


## 2.8.1 (2020-08-16)


## 2.8.0 (2020-08-10)

### core

#### Fixed

 - Fix an edge case in utils.pointOnCurve for perfect horizontal curves


## 2.7.2 (2020-07-29)

### core

#### Fixed

 - Fixed wrong return value in debug message from Path


## 2.7.1 (2020-07-24)

### core

#### Added

 - Added new debug functionality through the use of the `raise.debug`
 - Added a new `debug` setting
 - Shorthand now proxies objects to allow debug and raise


## 2.7.0 (2020-07-12)

### legend

#### Added

 - A pattern to document the markings on our patterns
 - Initial release

### tutorial

#### Changed

 - Removed `Circumference` suffix from measurement names

### plugin-bust

#### Changed

 - Removed `Circumference` suffix from measurement names

### plugin-measurements

#### Added

 - A FreeSewing plugin that adds measurements that can be calculated based on existing measurements

### plugin-mirror

#### Added

 - A FreeSewing plugin for mirroring points or paths
 - Initial release

### core

#### Added

 - Added support for injecting custom (path) styles when sampling. Closes [#380](https://github.com/freesewing/freesewing/issues/380)
 - Added support for custom sample styles
 - Added support for raising events via `raise.[type]()` method

#### Fixed

 - [Properly escape quotes in imperial units](https://github.com/freesewing/freesewing/issues/437)

### i18n

#### Changed

 - Added translations for Titan
 - Removed `Circumference` suffix from measurement names

### models

#### Changed

 - Models now come with the new measurements. See [#416](https://github.com/freesewing/freesewing/issues/416)
 - Ported models to the crotchDepth measurement. See [#425](https://github.com/freesewing/freesewing/issues/425)
 - Removed `Circumference` suffix from measurement names


## 2.6.0 (2020-05-01)

### core

#### Changed

 - utils now includes `Bezier` which holds the bezier-js library so you don't need to re-import it
 - We no longer set the plugin configuration/data object to fall in `pattern.use()`

### i18n

#### Changed

 - Changes to support the renaming of @freesewing/fu to @freesewing/florence


## 2.5.0 (2020-04-05)

### i18n

#### Added

 - title, description, and options for Dianna


## 2.4.6 (2020-03-23)

### i18n

#### Fixed

 - Fixed an bug in the i18n package


## 2.4.5 (2020-03-19)


## 2.4.4 (2020-03-15)

<<<<<<< HEAD
### plugin-dimension

#### Changed

 - Don't escape inch symbol in text. Instead let Svg.escapeText() handle it at render time
=======
### huey

#### Fixed

 - The `sleevecapBackFactorY` and `sleevecapFrontFactorY` options had a minimum above the default

### simon

#### Fixed

 - The `sleevecapBackFactorY` and `sleevecapFrontFactorY` options had a minimum above the default

### simone

#### Fixed

 - The `sleevecapBackFactorY` and `sleevecapFrontFactorY` options had a minimum above the default

### sven

#### Fixed

 - The `sleevecapBackFactorY` and `sleevecapFrontFactorY` options had a minimum above the default
>>>>>>> 73b2c4821cc57dfa7c8ca0667ae53a7959135575

### core

#### Fixed

 - New Svg.escapeText() method to escape text at render time, rather than at draft time This fixes the difference in the inch symbol is displayed in the React component or rendered SVG


## 2.4.3 (2020-03-12)

### i18n

#### Added

 - Added more translations


## 2.4.2 (2020-03-08)

### i18n

#### Added

 - Added more strings


## 2.4.1 (2020-03-04)


## 2.4.0 (2020-02-29)


## 2.3.0 (2020-02-23)

### plugin-gore

#### Added

 - A plugin to generate gores for semi-spheres or domes
 - Initial release


## 2.2.0 (2020-02-22)

### core

#### Added

 - Added the `Path.noop()` method
 - Added the `Path.insop()` methods

### i18n

#### Added

 - Added translations for Breanna

#### Changed

 - Added/Updated strings for the 2.2 frontend changes
 - Changed `Joost De Cock` to `Joost` because spam filters don't like cock

#### Removed

 - Removed the files for homepage translation, and moved that content to markdown
 - Removed the files for editor translation, as it is no longer used

### models

#### Changed

 - Extended the menswear size range to have 10 different sizes, just like womenswear


## 2.1.9 (2020-01-18)

### core

#### Fixed

 - [#19](https://github.com/freesewing/freesewing/issues/19): Path offset issue is now fixed in upstream bezier-js@2.4.6


## 2.1.8 (2019-12-16)


## 2.1.7 (2019-12-15)


## 2.1.6 (2019-11-24)


## 2.1.5 (2019-11-19)


## 2.1.4 (2019-11-01)


## 2.1.3 (2019-10-18)

### i18n

#### Added

 - More translated strings


## 2.1.2 (2019-10-14)

### i18n

#### Fixed

 - Fixed issue where symlinks were causing all languages to export English strings


## 2.1.1 (2019-10-13)


## 2.1.0 (2019-10-06)

### core

#### Changed

 - The pattern super constructor now sets a `config` property that holds the pattern configuration. This means that unlike before, there is no need to instantiate a pattern to access its config. You can just import the pattern, and it's config property will contain the pattern config.

### i18n

#### Added

 - Added translations for Penelope, Waralee, and Simone


## 2.0.4 (2019-09-27)


## 2.0.3 (2019-09-15)


## 2.0.2 (2019-09-06)

### i18n

#### Added

 - [#90](https://github.com/freesewing/freesewing/issues/90): Added missing option translations for Benjamin, Florent, Sandy, Shin, and Theo


## 2.0.1 (2019-09-01)

### models

#### Added

 - Expanded the size ranges available.
 - Added the `withBreasts` models which were missing in earlier releases.

#### Changed

 - The models data is now based on the data from the `neckstimate` method in the utils package.

#### Fixed

 - [#86](https://github.com/freesewing/freesewing/issues/86): The `seatCircumference` measurement was missing, thus making it unavailable on the website


## 2.0.0 (2019-08-25)

### examples

#### Added

 - Initial release

### rendertest

#### Added

 - Initial release

### tutorial

#### Added

 - Initial release

### plugin-bundle

#### Added

 - Initial release

### plugin-bust

#### Added

 - Initial release

### plugin-flip

#### Added

 - Initial release

### plugin-i18n

#### Added

 - Initial release

### plugin-round

#### Added

 - Initial release

### plugin-sprinkle

#### Added

 - Initial release

### plugin-svgattr

#### Added

 - Initial release

### plugin-theme

#### Added

 - Initial release

### core

#### Added

 - Initial release

### i18n

#### Added

 - Initial release

### models

#### Added

 - Initial release

### prettier-config

#### Added

 - Initial release


