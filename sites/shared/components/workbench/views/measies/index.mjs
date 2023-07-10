import { ns as authNs } from 'shared/components/wrappers/auth/index.mjs'
import { SetPicker, ns as setsNs } from 'shared/components/sets/set-picker.mjs'
import { MeasiesEditor } from './editor.mjs'
import { Popout } from 'shared/components/popout.mjs'
import { Collapse } from 'shared/components/collapse.mjs'
import { designMeasurements } from 'shared/utils.mjs'
import { useTranslation } from 'next-i18next'

export const ns = ['wbmeasies', ...authNs, setsNs]

export const MeasiesView = ({ design, Design, settings, update, missingMeasurements, setView }) => {
  const { t } = useTranslation(['wbmeasies'])

  const loadMeasurements = (set) => {
    update.settings([
      [['measurements'], designMeasurements(Design, set.measies)],
      [['units'], set.imperial ? 'imperial' : 'metric'],
    ])
    setView('draft')
    toast.success(t('updatedMeasurements'))
  }

  return (
    <div className="m-6">
      <h1 className="max-w-6xl m-auto text-center">{t('measurements')}</h1>
      {missingMeasurements ? (
        <Popout note compact dense noP>
          <h5>{t('weLackSomeMeasies')}:</h5>
          <p>
            <b>{t('youCanPickOrEnter')}</b>
          </p>
          <Collapse title={t('seeMissingMeasies')}>
            <ul className="list list-inside list-disc ml-4">
              {missingMeasurements.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </Collapse>
        </Popout>
      ) : (
        <Popout tip compact dense noP>
          <h5>{t('measiesOk')}</h5>
        </Popout>
      )}
      <SetPicker design={design} clickHandler={loadMeasurements} />
      <h3>Edit measurements</h3>
      <MeasiesEditor {...{ Design, settings, update }} />
    </div>
  )
}
