export type CalendarEventRow = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  color: string | null;
  weddingId: string | null;
  eventType: string;
  createdAt: string;
  updatedAt: string;
};

export type CalendarCeremonyEvent = {
  id: string;
  weddingId: string;
  weddingName: string;
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  cultureLabel: string | null;
};

export type CalendarTaskDeadline = {
  id: string;
  weddingId: string;
  weddingName: string;
  title: string;
  dueDate: string;
  status: string;
  priority: string;
};

export type CalendarWeddingDate = {
  id: string;
  title: string;
  date: string;
};

export type CalendarViewModel = {
  currentUserId: string;
  personalEvents: CalendarEventRow[];
  weddingDates: CalendarWeddingDate[];
  ceremonyEvents: CalendarCeremonyEvent[];
  taskDeadlines: CalendarTaskDeadline[];
  weddings: { id: string; slug: string; name: string }[];
};

export type CreateCalendarEventInput = {
  title: string;
  description?: string | null;
  startAt: string;
  endAt?: string | null;
  allDay: boolean;
  color?: string | null;
  weddingId?: string | null;
  eventType?: string;
};

export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput>;
