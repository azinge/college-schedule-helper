"use strict";
var CourseJS = {};

/**
 * Class representing an entry.
 * @prop {String} alias A unique ID to reference this entry.
 * @prop {TimeSet} times A TimeSet listing the times during the week that this entry takes place.
 * @prop {Info} info An Info property that lists extra information about the particular entry.
 */
CourseJS.Entry = class Entry {
    /**
     * Create an entry.
     * @param {String} alias A unique ID to reference this entry.
     * @param {TimeSet} times A TimeSet listing the times during the week that this entry takes place.
     * @param {Info} info An Info property that lists extra information about the particular entry.
     */
    constructor (alias, times, info) {
        if (typeof alias != 'string' || !(times instanceof CourseJS.TimeSet) || !(info instanceof CourseJS.Info)) {
            throw new Error('Error in Entry constructor: please use the format Entry(String, TimeSet, Info)');
        }

        this.alias = alias;
        this.times = times;
        this.info = info;
    }

    /**
     * Gets the overlapping TimeSet between this entry and another entry.
     * @param {Entry} entry The entry to be compared against.
     * @return {TimeSet|undefined} A time set with the overlapping times between the two entries.
     */
    getOverlappingTimeSet (entry) {
        var theseTimes = this.times.getTimes();
        var entryTimes = entry.times.getTimes();
        var newTimeSet = new CourseJS.TimeSet();

        for (var i = 0; i < theseTimes.length; i++) {
            for (var j = 0; j < entryTimes.length; j++) {
                if (! entryTimes[j].getOverlap(theseTimes[i]).isTBA()) {
                    newTimeSet.insert(entryTimes[j].getOverlap(theseTimes[i]));
                }
            }
        }
        return newTimeSet;
    }

    /**
     * Gets information from this entry.
     * @return {Info} This entry's info property.
     */
    getInfo () {
        var copyInfo = Object.assign({}, this.info);
        return copyInfo;
    }
};

/**
 * Class representing a course.
 * @extends Info
 * @prop {String} alias A unique ID to reference this course.
 * @prop {TimeSet} times A TimeSet property listing the times during the week that this course takes place.
 * @prop {CourseInfo} info An Info property that lists extra information about the particular entry.
 */
CourseJS.Course = class Course extends CourseJS.Entry {
    /**
     * Create a course.
     * @param {String} alias A unique ID to reference this course.
     * @param {TimeSet} times A TimeSet property listing the times during the week that this course takes place.
     * @param {CourseInfo} info A CourseInfo property that lists information about this course.
     */
    constructor (alias, times, info) {
        super(alias, times, info);
    }

    /**
     * Gets course related information from this Entry.
     * @return {CourseInfo} This entry's courseInfo property.
     */
    getCourseInfo () {
        var copyInfo = Object.assign({}, this.info);
        return copyInfo;
    }
};

/**
 * Class representing a group of entries.
 * @prop {Array<Entry>} entries List of entries currently in this entry group.
 * @prop {String} title Name of the entry group.
 * @prop {number} selected An index for the entries array pointing to the currently selected entry.
 * @prop {Array<number>} active An array of indexes for the entries array pointing to the currently active entries.
 */
