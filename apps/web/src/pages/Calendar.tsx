import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPluginDay from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Segmented } from 'antd';
import dayjs from 'dayjs';

import api from '../api';

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  startDate: string | null;
}

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'dayGridDay';

export function CalendarPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewType>('dayGridMonth');
  const [date, setDate] = useState(new Date());

  const fetchTasks = useCallback(async () => {
    try {
      let start: string;
      let end: string;

      if (view === 'dayGridDay') {
        start = dayjs(date).startOf('day').toISOString();
        end = dayjs(date).endOf('day').toISOString();
      } else if (view === 'timeGridWeek') {
        start = dayjs(date).startOf('week').toISOString();
        end = dayjs(date).endOf('week').toISOString();
      } else {
        start = dayjs(date).startOf('month').toISOString();
        end = dayjs(date).endOf('month').toISOString();
      }

      const { data } = await api.get('/tasks', {
        params: { limit: 500 },
      });

      const filtered = data.data.filter((task: Task) => {
        const taskDate = task.dueDate || task.startDate;
        if (!taskDate) return false;
        return dayjs(taskDate).isAfter(dayjs(start).subtract(1, 'day')) && 
               dayjs(taskDate).isBefore(dayjs(end).add(1, 'day'));
      });
      setTasks(filtered);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, [date, view]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const events = tasks.map((task) => {
    const taskDate = task.dueDate || task.startDate;
    let backgroundColor = '#e11d48';
    if (task.status === 'completed' || task.status === 'closed') {
      backgroundColor = '#22c55e';
    } else if (task.status === 'in_progress') {
      backgroundColor = '#f59e0b';
    }
    return {
      id: task.id,
      title: task.title,
      start: taskDate!,
      backgroundColor,
      borderColor: backgroundColor,
    };
  });

  const handleEventClick = (info: any) => {
    navigate(`/tasks/${info.event.id}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            日历视图
          </h1>
          <p className="text-[#71717a] mt-1">
            按日期查看任务安排
          </p>
        </div>
        <Segmented
          options={[
            { label: '日', value: 'dayGridDay' },
            { label: '周', value: 'timeGridWeek' },
            { label: '月', value: 'dayGridMonth' },
          ]}
          value={view}
          onChange={(value) => setView(value as ViewType)}
          className="[&_.ant-segmented-item-selected]:!bg-[#e11d48] [&_.ant-segmented-thumb]:!bg-[#e11d48]"
        />
      </div>

      <div className="card p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, dayGridPluginDay, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          events={events}
          height={600}
          dateClick={(info) => setDate(new Date(info.dateStr))}
          datesSet={(info) => setDate(new Date(info.startStr))}
          nowIndicator={true}
          eventDisplay="block"
          eventClick={handleEventClick}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          dayMaxEvents={3}
        />
      </div>
    </div>
  );
}