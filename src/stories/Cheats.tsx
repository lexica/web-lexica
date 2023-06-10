import { WithOptionalChildren } from '../util/types'

const Cheats = ({ children }: WithOptionalChildren<{}>) => <>
  {children}
    <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0)' }}>
      <div id="viewport-height-cheat" style={{ height: '1vh' }}></div>
      <div id="viewport-width-cheat" style={{ height: '1vw' }}></div>
      <div id="rem-cheat" style={{ height: '1rem' }}></div>
    </div>
</>

export default Cheats
