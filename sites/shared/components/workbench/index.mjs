// Hooks
import { useEffect, useState, useMemo } from 'react'
import { useGist } from 'shared/hooks/useGist'
import { useTranslation } from 'next-i18next'
import { useView } from 'shared/hooks/use-view.mjs'
import { useAccount } from 'shared/hooks/use-account.mjs'
import { useBackend } from 'shared/hooks/use-backend.mjs'
// Dependencies
import { pluginTheme } from '@freesewing/plugin-theme'
import { pluginI18n } from '@freesewing/plugin-i18n'
import { preloaders } from 'shared/components/workbench/preloaders.mjs'
import _set from 'lodash.set'
// Components
import { WorkbenchMenu } from 'shared/components/workbench/menu/index.mjs'
import { DraftError } from 'shared/components/workbench/draft/error.mjs'
import { Modal } from 'shared/components/modal/modal.mjs'
import { ErrorBoundary } from 'shared/components/error/error-boundary.mjs'
// Views
import { WorkbenchMeasurements } from 'shared/components/workbench/measurements/index.mjs'
import { LabSample } from 'shared/components/workbench/sample.mjs'
import { ExportDraft } from 'shared/components/workbench/exporting/index.mjs'
import { GistAsJson, GistAsYaml } from 'shared/components/workbench/gist.mjs'
import { DraftLogs } from 'shared/components/workbench/logs.mjs'
import { CutLayout } from 'shared/components/workbench/layout/cut/index.mjs'
import { PrintLayout } from 'shared/components/workbench/layout/print/index.mjs'
import { EditYaml } from 'shared/components/workbench/edit/index.mjs'

// Components
import { WorkbenchHeader } from './header.mjs'
import { ErrorView } from 'shared/components/error/view.mjs'
// Views
import { DraftView } from 'shared/components/workbench/draft/index.mjs'

export const ns = ['workbench']

const loadDefaultSettings = ({ locale = 'en', units = 'metric' }) => ({
  settings: {
    sa: 0,
    scale: 1,
    complete: true,
    paperless: false,
    margin: 2,
    units,
    locale,
    embed: true,
  },
  renderer: 'react',
  //saBool: false,
  //saMm: 10,
  //debug: true,
})

const draftViews = ['draft', 'test']

export const Workbench = ({ design, Design, set = false }) => {
  // Hooks
  const { t, i18n } = useTranslation(ns)
  const { language } = i18n
  const { account, token } = useAccount()
  const { backend } = useBackend(token)

  const defaults = loadDefaultSettings({
    units: account.imperial ? 'imperial' : 'metric',
    locale: language,
  })
  if (set) defaults.settings.measurements = set.measies

  // State
  const [view, setView] = useView()
  const [gist, setGist] = useState({ ...defaults, embed: true, renderer: 'react' })
  const [error, setError] = useState(false)

  // Effects
  useEffect(() => {
    if (set.measies) updateGist('settings.measurements', set.measies)
  }, [set])

  // Don't bother without a set or Design
  if (!set || !Design) return null

  // Short-circuit errors early
  if (error)
    return (
      <>
        <WorkbenchHeader setView={setView} />
        {error}
      </>
    )

  // Helper method to update the gist
  const updateGist = (path, val) => {
    const newGist = { ...gist }
    _set(newGist, path, val)
    setGist(newGist)
  }

  // Generate the pattern here so we can pass it down to both the view and the options menu
  const pattern = draftViews.includes(view) ? new Design(gist.settings) : false
  if (pattern) {
    // add theme to svg renderer
    if (gist.renderer === 'svg') {
      pattern.use(pluginI18n, { t })
      pattern.use(pluginTheme, { skipGrid: ['pages'] })
    }

    // draft it for draft and event views. Other views may add plugins, etc and we don't want to draft twice
    try {
      pattern.draft()
    } catch (error) {
      console.log(error)
      setError(<ErrorView>{JSON.stringify(error)}</ErrorView>)
    }
  }

  return (
    <>
      <WorkbenchHeader setView={setView} view={view} />
      {view === 'draft' && <DraftView {...{ pattern, setView, gist, updateGist }} />}
      <p>view is {view}</p>
      <button onClick={() => setView('alt')}>alt</button>
      <button onClick={() => setView('draft')}>draft</button>
    </>
  )
}

const views = {
  measurements: WorkbenchMeasurements,
  //draft: LabDraft,
  test: LabSample,
  printingLayout: PrintLayout,
  cuttingLayout: CutLayout,
  export: ExportDraft,
  logs: DraftLogs,
  yaml: GistAsYaml,
  json: GistAsJson,
  edit: EditYaml,
  welcome: () => <p>TODO</p>,
}

