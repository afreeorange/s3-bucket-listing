export const humanBytes = (bytes: string): string => {
  const _bytes = parseFloat(bytes);
  const sizes = ["B", "KiB", "MiB", "GiB", "TiB"];
  if (_bytes == 0) {
    return "Zero";
  }

  const i = Math.floor(Math.log(_bytes) / Math.log(1024));
  return Math.round(_bytes / Math.pow(1024, i)) + " " + sizes[i];
};

export const timeSince = (date: string): string => {
  let _date: string | Date = date;
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

  if (typeof date !== "object") {
    _date = new Date(date);
  }

  secondsElapsed = Math.floor((now - _date) / 1000);

  for (let interval in intervals) {
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

  return `${intervalsElapsed} ${intervalType}${intervalTypePlural} ago`;
};

// https://davidwalsh.name/convert-xml-json
export const xmlToJson = (xml: any) => {
  let obj = {};

  if (xml.nodeType == 1) {
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        let attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) {
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      let item = xml.childNodes.item(i);
      let nodeName = item.nodeName;
      if (typeof obj[nodeName] == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push == "undefined") {
          let old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }

  return obj;
};

// https://www.freecodecamp.org/news/javascript-debounce-example/
export const debounce = (func: (e: any) => any, timeout: number) => {
  let timer: NodeJS.Timeout;

  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};
