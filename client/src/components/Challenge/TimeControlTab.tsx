interface ITimeControlTab{
    title:string;
    userrating:string;
    onClick:() => void;
    isSelected:boolean;
}

const TimeControlTab = ({
  title,
  userrating,
  onClick,
  isSelected,
}:ITimeControlTab) => {
  return (
    <div 
      className={`tcontroltab glassmorphism-dark gls-box pointer ${isSelected ? 'selected':''}`}
      onClick={onClick}
    >
        <img src={`/assets/challenge/time-controls/${title.toLocaleLowerCase()}.svg`} alt="" />
        <div className="tcontroltab__about">
            <div className="tcontroltab__title">{title}</div>
            <div className="userrating">{userrating}</div>
        </div>
    </div>
  )
}

export default TimeControlTab;
