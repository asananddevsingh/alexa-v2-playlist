const cloudWatchLogger = require('./cloudwatchLogger');

class DateUtil {
  constructor() {}
  // It is used to check the given date is BST or not.
  isBST(dateArg) {
    try {
      const date = new Date(dateArg) || new Date();
      const starts = this.lastSunday(2, date.getFullYear());
      // The setHours() method sets the hour of a date object.
      starts.setHours(1);
      const ends = this.lastSunday(9, date.getFullYear());
      return date.getTime() >= starts.getTime() && date.getTime() < ends.getTime();
    } catch (error) {
      cloudWatchLogger.log('ERROR', {
        'event': 'isBST method of DateUtil',
        'error': error
      });
      throw new Error('Error in isBST method of DateUtil.');
    }
  };
  // Checks for the last sunday of any given month of the given year.
  lastSunday(month, year) {
    try {
      var date = new Date();
      var lastDayOfMonth = new Date(Date.UTC(year || date.getFullYear(), month + 1, 0));
      var day = lastDayOfMonth.getDay();
      return new Date(Date.UTC(lastDayOfMonth.getFullYear(), lastDayOfMonth.getMonth(), lastDayOfMonth.getDate() - day));
    } catch (error) {
      cloudWatchLogger.log('ERROR', {
        'event': 'lastSunday method of DateUtil',
        'error': error
      });
      throw new Error('Error in lastSunday method of DateUtil.');
    }
  };
}

// Export the DateUtil object.
module.exports = new DateUtil();