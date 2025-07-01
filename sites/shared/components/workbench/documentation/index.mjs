import yaml from 'js-yaml'
import { useTranslation } from 'next-i18next'
import { capitalize } from '@freesewing/core'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export const DocumentationView = (props) => {
  const designName = props.design.designConfig.data.name.replace('@freesewing/', '')
  const { t } = useTranslation(['workbench'])

  const [markdownContent, setMarkdownContent] = useState('')

  useEffect(() => {
    fetch(`designs/${designName}/markdown/en.md`)
      .then((response) => response.text())
      .then((text) => setMarkdownContent(text))
  }, [])

  return (
    <section>
      <div className="max-w-screen-xl m-auto h-screen form-control">
        <h1>{t('documentationThing', { thing: capitalize(designName) })}</h1>
        <h3>fixME</h3>

        <li>Import markdown</li>
        <li>mm maybe make markdown files in docs</li>
        <li>i18n files in designs?</li>
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
