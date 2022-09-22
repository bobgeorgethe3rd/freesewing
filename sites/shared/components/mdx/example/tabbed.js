import Example from './index.js'
import { Tab, Tabs } from '../tabs.js'
import { Examples } from '@freesewing/examples'
import { Rendertest } from '@freesewing/rendertest'
import { Tutorial } from '@freesewing/tutorial'
import Md from 'react-markdown'

const Preview = (props) => <Example
  {...props}
  patterns={{
    examples: Examples,
    //rendertest: Rendertest,
    //tutorial: Tutorial,
  }}
/>

const patterns = {
  examples: Examples,
  //rendertest: Rendertest,
  //tutorial: Tutorial,
}

const TabbedExample = ({pattern, part, children, caption }) => (
  <div>
  <Tabs tabs="Preview, Code, X-Ray">
    <Tab><Preview patterns={patterns} pattern={pattern} part={part} /></Tab>
    <Tab>{children}</Tab>
    <Tab><Preview patterns={patterns} pattern={pattern} part={part} xray={true} /></Tab>
  </Tabs>
  {caption && <div className="text-center italic -mt-4"><Md>{caption}</Md></div>}
  </div>
)

export default TabbedExample
