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
  location: string | null;
  attendeeIds: string[];
  guestEmails: string[];
  createdAt: string;
  updatedAt: string;
  /** True when the current user is an invitee, not the owner. Read-only on the calendar. */
  isAttendee: boolean;
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

export type CalendarEmployee = {
  id: string;
  name: string;
  role: string;
};

export type CalendarViewModel = {
  currentUserId: string;
  personalEvents: CalendarEventRow[];
  weddingDates: CalendarWeddingDate[];
  ceremonyEvents: CalendarCeremonyEvent[];
  taskDeadlines: CalendarTaskDeadline[];
  weddings: { id: string; slug: string; name: string }[];
  vendors: CalendarVendorContext[];
  employees: CalendarEmployee[];
};

export type CalendarVendorContext = {
  id: string;
  name: string;
  category: string;
  weddingName: string;
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
  location?: string | null;
  attendeeIds?: string[];
  guestEmails?: string[];
};

export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput>;

export type AnyCalendarEvent =
  | { source: "personal"; event: CalendarEventRow }
  | { source: "attendee"; event: CalendarEventRow }
  | { source: "wedding"; event: CalendarWeddingDate }
  | { source: "ceremony"; event: CalendarCeremonyEvent }
  | { source: "task"; event: CalendarTaskDeadline };
