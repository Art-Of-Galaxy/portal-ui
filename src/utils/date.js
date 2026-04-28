export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const period = Number(hours) >= 12 ? 'PM' : 'AM';
  const hour = Number(hours) % 12 || 12;
  return `${hour}:${minutes} ${period}`;
}

export function isValidMeetingTime(date, time) {
  const meetingDate = new Date(`${date}T${time}`);
  const now = new Date();
  return meetingDate > now;
}
