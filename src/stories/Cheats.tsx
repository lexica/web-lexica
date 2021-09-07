
const Cheats: React.FC = ({ children }) => <>
  {children}
    <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0)' }}>
      <div id="viewport-height-cheat" style={{ height: '1vh' }}></div>
      <div id="viewport-width-cheat" style={{ height: '1vw' }}></div>
      <div id="em-cheat" style={{ height: '1em' }}></div>
    </div>
</>

export default Cheats
