// Hooks
import { useApp } from 'site/hooks/useApp.mjs'
import { useTranslation } from 'next-i18next'
// Dependencies
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
// Components
import Head from 'next/head'
import { PageWrapper } from 'site/components/wrappers/page.mjs'
import { BareLayout } from 'site/components/layouts/bare.mjs'
import { Icons } from 'shared/components/navigation/primary.mjs'

const title = "Welcome to the bobgeorgethe3rd's Lab"

const HomePage = () => {
  const app = useApp()
  const { t } = useTranslation(['lab'])
  return (
    <PageWrapper app={app} title="{title}" layout={BareLayout}>
      <Head>
        <meta property="og:title" content="FreeSewing.dev" key="title" />
        <meta property="og:type" content="article" key="type" />
        <meta
          property="og:description"
          content="Documentation and tutorials for FreeSewing developers and contributors. Plus our Developers Blog"
          key="description"
        />
        <meta property="og:article:author" content="Joost De Cock" key="author" />
        <meta
          property="og:image"
          content="https://canary.backend.freesewing.org/og-img/en/dev/"
          key="image"
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://freesewing.dev/" key="url" />
        <meta property="og:locale" content="en_US" key="locale" />
        <meta property="og:site_name" content="freesewing.dev" key="site" />
        <title>{title}</title>
      </Head>
      <section
        style={{
          backgroundImage: "url('/img/bg3.jpg')",
          backgroundSize: '33.3%',
          backgroundPosition: '0% 50%',
        }}
        className="m-0 p-0 shadow drop-shadow-lg w-full mb-8"
      >
        <div className="mx-auto px-8 flex flex-col items-center justify-center min-h-screen py-24 lg:min-h-0 lg:py-96 bg-base-200 bg-opacity-25">
          <div
            className="flex flex-col items-end max-w-4xl bg-base-200
                  bg-opacity-50"
          >
            <h1
              className={`
                  text-3xl font-black text-center px-4
                  sm:text-6xl
                  md:text-7xl px-6
                  lg:px-8
                  `}
              style={{ textShadow: '10px 10px 30px #000', color: 'white' }}
            >
              <span className="font-bold ">bobgeorgethe3rd's </span>
              <span className="font-light">lab</span>
            </h1>
          </div>
          <h2
            className={`
            text-left bg-base-200
                  bg-opacity-50
                  `}
            style={{ textShadow: '10px 10px 30px #000', color: 'base-content' }}
          >
            - bobgeorgethe3rd's little corner of pattern design
            <br></br>- I try my best but sometimes it is hard
          </h2>
          <div
            className={`
            text-left bg-base-200
                  bg-opacity-50
                  `}
          >
            <Icons
              app={app}
              active="/"
              ulClasses="flex flex-row flex-wrap mt-8 justify-around w-full max-w-6xl"
              liClasses="text-neutral-content w-1/2 my-4 lg:mx-2 lg:w-24"
              linkClasses={`
                text-lg lg:text-xl py-1 text-base-content text-center hover:text-neutral-content
                  hover:cursor-pointer hover:bg-secondary
                flex flex-col items-center capitalize`}
            />
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}

export default HomePage

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}
