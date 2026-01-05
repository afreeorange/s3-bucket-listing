// @ts-expect-error no types
import Tablesort from "tablesort";

/**
 * Register number sort on the global TableSort import.
 */
Tablesort.extend(
  "number",
  (item: string) =>
    item.match(/^[-+]?(\d)*-?([,.]){0,1}-?(\d)+([Ee][-+][\d]+)?%?$/),
  (a: string, b: string) => {
    const clean = (i: string) => i.replace(/[^\-?0-9.]/g, "");
    const numA = parseFloat(clean(a)) || 0;
    const numB = parseFloat(clean(b)) || 0;
    return numB - numA;
  },
);

export default Tablesort;
