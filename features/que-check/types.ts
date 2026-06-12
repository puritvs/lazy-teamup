export type QueCheckEvent = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

export type ParsedQueEvent = {
  id: string;
  title: string;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
};
