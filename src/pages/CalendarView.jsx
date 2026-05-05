import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Phone, User, CheckCircle2, BadgeCheck } from 'lucide-react';
import { getAllSubmissions, getAllOnboardings, getLoggedInUser } from '../store/db';

export default function CalendarView() {
  const [events, setEvents]           = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [todayPopup, setTodayPopup]   = useState(null); // events happening today
  const user   = getLoggedInUser();
  const userId = user?.id;
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    loadEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedDate]);

  const loadEvents = () => {
    const today = new Date().toISOString().slice(0, 10);
    const allLeads = getAllSubmissions();
    const relevantLeads = isOwner ? allLeads : allLeads.filter(l => l.assignedTo === user.id || l.assignedTo === 'unassigned');

    // Lead follow-up events
    const followUpEvents = relevantLeads
      .filter(lead => lead.followUpDate)
      .map(lead => ({
        id: lead.uid,
        title: `Follow-up: ${lead.fullName} (${lead.requirement || lead.loanType})`,
        date: lead.followUpDate,
        time: '10:00 AM',
        type: 'followup',
        lead,
        status: lead.status
      }));

    // Meeting note events
    const meetingEvents = [];
    relevantLeads.forEach(lead => {
      (lead.meetingNotes || []).forEach((note, idx) => {
        meetingEvents.push({
          id: `${lead.uid}-note-${idx}`,
          title: `Meeting Log: ${lead.fullName}`,
          date: note.date.slice(0, 10),
          time: new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'meeting',
          lead,
          note: note.note,
          isWhatsApp: note.isWhatsApp
        });
      });
    });

    // Deal follow-up events from onboarded clients
    const allOnb = getAllOnboardings();
    const dealEvents = allOnb
      .filter(o => o.dealFollowUpDate)
      .map(o => ({
        id: `deal-${o.id}`,
        title: `Deal Follow-up: ${o.applicant?.name} (${o.loanType})`,
        date: o.dealFollowUpDate,
        time: '10:00 AM',
        type: 'deal',
        phone: o.applicant?.phone || '',
        amount: o.dealAmount,
        loanType: o.loanType,
        name: o.applicant?.name,
      }));

    const allEvents = [...followUpEvents, ...meetingEvents, ...dealEvents]
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setEvents(allEvents);

    // Show today popup if any deal follow-up is today
    const todayDeals = dealEvents.filter(e => e.date === today);
    if (todayDeals.length > 0) setTodayPopup(todayDeals);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const currentYear = parseInt(selectedDate.split('-')[0]);
  const currentMonth = parseInt(selectedDate.split('-')[1]) - 1;
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentYear, currentMonth, i + 1).toISOString().slice(0, 10)); // +1 to offset UTC for strict ISO
  }

  const selectedEvents = events.filter(e => e.date === selectedDate);

  // Generate simple array of dates for the grid
  const calendarGrid = [];
  let dayCounter = 1;
  for (let i = 0; i < 42; i++) {
    if (i < firstDayOfMonth || dayCounter > daysInMonth) {
      calendarGrid.push(null);
    } else {
      const dayString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
      calendarGrid.push(dayString);
      dayCounter++;
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', height: '100%' }}>

      {/* Today deal follow-up popup */}
      {todayPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '18px', padding: '1.75rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <BadgeCheck size={26} color="#7c3aed" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1f2937' }}>🔔 Deal Follow-up Today!</h3>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.83rem', marginBottom: '1rem' }}>The following closed deals have a follow-up scheduled for today:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {todayPopup.map((e, i) => (
                <div key={i} style={{ background: '#f5f3ff', borderRadius: '10px', padding: '0.75rem 1rem', borderLeft: '3px solid #7c3aed' }}>
                  <div style={{ fontWeight: 700, color: '#1f2937', fontSize: '0.9rem' }}>{e.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem' }}>{e.loanType} {e.amount ? `· ₹${Number(e.amount).toLocaleString('en-IN')}` : ''}</div>
                  {e.phone && <a href={`tel:${e.phone}`} style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 700, textDecoration: 'none', marginTop: '0.25rem', display: 'inline-block' }}>📞 {e.phone}</a>}
                </div>
              ))}
            </div>
            <button onClick={() => setTodayPopup(null)} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem' }}>Got it!</button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CalendarIcon size={28} color="var(--primary-color)" /> My Calendar
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track your lead approaches, meetings, and follow-ups.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Left Side: Calendar Grid */}
        <div className="card" style={{ flex: '1 1 400px', padding: '1.5rem', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => {
                let d = new Date(currentYear, currentMonth - 1, 2);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}
              style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Prev
            </button>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
            </h3>
            <button 
              onClick={() => {
                let d = new Date(currentYear, currentMonth + 1, 2);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}
              style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Next
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{day}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {calendarGrid.map((dateString, idx) => {
              if (!dateString) return <div key={idx} style={{ aspectRatio: '1', padding: '0.5rem' }}></div>;
              
              const dayEvents = events.filter(e => e.date === dateString);
              const isSelected = dateString === selectedDate;
              const isToday = dateString === new Date().toISOString().slice(0, 10);
              const dayNumber = parseInt(dateString.split('-')[2]);

              return (
                <button 
                  key={idx}
                  onClick={() => setSelectedDate(dateString)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--primary-lighter)' : (isToday ? '#f8fafc' : 'white'),
                    color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                    fontWeight: isSelected || isToday ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{dayNumber}</span>
                  {dayEvents.length > 0 && (
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {dayEvents.slice(0, 3).map((e, i) => (
                        <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: e.type === 'deal' ? '#7c3aed' : e.type === 'meeting' ? '#22c55e' : 'var(--primary-color)' }}></div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Event Details */}
        <div className="card" style={{ flex: '1.5 1 400px', padding: '1.5rem', marginBottom: 0 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            Schedule for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>

          {selectedEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <CalendarIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No events or leads scheduled for this date.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedEvents.map(event => {
                const isDeal    = event.type === 'deal';
                const isFollowUp = event.type === 'followup';
                const borderColor = isDeal ? '#ddd6fe' : isFollowUp ? '#fed7aa' : '#bbf7d0';
                const bgColor    = isDeal ? '#f5f3ff'  : isFollowUp ? '#fff7ed' : '#f0fdf4';
                const timeColor  = isDeal ? '#6d28d9'  : isFollowUp ? '#c2410c' : '#166534';
                const lineColor  = isDeal ? '#a78bfa'  : isFollowUp ? '#f97316' : '#86efac';

                return (
                  <div key={event.id} style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid', borderColor, backgroundColor: bgColor, display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: timeColor }}>{event.time}</div>
                    </div>
                    <div style={{ width: '2px', alignSelf: 'stretch', backgroundColor: lineColor, borderRadius: '2px' }}></div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isDeal && <BadgeCheck size={15} color="#7c3aed" />}
                        {event.title}
                        {event.isWhatsApp && <CheckCircle2 size={14} color="#22c55e" />}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                        {isDeal ? (
                          <>
                            {event.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Phone size={14} /><a href={`tel:${event.phone}`} style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'none' }}>{event.phone}</a></div>}
                            {event.amount && <div style={{ fontSize: '0.82rem', color: '#6d28d9', fontWeight: 700 }}>Closed Amount: ₹{Number(event.amount).toLocaleString('en-IN')}</div>}
                          </>
                        ) : isFollowUp ? (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Phone size={14} /> {event.lead.phone}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><User size={14} /> Status: <span style={{ fontWeight: 600 }}>{event.status}</span></div>
                          </>
                        ) : (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>"{event.note}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
