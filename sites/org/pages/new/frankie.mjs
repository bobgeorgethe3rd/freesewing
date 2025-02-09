/*
 * This page is auto-generated. Do not edit it by hand.
 */
import { Frankie } from 'designs/frankie/src/index.mjs'
// Dependencies
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { nsMerge } from 'shared/utils.mjs'
// Components
import { PageWrapper, ns as pageNs } from 'shared/components/wrappers/page.mjs'
import { Workbench, ns as wbNs } from 'shared/components/workbench/new.mjs'
import { WorkbenchLayout } from 'site/components/layouts/workbench.mjs'

// Translation namespaces used on this page
const ns = nsMerge('frankie', wbNs, pageNs)

const NewFrankiePage = ({ page, docs }) => (
  <PageWrapper {...page} title="Frankie" layout={WorkbenchLayout} header={null}>
    <Workbench
      {...{
        design: 'frankie',
        Design: Frankie,
        docs,
      }}
    />
  </PageWrapper>
)

export default NewFrankiePage

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ns)),
      page: {
        locale,
        path: ['new', 'frankie'],
        title: 'Frankie',
      },
    },
  }
}
