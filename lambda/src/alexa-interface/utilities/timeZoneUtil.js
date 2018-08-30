const momentTimeZone = require('moment-timezone');
const moment = require('moment');
const dateUtil = require('./dateUtil');
const cloudWatchLogger = require('./cloudwatchLogger');

class TimeZoneUtil {
    // Get the current UTC date time in "'YYYY-MM-DD HH:mm" format.
    constructor(date) {
        try {
            this.currentTime = () => {
                return (date && typeof date === 'string') ? moment(date).format('YYYY-MM-DD HH:mm') : momentTimeZone().utc().format('YYYY-MM-DD HH:mm');
            }
        } catch (error) {
            cloudWatchLogger.log('ERROR', {
                'event': 'Constructor of TimeZoneUtil',
                'error': error
            });
            throw new Error('Error in constructor of TimeZoneUtil.');
        }
    };

    // Get the UTC timezone for "Europe/London".
    utcTimeZone() {
        try {
            return momentTimeZone.tz(this.currentTime(), 'Europe/London');
        } catch (error) {
            cloudWatchLogger.log('ERROR', {
                'event': 'utcTimeZone of TimeZoneUtil',
                'error': error
            });
            throw new Error('Error in utcTimeZone method of TimeZoneUtil.');
        }
    };

    // Get year, month, date and time of any given date.
    datePart() {
        try {
            return {
                'year': this.utcTimeZone().format('YYYY'),
                'month': this.utcTimeZone().format('MMMM'),
                'date': this.utcTimeZone().format('Do'),
                'time': dateUtil.isBST(this.utcTimeZone()) ? this.utcTimeZone().add(1, 'hours').format('LT') : this.utcTimeZone().format('LT')
            }
        } catch (error) {
            cloudWatchLogger.log('ERROR', {
                'event': 'datePart of TimeZoneUtil',
                'error': error
            });
            throw new Error('Error in datePart method of TimeZoneUtil.');
        }
    };

    // Get the placevalues of any given date.
    datePlaceValue() {
        try {
            return {
                'ones': Math.floor(this.datePart()['year'] % 10),
                'tens': Math.floor(this.datePart()['year'] / 10 % 10),
                'hundreds': Math.floor(this.datePart()['year'] / 100 % 10),
                'thousands': Math.floor(this.datePart()['year'] % 10000 / 1000)
            }
        } catch (error) {
            cloudWatchLogger.log('ERROR', {
                'event': 'datePlaceValue of TimeZoneUtil',
                'error': error
            });
            throw new Error('Error in datePlaceValue method of TimeZoneUtil.');
        }
    };
}

class DateFormatter {
    constructor() {

    };
    // Compose the welcome meaasge with the london time.
    welcomeMsg() {
        try {
            const timeZoneUtil = new TimeZoneUtil();
            return `It's ${timeZoneUtil.datePart()['time']} here in London on ${timeZoneUtil.datePart()['month']} the ${timeZoneUtil.datePart()['date']}, ${timeZoneUtil.datePlaceValue()['thousands']} thousand and ${timeZoneUtil.datePlaceValue()['tens']}${timeZoneUtil.datePlaceValue()['ones']}; and this is The Economist.`;
        } catch (error) {
            cloudWatchLogger.log('ERROR', {
                'event': 'welcomeMsg of DateFormatter',
                'error': error
            });
            throw new Error('Error in welcomeMsg method of DateFormatter.');
        }
    };
    formatPublishDate(date) {
        try {
            if (date && typeof date === 'string') {
                const timeZoneUtil = new TimeZoneUtil(date);
                return `${timeZoneUtil.datePart()['month']} the ${timeZoneUtil.datePart()['date']}, ${timeZoneUtil.datePlaceValue()['thousands']} thousand and ${timeZoneUtil.datePlaceValue()['tens']}${timeZoneUtil.datePlaceValue()['ones']}`;
            } else {
                return '';
            }
        } catch (error) {
            cloudWatchLogger.log('ERROR', {
                'event': 'formatPublishDate of DateFormatter',
                'error': error
            });
            throw new Error('Error in formatPublishDate method of DateFormatter.');
        }
    };
    formatCardDate(date){
        try {
            if (date && typeof date === 'string') {
                const timeZoneUtil = new TimeZoneUtil(date);
                return `${timeZoneUtil.datePart()['month']} ${timeZoneUtil.datePart()['date']} ${timeZoneUtil.datePart()['year']}`;
            } else {
                return '';
            }
        } catch (error) {
            cloudWatchLogger.log('ERROR', {
                'event': 'formatCardDate of DateFormatter',
                'error': error
            });
            throw new Error('Error in formatCardDate method of DateFormatter.');
        }
    }
}

// Export the Time Zone util object.
module.exports = new DateFormatter();