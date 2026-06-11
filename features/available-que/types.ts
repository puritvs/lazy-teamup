export type EventForAvailability = {
  id: string;
  title: string;
  start_dt: string;
  end_dt: string;
};

export type AvailableQueSlot = {
  date: string;
  start: string;
  end: string;
  durationMinutes: number;
};

export type AvailableQueDay = {
  date: string;
  slots: AvailableQueSlot[];
};
