// @ts-nocheck

export const timeAgo = (date: Date, compressed: boolean = false): string => {
  let secondsElapsed = 0;
  const now = new Date();
  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  let intervalType = "";
  let intervalTypePlural = "";
  let intervalsElapsed = 0;

  secondsElapsed = Math.floor((now - date) / 1000);

  for (const interval in intervals) {
    intervalsElapsed = Math.floor(secondsElapsed / intervals[interval]);
    if (intervalsElapsed >= 1) {
      intervalType = interval;
      break;
    }
  }

  if (intervalsElapsed > 1) {
    intervalTypePlural = "s";
  }

  if (intervalsElapsed === 0) {
    return "Just now";
  }

  if (compressed) {
    let shortInterval = intervalType.slice(0, 1);
    if (intervalType === "month") {
      shortInterval = "M";
    }

    return `${intervalsElapsed}${shortInterval}`;
  }

  return `${intervalsElapsed} ${intervalType}${intervalTypePlural} ago`;
};
