import { useEffect, useState, useCallback } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
} from "react-big-calendar";
import { Card, Segmented } from "antd";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import api from "../api";
import "react-big-calendar/lib/css/react-big-calendar.css";

dayjs.extend(localeData);

const localizer = dateFnsLocalizer({
  format: (date: Date, formatString: string) =>
    dayjs(date).format(formatString),
  startOfWeek: () => dayjs().startOf("week").toDate(),
  getNow: () => dayjs().toDate(),
  locales: { "zh-CN": dayjs },
  defaultLocale: "zh-CN",
});

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
}

type ViewType = "month" | "week";

export function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewType>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const fetchTasks = useCallback(async () => {
    try {
      const start = dayjs(date).startOf("month").toISOString();
      const end = dayjs(date).endOf("month").toISOString();
      const { data } = await api.get("/tasks", {
        params: { limit: 500 },
      });
      const filtered = data.data.filter((task: Task) => {
        if (!task.dueDate) return false;
        const taskDate = dayjs(task.dueDate);
        return taskDate.isAfter(start) && taskDate.isBefore(end);
      });
      setTasks(filtered);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  }, [date]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: new Date(task.dueDate!),
    end: new Date(task.dueDate!),
    resource: task,
  }));

  return (
    <Card
      title="日历视图"
      extra={
        <Segmented
          options={[
            { label: "月", value: "month" },
            { label: "周", value: "week" },
          ]}
          value={view}
          onChange={(value) => setView(value as ViewType)}
        />
      }
    >
      {/* <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={(v) => setView(v as ViewType)}
        date={date}
        onNavigate={setDate}
        style={{ height: 600 }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor:
              event.resource.status === "completed" ? "#52c41a" : "#1890ff",
          },
        })}
      /> */}
    </Card>
  );
}
