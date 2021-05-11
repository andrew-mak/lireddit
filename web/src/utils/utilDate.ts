const utilDate = (date: string) => {
  enum Motnths { "Jan"=0, "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

  const postDate = new Date(+date);
  const diff = new Date().getTime() - postDate.getTime();
  const years = diff / (1000 * 60 * 60 * 24 * 365);
  const days = diff / (1000 * 60 * 60 * 24);

  let result = "";

  if (years > 1) result = postDate.toLocaleDateString();
  else if (years > 0 && days > 6) result = `${Motnths[postDate.getMonth()]}, ${postDate.getDate()}`;
  else {
    if (days >= 2) result = `${Math.trunc(days)} days ago`;
    else if (days >= 1) result = `${Math.trunc(days)} day ago`;
    else if (days < 1 && days > 0) {
      const hours = days * 24;
      if (hours >= 2) result = `${Math.trunc(hours)} hours ago`;
      else if (hours >= 1) result = `${Math.trunc(hours)} hour ago`;
      else if (hours < 1 && hours > 0) {
        const minutes = hours * 60;
        if (minutes >= 2) result = `${Math.trunc(minutes)} minutes ago`;
        else if (minutes >= 1) result = `${Math.trunc(minutes)} minute ago`;
        else if (minutes < 1 && minutes >= 0)
          result = `less a minute ago`;
        else result = postDate.toDateString();
      }
    }
  }

  return result;
};

export default utilDate;