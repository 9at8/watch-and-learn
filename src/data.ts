import { get, set } from "./storage";

export interface Data {
  nextBingeTitle?: string;
}

const CHROME_DATA_KEY = "data";

export const getData = () => get<Data>(CHROME_DATA_KEY);
export const setData = (data: Data) => set(CHROME_DATA_KEY, data);
