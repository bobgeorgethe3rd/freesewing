// Hooks
import { useState } from 'react'
import { useTranslation } from 'next-i18next'
// Components
import {
  BeakerIcon,
  BriefcaseIcon,
  CodeIcon,
  CutIcon,
  HelpIcon,
  OptionsIcon,
  PrintIcon,
  UploadIcon,
  RightIcon,
  LeftIcon,
  DocsIcon,
  SearchIcon,
  MeasieIcon,
} from 'shared/components/icons.mjs'
import Link from 'next/link'
import { MenuWrapper } from 'shared/components/workbench/menus/shared/menu-wrapper.mjs'

export const ns = ['workbench', 'sections']

const icons = {
  test: BeakerIcon,
  export: BriefcaseIcon,
  edit: CodeIcon,
  cut: CutIcon,
  draft: OptionsIcon,
  print: PrintIcon,
  save: UploadIcon,
  logs: HelpIcon,
  inspect: SearchIcon,
  docs: DocsIcon,
  measies: MeasieIcon,
}

export const NavButton = ({
  href,
  label,
  children,
  onClick = false,
  active = false,
  extraClasses = 'bg-neutral lg:text-neutral-content lg:hover:bg-secondary',
}) => {
  const className = `w-full flex flex-row items-center px-4 py-2 ${extraClasses} ${
    active ? 'bg-secondary' : ''
  }`
  const span = <span className="block grow text-left">{label}</span>

  return (onClick = (
    <button {...{ onClick, className }} title={label}>
      {span}
      {children}
    </button>
  ))
}

const NavIcons = ({ setView, setDense, dense, view }) => {
  const { t } = useTranslation(['header'])
  const iconSize = 'h-6 w-6 grow-0 stroke-2'

  return (
    <>
      <NavButton
        onClick={() => setDense(!dense)}
        label={t('workbench:viewMenu')}
        extraClasses="hidden lg:flex font-bold text-neutral-content bg-accent hover:bg-success"
      >
        {dense ? (
          <RightIcon className={`${iconSize}`} stroke={3} />
        ) : (
          <LeftIcon className={`${iconSize}`} stroke={3} />
        )}
      </NavButton>
      <NavButton
        onClick={() => setView('draft')}
        label={t('workbench:configurePattern')}
        active={view === 'draft'}
      >
        <OptionsIcon className={iconSize} />
      </NavButton>
      <NavButton
        onClick={() => setView('measies')}
        label={t('workbench:measies')}
        active={view === 'measies'}
      >
        <MeasieIcon className={iconSize} />
      </NavButton>
      <NavButton
        onClick={() => setView('test')}
        label={t('workbench:testPattern')}
        active={view === 'test'}
      >
        <BeakerIcon className={iconSize} />
      </NavButton>
      <NavButton
        onClick={() => setView('print')}
        label={t('workbench:printLayout')}
        active={view === 'print'}
      >
        <PrintIcon className={iconSize} />
      </NavButton>
      <NavButton
        onClick={() => setView('cut')}
        label={t('workbench:cutLayout')}
        active={view === 'cut'}
      >
        <CutIcon className={iconSize} />
      </NavButton>
      <NavButton
        onClick={() => setView('save')}
        label={t('workbench:savePattern')}
        active={view === 'save'}
      >
        <UploadIcon className={iconSize} />
      </NavButton>
      <NavButton
        onClick={() => setView('export')}
        label={t('workbench:exportPattern')}
        active={view === 'export'}
      >
        <BriefcaseIcon className={iconSize} />
      </NavButton>
      <NavButton
        onClick={() => setView('edit')}
        label={t('workbench:editSettings')}
        active={view === 'edit'}
      >
        <CodeIcon className={iconSize} />
      </NavButton>
      <NavButton
        onClick={() => setView('logs')}
        label={t('workbench:patternLogs')}
        active={view === 'logs'}
      >
        <HelpIcon className={iconSize} />
      </NavButton>
      <NavButton
        onClick={() => setView('inspect')}
        label={t('workbench:patternInspector')}
        active={view === 'inspect'}
      >
        <SearchIcon className={iconSize} />
      </NavButton>
      <NavButton
        onClick={() => setView('docs')}
        label={t('workbench:docs')}
        active={view === 'docs'}
      >
        <DocsIcon className={iconSize} />
      </NavButton>
    </>
  )
}

export const WorkbenchHeader = ({ view, setView }) => {
  const [dense, setDense] = useState(true)
  return (
    <MenuWrapper
      Icon={icons[view]}
      wrapperClass={`w-64 min-h-screen pt-4
        bg-neutral
        shrink-0 grow-0 self-stretch
        transition-all
        drop-shadow-xl
        ${dense ? '-ml-52' : 'ml-0'}`}
      buttonClass={`order-last bottom-16`}
      keepOpenOnClick={false}
      order={0}
      type="nav"
    >
      <header
        className={`
        sticky top-4 lg:top-28
        group
      `}
      >
        <div
          className={`
        flex flex-col
        items-center w-full `}
        >
          <NavIcons {...{ setView, setDense, dense, view }} />
        </div>
      </header>
    </MenuWrapper>
  )
}
