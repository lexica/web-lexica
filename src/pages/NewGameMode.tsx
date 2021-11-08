import { useCallback, useRef, useState } from 'react'
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/round/emoji_events.svg'
import { ReactComponent as GridView } from '@material-design-icons/svg/round/grid_view.svg'
import { ReactComponent as RadioButtonUnchecked } from '@material-design-icons/svg/round/radio_button_unchecked.svg'
import { ReactComponent as RadioButtonChecked } from '@material-design-icons/svg/round/radio_button_checked.svg'
import { ReactComponent as Schedule } from '@material-design-icons/svg/round/schedule.svg'

import Svg, { SvgComponent } from '../components/Svg'
import { useConstants } from '../style/constants'

import './NewGameMode.css'

const Description = ({ title, svg }: { title: string, svg: SvgComponent }): JSX.Element => <div
  className="new-game-mode-description-container"
>
  <Svg.Standard svg={svg} title={title}/>
  <div>{title}</div>
</div>


type RadioProps<T extends string | number | readonly string[]> = {
  title: string,
  value: T,
  group: string,
  id: string,
  checked: boolean,
  onChange: (value: T) => void
}

function Radio<T extends string | number | readonly string[]>({
  title,
  value,
  group,
  id,
  onChange,
  checked
}: RadioProps<T>): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(undefined as any)

  const handleChange = useCallback(() => {
    inputRef.current && (inputRef.current.checked = true)
    onChange(value)
  }, [onChange, inputRef, value])

  return <>
    <div
      onClick={handleChange}
      style={{ display: 'flex' }}
    >
      <Svg.Standard svg={checked ? RadioButtonChecked : RadioButtonUnchecked} title={title} />
    </div>
    <input
      type="radio"
      id={id}
      value={value}
      name={group}
      ref={inputRef}
      onChange={() => onChange(value)}
      checked={checked}
      style={{display: 'none'}}
    />
    <label
      onClick={handleChange}
    >{title}</label>
  </>
}

const NewGameMode = (): JSX.Element => {
  const [boardSize, setBoardSize] = useState(0)


  return <div className="Page new-game-mode">
    <input className="new-game-mode-name-input" about="For choosing game mode" value="Name"/>
    <div className="new-game-mode-time-limit-container">
      <Description title="Time Limit" svg={Schedule}/>
      <input className="new-game-mode-time-limit-input" about="Time limit in minutes"/>
    </div>
    <div className="new-game-mode-board-size-container">
      <Description title="Board Size" svg={GridView}/>
      <div>
        {[4, 5, 6].map(size => {
          const id = `${size}x${size}`
          return <div className="new-game-mode-board-size-option">
            <Radio group="board-size" value={size} id={id} title={id} onChange={setBoardSize} checked={boardSize===size}/>
          </div>
        })}
      </div>
    </div>
    <div className="new-game-mode-scoring-type-container">
      <Description title="Scoring Type" svg={EmojiEvents}/>
    </div>
  </div>
}

export default NewGameMode
