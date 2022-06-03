import './MainTitle.css'

const MainTitle = ({ title, subtitle }: { title: string, subtitle?: string }): JSX.Element => {
  return <div className="main-title">
    <div className="main-title-letters">
      {title.toUpperCase().split('').map((l, i) => <div key={i} className="main-title-letter">{l}</div>)}
    </div>
    {subtitle ? <div className="main-sub-title">{subtitle}</div> : ''}
  </div>
}

export default MainTitle
