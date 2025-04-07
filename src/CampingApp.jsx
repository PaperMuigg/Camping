// Campingplatz Buchungssystem
import React, { useState } from "react";
import { format, addDays, isWithinInterval, eachDayOfInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const NUM_PLOTS = 10;
const PLOT_PRICE = 25;
const KURTAXE = 2;

const generateInitialBookings = () => [];

const CampingApp = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [persons, setPersons] = useState(1);
  const [duration, setDuration] = useState(1);

  const checkAvailability = (plotId, start, duration) => {
    const end = addDays(start, duration - 1);
    return !bookings.some(
      (b) =>
        b.plotId === plotId &&
        (isWithinInterval(start, { start: b.start, end: b.end }) ||
         isWithinInterval(end, { start: b.start, end: b.end }) ||
         isWithinInterval(b.start, { start, end }))
    );
  };

  const suggestAlternative = (plotId, start, duration) => {
    for (let offset = 1; offset <= 3; offset++) {
      const altStart = addDays(start, offset);
      if (checkAvailability(plotId, altStart, duration)) {
        return altStart;
      }
    }
    return null;
  };

  const handleBooking = () => {
    if (selectedDate && selectedPlot !== null && checkAvailability(selectedPlot, selectedDate, duration)) {
      const newBooking = {
        start: selectedDate,
        end: addDays(selectedDate, duration - 1),
        plotId: selectedPlot,
        persons,
      };
      setBookings([...bookings, newBooking]);
    }
  };

  const getPlotColor = (plotId) => {
    if (!selectedDate) return "gray";
    const available = checkAvailability(plotId, selectedDate, duration);
    if (available) return "lightgreen";
    const alternative = suggestAlternative(plotId, selectedDate, duration);
    if (alternative) return "gold";
    return "lightcoral";
  };

  const calculateRevenuePerPlot = () => {
    const revenue = Array(NUM_PLOTS).fill(0);
    bookings.forEach((b) => {
      const nights = eachDayOfInterval({ start: b.start, end: b.end }).length;
      const income = nights * (PLOT_PRICE + b.persons * KURTAXE);
      revenue[b.plotId] += income;
    });
    return revenue.map((val, idx) => ({ name: `Platz ${idx + 1}`, Einnahmen: val }));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Campingplatz Buchungssystem</h1>
      <div style={{ marginBottom: 20 }}>
        <input type="date" value={format(selectedDate, 'yyyy-MM-dd')} onChange={e => setSelectedDate(new Date(e.target.value))} />
        <input type="number" min="1" value={persons} onChange={e => setPersons(Number(e.target.value))} placeholder="Personen" />
        <input type="number" min="1" value={duration} onChange={e => setDuration(Number(e.target.value))} placeholder="Nächte" />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {Array.from({ length: NUM_PLOTS }).map((_, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPlot(idx)}
            style={{
              width: 100,
              height: 60,
              background: getPlotColor(idx),
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: selectedPlot === idx ? '3px solid blue' : '1px solid #ccc',
              cursor: 'pointer'
            }}
          >
            Platz {idx + 1}
          </div>
        ))}
      </div>
      <button onClick={handleBooking} style={{ marginTop: 20 }}>Buchen</button>
      <div style={{ marginTop: 40 }}>
        <h2>Einnahmen pro Platz</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={calculateRevenuePerPlot()}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Einnahmen" fill="#4ade80" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CampingApp;
