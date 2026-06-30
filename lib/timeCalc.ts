export type TimeRange = {
  start_time: string;
  end_time: string;
};

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function getDurationMinutes(startTime: string, endTime: string): number {
  const start = toMinutes(startTime);
  let end = toMinutes(endTime);

  if (end < start) {
    end += 24 * 60;
  }

  return end - start;
}

function getOverlapMinutes(
  startTime: string,
  endTime: string,
  breakStart: string,
  breakEnd: string
): number {
  const workStart = toMinutes(startTime);
  let workEnd = toMinutes(endTime);
  let restStart = toMinutes(breakStart);
  let restEnd = toMinutes(breakEnd);

  if (workEnd < workStart) workEnd += 24 * 60;
  if (restEnd < restStart) restEnd += 24 * 60;

  if (restStart < workStart && restEnd <= workStart) {
    restStart += 24 * 60;
    restEnd += 24 * 60;
  }

  const overlapStart = Math.max(workStart, restStart);
  const overlapEnd = Math.min(workEnd, restEnd);

  return Math.max(0, overlapEnd - overlapStart);
}

export function calculateWorkTime(
  startTime: string,
  endTime: string,
  breakTimes: TimeRange[]
) {
  const totalMinutes = getDurationMinutes(startTime, endTime);

  const breakMinutes = breakTimes.reduce((sum, breakTime) => {
    return (
      sum +
      getOverlapMinutes(
        startTime,
        endTime,
        breakTime.start_time,
        breakTime.end_time
      )
    );
  }, 0);

  const 인정분 = Math.max(0, totalMinutes - breakMinutes);

  return {
    totalMinutes,
    breakMinutes,
    인정분,
    totalHours: Number((totalMinutes / 60).toFixed(2)),
    breakHours: Number((breakMinutes / 60).toFixed(2)),
    인정시간: Number((인정분 / 60).toFixed(2)),
  };
}