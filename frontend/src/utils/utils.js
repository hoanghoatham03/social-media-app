// Get initials from a name (first letter of first and last name)
export const getInitials = (name) => {
  if (!name) return "";

  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

// Format date to a readable format
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  // If the date is today, return the time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // If the date is within a week, return the day name
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }

  // Otherwise, return the date
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};
