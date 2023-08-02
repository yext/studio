import { Hours, Day } from "@yext/types";

export default function HoursDisplay(hours: Hours) {
  return (
    <div className="flex flex-col">
      {Object.entries(hours).map(([name, day]) => DayHours(name, day))}
    </div>
  );
}

function DayHours(name:string, day: Day) {
  return (
    <div className="flex flex-row">
      <span className="pr-2 font-bold">{name}</span>
      <div className="flex flex-col">
        {day.openIntervals.map(interval => {
          return (
            <span>
              {interval.start} - {interval.end}
            </span>
          );
        })}
      </div>
    </div>
  )
}