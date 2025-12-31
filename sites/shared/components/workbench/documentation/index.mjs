import { useTranslation } from 'next-i18next'
import { capitalize } from '@freesewing/core'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export const DocumentationView = (props) => {
  const designName = props.design.designConfig.data.name.replace('@freesewing/', '')
  const { t } = useTranslation(['workbench'])

  const [markdownContent, setMarkdownContent] = useState('')

  useEffect(() => {
    fetch(`/locales/documentation/${designName}/en.md`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch markdown file.')
        }
        return response.text()
      })
      .then((text) => {
        setMarkdownContent(text)
      })
      .catch((error) => {
        setMarkdownContent(
          `fixMe Documentation is missing for ${capitalize(
            designName
          )}. To add create this file __*designs/${designName}/markdown/en.md*__ and restart the environment.`
        )
      })
  }, [designName])

  return (
    <section>
      <div className="max-w-screen-xl m-auto form-control">
        <h1 className="border-b-2 border-base-200">
          {t('documentationThing', { thing: capitalize(designName) })}
        </h1>
        <ReactMarkdown className="prose max-w-full prose-li:prose-xl prose-p:prose-xl prose-h2:text-5xl prose-h2:font-thin prose-h3:text-3xl prose-h3:underline prose-h4:text-2xl prose-h4:underline prose-h5:underline prose-h6:prose-xl prose-h6:font-bold prose-a:text-secondary prose-a:underline prose-a:italic">
          {markdownContent}
        </ReactMarkdown>
      </div>
    </section>
  )
}

//<ReactMarkdown>{markdownContent}</ReactMarkdown>

// import yaml from 'js-yaml'
// import { useTranslation } from 'next-i18next'

// import ReactMarkdown from "react-markdown";

// const markdownText = await import('designs/theobald/markdown/en.md')

// export const DocumentationView = (props) => {

// const designName = props.design.designConfig.data.name.replace('@freesewing/', '')
// const { t } = useTranslation(['workbench'])

// return (
// <section>
// <ReactMarkdown>{markdownText}</ReactMarkdown>
// </section>
// );

// }

// import yaml from 'js-yaml'
// import { useTranslation } from 'next-i18next'
// import { capitalize } from '@freesewing/core'
// import React from 'react'
// import ReactDOM from 'react-dom'
// import ReactMarkdown from 'react-markdown'
// import { useEffect, useState } from "react";

// /** a view for editing the gist as yaml */
// export const DocumentationView = (props) => {
// const { t } = useTranslation(['workbench'])

// const designName = props.design.designConfig.data.name.replace('@freesewing/', '')

// async function importModule() {
// try {
// const markdownText = await import(`designs/${designName}/markdown/en.md`);
// } catch (error) {
// return (
// <>
// capitalize(designName) Markdown File Missing please fixMe
// </>
// )
// }
// }

// const [markdown, setMarkdown] = useState("");

// useEffect(() => {
// fetch(markdownText)
// .then((res) => res.text())
// .then((text) => setMarkdown(text));
// }, []);

// return (
// <div className="max-w-screen-xl m-auto h-screen form-control">
// <h1>{t('documentationThing', { thing: capitalize(designName) })}</h1>
// <h3>fixME</h3>

// <li>Import markdown</li>
// <li>mm maybe make markdown files in docs</li>
// <li>i18n files in designs?</li>

// </div>
// )
// }

/* <>
      <ReactMarkdown source={markdown} />
    </> */

/*   //const designReadMe = require(`designs/${designName}/markdown/en.md`)
  
  const markdownPath = fetch(`designs/${designName}/markdown/en.md`)
  
   const [content, setContent] = useState("");

  useEffect(() => {

    fetch(`designs/${designName}/markdown/en.md`)

      .then((res) => res.text())

      .then((text) => setContent(text));

  }, []);
  
  return (
    <div className="max-w-screen-xl m-auto h-screen form-control">
      <h1>{t('documentationThing', { thing: capitalize(designName) })}</h1>
	<h3>fixME</h3>
	
	<div className="content">

      <ReactMarkdown children={content} />
		
    </div>
	
	<li>Import markdown</li>
	<li>mm maybe make markdown files in docs</li>
	<li>i18n files in designs?</li>
	

    </div>
  ) */
