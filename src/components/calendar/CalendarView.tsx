"use client";

import { useRouter } from "next/navigation";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCallback, useState } from "react";
import { EventModal } from "./EventModal";

const locales = { "ja-JP": ja };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type Event = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  userName: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
};

export function CalendarView({
  roomCode,
  events,
  isOwner,
  roomId,
}: {
  roomCode: string;
  events: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    userId: string;
    userName: string;
  }[];
  isOwner: boolean;
  roomId: string;
}) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const calendarEvents: CalendarEvent[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: new Date(e.startTime),
    end: new Date(e.endTime),
    resource: e,
  }));

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event.resource);
  }, []);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setShowAddForm(true);
  }, []);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setShowAddForm(false);
    setSelectedSlot(null);
  };

  const handleEventCreated = () => {
    handleCloseModal();
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
          >
            予定を追加
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium"
          >
            更新
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900/50 min-h-[400px]">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          views={["month", "week"]}
          defaultView="month"
          culture="ja-JP"
          className="text-gray-200 [&_.rbc-month-view]:bg-transparent [&_.rbc-time-view]:bg-transparent [&_.rbc-today]:bg-blue-500/10 [&_.rbc-off-range-bg]:bg-gray-900/50 [&_.rbc-event]:bg-blue-600 [&_.rbc-toolbar]:text-gray-200 [&_.rbc-toolbar_button]:text-gray-300 [&_.rbc-header]:text-gray-400"
        />
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          roomCode={roomCode}
          onClose={handleCloseModal}
          onUpdated={() => {
            handleCloseModal();
            router.refresh();
          }}
        />
      )}

      {showAddForm && (
        <EventModal
          roomCode={roomCode}
          onClose={handleCloseModal}
          onCreated={handleEventCreated}
          initialSlot={selectedSlot ?? undefined}
        />
      )}
    </div>
  );
}
