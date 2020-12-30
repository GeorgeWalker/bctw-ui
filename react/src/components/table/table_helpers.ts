import { getProperty } from "utils/common";

export type Order = 'asc' | 'desc';

/**
 * interface used to generate headers in TableHead
 */
export interface HeadCell<T> {
  disablePadding: boolean;
  id: keyof T;
  label: string;
  numeric: boolean;
}

/**
 * @param obj 
 * @param propsToDisplay 
 * @return {HeadCell<T>[]}
 */
function typeToHeadCell<T>(obj: T, propsToDisplay: string[]): HeadCell<T>[] {
  return propsToDisplay.map((k: string) => {
    const isNumber = typeof getProperty(obj, (k as any)) === 'number';
    return {
      disablePadding: false,
      id: k as any,
      label: k,
      numeric: isNumber
    }
  })
}

/**
 * comparator for a type. properties must be of primitive types 
 * string or number to sort successfully
 */
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

/**  
 * @param {Order} order
 * @param {Key} orderBy
  calls the descendingComparator with provided order
**/ 
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/*
  sorts an array of T with the provided comparator
*/
function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export {
  descendingComparator,
  getComparator,
  stableSort,
  typeToHeadCell,
}