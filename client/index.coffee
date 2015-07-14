Template.gradeItem.onRendered ->
	el = @find('div.label')
	if el?
		$(el).popup({})

Template.gradeItem.helpers
	lineStyle: ->
		user = Meteor.user()
		styles = []

		if @semester is 'E'
			styles.push 'background-color: #DBEAFF'
		else if @semester % 2 is 0
			styles.push 'background-color: #f1f1f1'

		switch user.grade?[@_id]
			when 'done'
				styles.push 'color: lightgray'
			when 'doing'
				styles.push 'color: orange'

		return styles.join '; '

	isSelected: (status) ->
		user = Meteor.user()
		if user.grade?[@_id] is status
			return {
				selected: true
			}

	getGradeItemByCode: (code) ->
		return Grade.findOne({code: parseInt(code)})

	requirementColor: (_id) ->
		user = Meteor.user()
		switch user.grade?[_id]
			when 'done'
				return 'grey'
			when 'doing'
				return 'orange'
			else
				return 'red'


Template.gradeItem.events
	'change select': (e) ->
		status = $(e.target).val()
		Meteor.call 'updateGradeItem', @_id, status




Template.grade.onCreated ->
	@subscribe 'Grade'
	@subscribe 'userGradeInfo'

Template.grade.helpers
	grade: ->
		return Grade.find({course: 'SI'})