CourseJS.EntryGroup = class EntryGroup {
    /**
     * Create an entry group.
     * @param {Array<Entry>} entries List of entries to be included in this entry group.
     * @param {String|undefined} title Name of the entry group.
     */
    constructor (entries, title) {
        if (!entries || !title) {
            throw new Error('error in EntryGroup constructor: use the format EntryGroup(Array<Entry>, string)');
        }

        if (!(entries instanceof Array) || typeof title != 'string') {
            throw new Error('error in EntryGroup constructor: use the format EntryGroup(Array<Entry>, string)');
        }

        for (var i = 0; i < entries.length; i++) {
            if (!(entries[i] instanceof CourseJS.Entry)) {
                throw new Error('error in EntryGroup constructor: use the format EntryGroup(Array<Entry>, string)');
            }
        }

        this.entries = entries;
        this.title = title;
        this.selected = -1;
        this.active = [];
    }

    /**
     * Inserts an entry into this entry group.
     * @param {Entry} entry Entry to be inserted into this entry group.
     * @return {boolean} Value representing whether the entry was successfully able to be added.
     */
    insert (entry) {
        if (!entry || !(entry instanceof CourseJS.Entry)) {
            return false;
        }

        for (var i = 0; i < this.entries.length; i++) {
            if (entry.alias === this.entries[i].alias) {
                return false;
            }
        }

        this.entries[this.entries.length] = entry;
        return true;
    }

    /**
     * Sets an entry to be this entry group's selected entry.
     * @param {Entry|undefined} entry Entry to be selected by this entry group.
     * @return {boolean} Value representing whether the entry was successfully able to be selected.
     */
    select (entry) {
        if (!entry || !(entry instanceof CourseJS.Entry)) {
            return false;
        }

        for (var i = 0; i < this.entries.length; i++) {
            if (entry.alias === this.entries[i].alias) {
                this.selected = i;
                return true;
            }
        }

        return false;
    }

    /**
     * Activates all matching entries in this entry group.
     * @param {Array<Entry>} entries Array of entries to be activated.
     */
    activate (entries) {
        if (!(entries instanceof Array)) {
            throw new Error('error in EntryGroup.activate(entries): entries must be an array');
        }

        for (var i = 0; i < entries.length; i++) {
            if (!(entries[i] instanceof CourseJS.Entry)) {
                throw new Error('error in EntryGroup.activate(entries): entries must be an array of entries')
            }

            for (var j = 0; j < this.entries.length; j++) {
                if (entries[i].alias === this.entries[j].alias) {
                    var alreadyActive = false;
                    for (var k = 0; k < this.active.length && !alreadyActive; k++) {
                        if (j === this.active[k]) {
                            alreadyActive = true;
                        }
                    }

                    if (!alreadyActive) {
                        this.active.push(j);
                    }
                }
            }
        }
    }

    /**
     * Deactivates all matching entries in this entry group.
     * @param {Array<Entry>} entries Array of entries to be deactivated.
     */
    deactivate (entries) {
        if (!(entries instanceof Array)) {
            throw new Error('error in EntryGroup.activate(entries): entries must be an array');
        }

        for (var i = 0; i < entries.length; i++) {
            if (!(entries[i] instanceof CourseJS.Entry)) {
                throw new Error('error in EntryGroup.activate(entries): the elements of entries must be entries')
            }

            for (var j = 0; j < this.active.length; j++) {
                if (entries[i].alias === this.entries[this.active[j]].alias) {
                    this.active.splice(j, 1);
                    j--;
                }
            }
        }
    }

    /**
     * Gets this entry group's selected entry.
     * @return {Entry|undefined} This entry group's selected entry.
     */
    getSelectedEntry () {
        return this.entries[this.selected];
    }

    /**
     * Gets this entry group's activated entries.
     * @return {Array<Entry>|undefined} Array of activated entries in this entry group.
     */
    getActivatedEntries () {
        return this.active;
    }

    /**
     * Gets the overlapping time sets between an entry and the entry group's selected entry.
     * @param {Course} entry The entry to be compared against.
     * @return {Array<TimeSet>} An array of time sets overlapping between an entry and this entry group's selected entry.
     */
    getOverlappingTimeSets (entry) {
        if (!(entry instanceof CourseJS.Entry)) {
            throw new Error('error in EntryGroup.getOverlappingTimeSets(entry): the argument must be an entry');
        }

        var overlappingTimeSets = [];

        for (var i = 0; i < this.active.length; i++) {
            overlappingTimeSets.push(entry.getOverlappingTimeSet(this.entries[this.active[i]]));
        }

        return overlappingTimeSets;
    }

    /**
     * Checks if this entry group's selected entry and another entry group's active entries are compatible with one another.
     * @param {EntryGroup} entryGroup The entry group to be compared against.
     * @return {boolean} Value representing whether the two entry groups are compatible.
     */
    isCompatibleWithEntryGroup (entryGroup) {
        if (this.getSelectedEntry === undefined) {
            throw new Error('error in EntryGroup.isCompatibleWithEntryGroup(otherEntryGroup): Entry Group must have a selected entry')
        }

        if (!(entryGroup instanceof CourseJS.EntryGroup)) {
            throw new Error('error in EntryGroup.isCompatibleWithEntryGroup(otherEntryGroup): the argument must be an Entry Group')
        }

        var overlappingTimeSets = entryGroup.getOverlappingTimeSets(this.getSelectedEntry());

        for (var i = 0; i < overlappingTimeSets.length; i++) {
            for (var day in overlappingTimeSets[i].days) {
                if (overlappingTimeSets[i].days[day][0]) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Gets all of this entry group's selected entry's information.
     * @return {Info} This entry group's selected entry's Info property.
     */
    getInfo () {
        return this.getSelectedEntry() === undefined ? undefined : this.getSelectedEntry().getInfo();
    }
};

/**
 * Class representing a schedule.
 * @prop {String} owner The user who this schedule belongs to.
 * @prop {String} title The title that the user gives to the Schedule.
 * @prop {Array<Entry|EntryGroup>} items The items making up the schedule.
 */
CourseJS.Schedule = class Schedule {
    /**
     * Create a schedule.
     * @param {String} owner The owner of this schedule.
     * @param {String} title The title of this schedule.
     * @param {Array<Entry|EntryGroup>} items The items making up the schedule.
     */
    constructor (owner, title, items) {
        this.owner = owner;
        this.title = title;
        this.items = items;
    }

    /**
     * Gets all of this schedule's entries and entry groups.
     * @param {TimeSet|undefined} restriction Optional time set used to bound the search.
     * @return {Array<Entry|EntryGroup>} An array of items making up the schedule.
     */
    getItems (restriction) {
        //TODO: Implement Function
    }

    /**
     * Gets all of this schedule's entries and entry groups occuring on a certain day.
     * @param {Day} day Day used to search for entries.
     * @param {TimeSet|undefined} restriction Optional time set used to bound the search.
     * @return {Array<Entry|EntryGroup>} An array of items making up the schedule occuring on a certain day.
     */
    getItemsForDay (day, restriction) {
        //TODO: Implement Function
    }

    /**
     * Gets a time set containing all of the free time in this schedule
     * @param {TimeSet|undefined} restriction Optional time set used to bound the search.
     * @return {TimeSet} A time set making up all of the free time in the schedule.
     */
    getFreeTime (restriction) {
        //TODO: Implement Function
    }
};

/**
 * Class representing a time set.
 * @prop {Object} days An object whose properties are days and whose values are arrays of times starting on that day.
 */
CourseJS.TimeSet = class TimeSet {
    /**
     * Create a time set.
     * TBA time sets will be represented as empty time sets.
     * @param {Array<Time>|undefined} times An array of times comprising the time set.
     */
    constructor (times) {
        this.days = {Sun: [], Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: []};

        // if no params, creates TBA time set
        if (!times) {
            return;
        }

        if (!(times instanceof Array)) {
            throw new Error('Error in TimeSet Constructor: please use format TimeSet(Array<Time>)');
        }

        for (var i = 0; i < times.length; i++) {
            if (!(times[i] instanceof CourseJS.Time) && times[i]) {
                throw new Error('Error in TimeSet Constructor: please use format TimeSet(Array<Time>)');
            }
            if (!this.insert(times[i])) {
                throw new Error('Error in TimeSet Constructor: TimeSet cannot have overlapping times');
            }
        }
    }

    /**
     * Inserts a time into the time set.
     * Will split times crossing midnight into multiple separate times.
     * @param {Time} time Time to be added to this time set.
     * @return {boolean} Value representing whether the time was successfully added.
     */
    insert (time) {
        if (!time) {
            return true;
        }

        if (!(time instanceof CourseJS.Time)) {
            throw new Error('Error in TimeSet.insert: please only insert time objects');
        }

        for (var i = 0; i < this.days[time.start.day].length; i++){
            if (!time.getOverlap(this.days[time.start.day][i]).isTBA()) {
                return false;
            }
        }

        this.days[time.start.day].push(time);
        return true;
    }

    /**
     * Gets all of this time set's times.
     * @param {TimeSet|undefined} restriction Optional time set used to bound the search.
     * @return {Array<Time>} An array of all of the times making up the time set.
     */
    getTimes (restriction) {

        var restrictionTimes = [];
        if (restriction) {
            if (!(restriction instanceof CourseJS.TimeSet)) {
                throw new Error('Error in TimeSet.getTimes(restriction): the restriction must either be undefined or a TimeSet');
            } else {
                restrictionTimes = restriction.getTimes();
            }
        }

        var allTimes = [];
        for (var day in this.days) {
            for (var i = 0; i < this.days[day].length; i++) {
                var notRestricted = true;
                for (var j = 0; j < restrictionTimes.length && notRestricted; j++) {
                    if (!this.days[day][i].getOverlap(restrictionTimes[j]).isTBA()) {
                        notRestricted = false;
                    }
                }
                if (notRestricted) {
                    allTimes.push(this.days[day][i]);
                }
            }
        }
        return allTimes;
    }

    /**
     * Gets all of this time set's times.
     * @param {Day} day Day used to search for entries.
     * @param {TimeSet|undefined} restriction Optional time set used to bound the search.
     * @return {Array<Time>} An array of all of the times making up the time set on a certain day.
     */
    getTimesByDay (day, restriction) {
        var restrictionTimes = [];
        if (restriction) {
            if (!(restriction instanceof CourseJS.TimeSet)) {
                throw new Error('Error in TimeSet.getTimes(restriction): the restriction must either be undefined or a TimeSet');
            } else {
                restrictionTimes = restriction.getTimes();
            }
        }

        var allTimes = [];
        for (var i = 0; i < this.days[day].length; i++) {
            var notRestricted = true;
            for (var j = 0; j < restrictionTimes.length && notRestricted; j++) {
                if (this.days[day][i].getOverlap(restrictionTimes[j]) !== CourseJS.Time.TBA) {
                    notRestricted = false;
                }
            }
            if (notRestricted) {
                allTimes.push(this.days[day][i]);
            }
        }
        return allTimes;
    }
};

/**
 * Class representing a time.
 * @prop {Moment} start The moment this time starts.
 * @prop {Moment} end The moment this time ends.
 */
CourseJS.Time = class Time {
    /**
     * Create a time.
     * TBA times will be represented as empty objects.
     * @param {Moment} start The moment this time starts.
     * @param {Moment} end The moment this time ends.
     */
    constructor (start, end) {
        // create a TBA timeSet if no params given
        if (!start && !end) {
            return;
        }

        // throw an error if start or end are not Moments
        if (typeof start != 'object' || !start.day || (!start.time && start.time !== 0) ||
                typeof end != 'object' || !end.day || (!end.time && end.time !== 0)) {
            throw new Error('error in Time constructor: start and end must be of type Moment');
        }

        if (start.day !== end.day) {
            throw new Error('error in Time constructor: start and end moments cannot be on different days');
        }

        // throw error if start and end are the same Moment
        if (start.time === end.time) {
            throw new Error('error in Time constructor: start and end cannot be the same Moment');
        }

        // throw error if start or end have incorrect numbers represeting a military time
        if (start.time >= 2400 || start.time < 0 || start.time % 100 >= 60 || start.time % 1 !== 0 ||
                end.time >= 2400 || end.time < 0 || end.time % 100 >= 60 || end.time % 1 !== 0) {
            throw new Error('error in Time constructor: start and end must have military times for their times');
        }

        // throw error if start or end have strings that aren't real days
        if (start.day !== 'Sun' && start.day !== 'Mon' && start.day !== 'Tue' && start.day !== 'Wed' && start.day !== 'Thu' && start.day !== 'Fri' && start.day !== 'Sat') {
            throw new Error('error in Time constructor: days must be one of the following {Sun, Mon, Tue, Wed, Thu, Fri, Sat, Sun}');
        }

        this.start = start;
        this.end = end;
    }

    /**
     * Gets this time's overlap with another time.
     * @param {Time} time The time to be compared against.
     * @return {Time} time The time where the two times overlap.
     */
    getOverlap (time) {
        if (this.start.day !== time.start.day) {
            return new Time();
        }

        var lastStartTime = (this.start.time > time.start.time ? this.start : time.start);
        var firstEndTime = (this.end.time < time.end.time ? this.end : time.end);
        return lastStartTime.time < firstEndTime.time ? new Time(lastStartTime, firstEndTime) : new Time();
    }

    /**
     * returns whether or not this time is a TBA Time object.
     * @return {Time} boolean The boolean for wheter or not this time is a TBA Time Object.
     */
    isTBA () {
        for (var prop in this) {
            return false;
        }
        return true;
    }
};

/**
 * Class representing an entry's information.
 * @prop {InfoProp} searchable The searchable properties of this info.
 * @prop {InfoProp} regular The regular properties of this info.
 * @prop {InfoProp} hidden The hidden properties of this info.
 */
CourseJS.Info = class Info {
    /**
     * Create an info.
     * @param {InfoProp} searchable The searchable properties of this info.
     * @param {InfoProp} regular The regular properties of this info.
     * @param {InfoProp} hidden The hidden properties of this info.
     */
    constructor (searchable, regular, hidden) {
        if (typeof searchable !== 'object' || typeof regular !== 'object' || typeof hidden !== 'object') {
            throw new Error('error in Info constructor: input for InfoProps should be objects');
        }
        this.searchable = searchable;
        this.regular = regular;
        this.hidden = hidden;
    }
};

/**
 * Class representing a course's information.
 * @extends Info
 * @prop {InfoProp} searchable The searchable properties of this info.
 * @prop {InfoProp} regular The regular properties of this info.
 * @prop {InfoProp} hidden The hidden properties of this info.
 * @prop {String} number This course's number.
 * @prop {String} section This course's section.
 * @prop {String} subject This course's subject.
 */
CourseJS.CourseInfo = class CourseInfo extends CourseJS.Info {
    /**
     * Create a course info.
     * @param {InfoProp} searchable The searchable properties of this info.
     * @param {InfoProp} regular The regular properties of this info.
     * @param {InfoProp} hidden The hidden properties of this info.
     * @param {String} number This course's number.
     * @param {String} section This course's section.
     * @param {String} subject This course's subject.
     */
    constructor (searchable, regular, hidden, number, section, subject) {
        if (typeof number !== 'string' || typeof section !== 'string' || typeof subject !== 'string') {
            throw new Error('error in CourseInfo constructor: input for number, section, and subject should be strings');
        }

        super(searchable, regular, hidden);
        this.number = number;
        this.section = section;
        this.subject = subject;
    }

    /**
     * Creates an info object without this course's course dependent properties.
     * @return {Info} An Info object without course dependent properties.
     */
    getNonCourseInfo () {
        return new CourseJS.Info(this.searchable, this.regular, this.hidden);
    }
};

/**
 * Class representing a course lookup.
 * @prop {Object} aliasMap A hashmap whose properties are aliases and whose values are their respective courses.
 * @prop {Object} dictionary A dictionary navigatable through the form: dictionary[{search term}][{search match}].
 */
CourseJS.CourseLookup = class CourseLookup {
    /**
     * Create a course lookup.
     */
    constructor () {
        this.aliasMap = {};
        this.dictionary = {};
    }

    /**
     * Inserts a course into this course lookup.
     * @param {Course} course Course to be added to this course lookup.
     * @return {boolean} Value representing whether the course was successfully added.
     */
    insert (course) {
        //TODO: Implement Function
    }

    /**
     * Gets a course from this course lookup using it's alias.
     * @param {String} alias Alias to use when searching for course.
     * @return {Course} The course associated with the given alias.
     */
    getCourseByAlias (alias) {
        //TODO: Implement Function
    }

    /**
     * Finds the other sections of a course and puts them into an entry group.
     * @param {Course} course Course to search for other sections of.
     * @return {EntryGroup} An entry group consisting of the given course and it's other sections.
     */
    findOtherSectionsOfCourse (course) {
        //TODO: Implement Function
    }

    /**
     * Finds all courses that match a given search query.
     * @param {SearchQuery} searchQuery A search query to be applied to the course lookup.
     * @return {Array<Course>} An array consisting of all the courses that match the given search query.
     */
    findMatchingCourses (searchQuery) {
        //TODO: Implement Function
    }
};

/**
 * Class representing a search query.
 * @prop {Object} data A dictionary whose properties are search terms and whose values are strings containing a search match.
 *                     Search Match can have tags and other delimiters to be formatted. (To Be Implemented Later)
 */
CourseJS.SearchQuery = class SearchQuery {
    /**
     * Create a search query.
     * @param {Object} data The Data to be used to build the search query.
     */
    constructor (data) {
        this.data = data;
        this.formatData();
    }

    /**
     * Interprets this search query's data and formats it.
     */
    formatData () {
        //TODO: Implement Function
    }
};

/**
 * A string representing a day of the week:
 * {Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat"}.
 * @typedef {String} Day
 */

/**
 * An object representing a particular time.
 * @typedef {Object} Moment
 * @prop {Day} day The day this moment takes place on.
 * @prop {number} time The time this moment takes place; formatted in military time.
 */

/**
 * An object for use with info whose property:value pairs are the pieces of data.
 * Searchable info props will be added as "search term":"search match" pairs in a course lookup.
 * Regular info props have no special properties.
 * Hidden info props should not be displayed to the user and are solely used for record keeping.
 * @typedef {Object} InfoProp
 */

/**
 * Creates a course lookup from an array of functions.
 * @param {Array<Course>} courses The array of courses to use to build the course lookup.
 * @return {CourseLookup} The course lookup with all of the courses inserted.
 */
CourseJS.generateCourseLookup = function (courses) {
    //TODO: Implement Function
};

/**
 * Creates an array of possible schedules from an array of entries and entry groups.
 * @param {Array<Entry|EntryGroup>} entryArray The array of entries and entry groups for building the possible schedules.
 * @return {Array<Schedule>} The array of possible schedules from the given entries.
 */
CourseJS.generateScheduleListFromEntries = function (entryArray) {
    //TODO: Implement Function
};

export default CourseJS;
