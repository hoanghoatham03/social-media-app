
export const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formatDate = new Date(date).toLocaleDateString("en-US", options);
    let currentDate = new Date();
    let postDate = new Date(date);
    let timeDifference = currentDate - postDate;
    let daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    if (daysDifference === 0) {
      if (timeDifference < 60000) {
        return "Now";
      }
      if (timeDifference < 3600000) {
        return `${Math.floor(timeDifference / 60000)}m`;
      }
      return `${Math.floor(timeDifference / 3600000)}h`;
    }
    if (daysDifference < 30) {
      return `${daysDifference}d`;
    }
    if (daysDifference < 365) {
      // formatDate: February 28
      return formatDate.split(",")[0];
    }
    // formatDate: February 2025
    return formatDate.split(",")[0] + "," + formatDate.split(",")[1].trim();
  };