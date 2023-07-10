// Dependencies
import orderBy from 'lodash.orderby'
import { measurements } from 'shared/prebuild/data/design-measurements.mjs'
// Hooks
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useAccount } from 'shared/hooks/use-account.mjs'
import { useBackend } from 'shared/hooks/use-backend.mjs'
// Components
import { SetCandidate, ns as setNs } from 'shared/components/sets/set-candidate.mjs'
import { PopoutWrapper } from 'shared/components/wrappers/popout.mjs'

export const ns = setNs

export const UserSetPicker = ({ design, t, href, clickHandler }) => {
  // Hooks
  const { token } = useAccount()
  const backend = useBackend(token)

  // State
  const [sets, setSets] = useState({})

  // Effects
  useEffect(() => {
    const getSets = async () => {
      const result = await backend.getSets()
      if (result.success) {
        const all = {}
        for (const set of result.data.sets) all[set.id] = set
        setSets(all)
      }
    }
    getSets()
  }, [backend])

  return Object.keys(sets).length < 1 ? (
    <PopoutWrapper tip noP>
      <h5>{t('patternForWhichSet')}</h5>
      <p>{t('fsmtm')}</p>
    </PopoutWrapper>
  ) : (
    <>
      <h3>{t('yourSets')}</h3>
      {Object.keys(sets).length > 0 ? (
        <>
          <div className="flex flex-row flex-wrap gap-2">
            {orderBy(sets, ['name'], ['asc']).map((set) => (
              <div className="w-full lg:w-96" key={set.id}>
                <SetCandidate
                  requiredMeasies={measurements[design]}
                  {...{ set, design, href, clickHandler }}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <PopoutWrapper fixme compact>
          Implement UI for when there are no sets
        </PopoutWrapper>
      )}
    </>
  )
}

export const BookmarkedSetPicker = ({ t }) => (
  <>
    <h3>{t('bookmarkedSets')}</h3>
    <PopoutWrapper fixme>Implement bookmarked set picker (also implement bookmarks)</PopoutWrapper>
  </>
)

export const SetPicker = ({ design, href = false, clickHandler = false }) => {
  const { t, i18n } = useTranslation('sets')
  const { language } = i18n

  const pickerProps = { design, t, language, href, clickHandler }

  return (
    <>
      <h2>{t('chooseSet')}</h2>
      <BookmarkedSetPicker {...pickerProps} />
      <UserSetPicker {...pickerProps} />
    </>
  )
}

//<BookmarkedSetPicker {...pickerProps} />
//<CuratedSetPicker {...pickerProps} />