const hasRequiredMeasurementsMethod = (design, gist) => {
  if (design.patternConfig?.measurements?.length > 0 && !gist.measurements) return false

  for (const m of design.patternConfig?.measurements || []) {
    if (!gist.measurements[m]) return false
  }

  return true
}

const doPreload = async (preload, from, design, gist, setGist, setPreloaded) => {
  const g = await preloaders[from](preload, design)
  setPreloaded(preload)
  setGist({ ...gist, ...g.settings })
}

/*
 * This component wraps the workbench and is in charge of
 * keeping the gist state, which will trickle down
 * to all workbench subcomponents
 */
export const WorkbenchWrapper = ({
  app,
  design,
  preload = false,
  from = false,
  layout = false,
}) => {
  // State for gist
  const { gist, setGist, unsetGist, updateGist, gistReady, undoGist, resetGist } = useGist(
    design.designConfig?.data?.name,
    app.locale
  )
  const [messages, setMessages] = useState([])
  const [popup, setPopup] = useState(false)
  const [preloaded, setPreloaded] = useState(false)
  // we'll only use this if the renderer is svg, but we can't call hooks conditionally
  const { t } = useTranslation(['plugin'])

  // We'll use this in more than one location
  const hasRequiredMeasurements = hasRequiredMeasurementsMethod(design, gist)

  // If we don't have the required measurements,
  // force view to measurements
  useEffect(() => {
    if (!gistReady) return
    if (!['measurements', 'edit'].includes(gist._state?.view) && !hasRequiredMeasurements)
      updateGist(['_state', 'view'], 'measurements')
  }, [gistReady, gist._state?.view, hasRequiredMeasurements, updateGist])

  // If we need to preload the gist, do so
  useEffect(() => {
    if (preload && preload !== preloaded && from && preloaders[from]) {
      doPreload(preload, from, design, gist, setGist, setPreloaded)
    }
  }, [preload, preloaded, from, design, gist, setGist])

  // Helper methods to manage the gist state
  const updateWBGist = useMemo(
    () =>
      (path, value, closeNav = false, addToHistory = true) => {
        updateGist(path, value, addToHistory)
        // Force close of menu on mobile if it is open
        if (closeNav && app.primaryMenu) app.setPrimaryMenu(false)
      },
    [app, updateGist]
  )

  // Helper methods to handle messages
  const feedback = {
    add: (msg) => {
      const newMsgs = [...messages]
      if (Array.isArray(msg)) newMsgs.push(...msg)
      else newMsgs.push(msg)
      setMessages(newMsgs)
    },
    set: setMessages,
    clear: () => setMessages([]),
  }

  // don't do anything until the gist is ready
  if (!gistReady) {
    return null
  }

  // Generate the draft here so we can pass it down to both the view and the options menu
  let draft = false
  if (['draft', 'logs', 'test', 'printingLayout'].indexOf(gist._state?.view) !== -1) {
    gist.embed = true
    // get the appropriate layout for the view
    const layout = gist.layouts?.[gist._state.view] || gist.layout || true
    // hand it separately to the design
    draft = new design({ ...gist, layout })
    //draft.__init()

    // add theme to svg renderer
    if (gist.renderer === 'svg') {
      draft.use(pluginI18n, { t })
      draft.use(pluginTheme, { skipGrid: ['pages'] })
    }

    // draft it for draft and event views. Other views may add plugins, etc and we don't want to draft twice
    try {
      if (['draft', 'logs'].indexOf(gist._state.view) > -1) draft.draft()
    } catch (error) {
      return <DraftError error={error} app={app} draft={draft} at={'draft'} />
    }
  }

  // Props to pass down
  const componentProps = {
    app,
    design,
    gist,
    updateGist: updateWBGist,
    unsetGist,
    setGist,
    feedback,
    gistReady,
    showInfo: setPopup,
    hasRequiredMeasurements,
    draft,
  }
  // Required props for layout
  const layoutProps = {
    app: app,
    noSearch: true,
    workbench: true,
    AltMenu: <WorkbenchMenu {...componentProps} />,
    showInfo: setPopup,
  }

  const errorProps = {
    undoGist,
    resetGist,
    gist,
  }

  // Layout to use
  const LayoutComponent = layout

  const Component = views[gist._state?.view] ? views[gist._state.view] : views.welcome

  return (
    <LayoutComponent {...layoutProps}>
      {messages}
      <ErrorBoundary {...errorProps}>
        <Component {...componentProps} draft={draft} />
        {popup && <Modal cancel={() => setPopup(false)}>{popup}</Modal>}
      </ErrorBoundary>
    </LayoutComponent>
  )
}
