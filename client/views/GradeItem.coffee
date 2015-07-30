Template.GradeItem.onRendered ->
	@$('div.label').popup({})

Template.GradeItem.helpers
	lineStyle: ->
		user = Meteor.user()
		if Router.current().params.email?
			user = Meteor.users.findOne({'emails.address': Router.current().params.email})
		styles = []

		if @semester is 'E'
			styles.push 'background-color: #DBEAFF'
		else if @semester % 2 is 0
			styles.push 'background-color: #f1f1f1'

		itemStatus = user?.grade?[@_id]
		itemStatus ?= 'pending'

		switch itemStatus
			when 'done'
				styles.push 'color: lightgray'
			when 'doing'
				styles.push 'color: orange'

		filterStatus = Session.get('grade-filter-status')
		if filterStatus?
			if filterStatus isnt itemStatus
				styles.push 'display: none'

		return styles.join '; '

	isSelected: (status) ->
		user = Meteor.user()
		if user.grade?[@_id] is status
			return {
				selected: true
			}

	getGradeItemByCode: (code) ->
		grade = Session.get('grade').toUpperCase()

		query = {}
		query['code.' + grade] = code

		return getItemOfCourse Grade.findOne(query)

	requirementColor: (_id) ->
		user = Meteor.user()
		if Router.current().params.email?
			user = Meteor.users.findOne({'emails.address': Router.current().params.email})
		switch user?.grade?[_id]
			when 'done'
				return 'grey'
			when 'doing'
				return 'orange'
			else
				return 'red'

	canEdit: ->
		return Meteor.user()? and not Router.current().params.email?


Template.GradeItem.events
	'change select': (e) ->
		status = $(e.target).val()
		Meteor.call 'updateGradeItem', @_id, status

	'click .grade-item-name': (e) ->
		if @description?
			Session.set 'modalInfoTitle', @name
			Session.set 'modalInfoDescription', @description
			Session.set 'modalInfoShow', true
