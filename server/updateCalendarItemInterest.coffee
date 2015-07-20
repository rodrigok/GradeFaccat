Meteor.methods
	updateCalendarItemInterest: (calendarId, gradeItemId, shift, day, interested) ->
		if not this.userId?
			return

		update = {}
		update["calendar.#{calendarId}"] = "#{shift}#{day}-#{gradeItemId}"

		if interested is true
			Meteor.users.update(this.userId, $push: update)
		else
			Meteor.users.update(this.userId, $pull: update)

		count = Meteor.users.find(update, {fields: {_id: 1}}).count()

		query =
			_id: calendarId
			grade:
				$elemMatch:
					_id: gradeItemId
					day: day
					shift: shift

		update = {}
		update['grade.$.interested'] = count

		Calendar.update query, $set: update