import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import {
	Alert,
	Card,
	Icon,
	Tooltip,
	Select,
	Spin
} from 'antd';

class CalendarItemComponent extends Component {
	static propTypes = {
		gradeItem: PropTypes.any,
		calendarItem: PropTypes.any,
		calendar: PropTypes.object,
		updateInterest: PropTypes.func
	}

	state = {}

	updateInterest = (interested) => {
		const { gradeItem, calendarItem, calendar } = this.props;

		this.props.updateInterest(gradeItem, calendarItem, calendar, interested);
	}

	removeInterest() {
		this.updateInterest(false);
	}

	addInterest() {
		this.updateInterest(true);
	}

	render() {
		const { gradeItem, calendarItem } = this.props;

		const itemStatus = calendarItem.userStatus || 'pending';

		const actions = [];
		let description;

		if (itemStatus === 'pending') {
			if (calendarItem.userInterested) {
				actions.push(
					<Tooltip placement='bottom' title='Remover interesse'>
						<Icon type='heart' onClick={this.removeInterest.bind(this)} />
					</Tooltip>
				);
			} else {
				actions.push(
					<Tooltip placement='bottom' title='Marcar interesse'>
						<Icon type='heart-o' onClick={this.addInterest.bind(this)} />
					</Tooltip>
				);
			}
			// actions.push(<Icon type='ellipsis' />);
		}

		description = `Interessados: ${ calendarItem.interested }`;

		if (calendarItem.teacher && calendarItem.teacher.name) {
			description = <React.Fragment>
				<div>{description}</div>
				<div>Professor: {calendarItem.teacher.name}</div>
			</React.Fragment>;
		}

		return (
			<Card
				className={`card-${ itemStatus }`}
				actions={actions}
			>
				<Card.Meta
					title={gradeItem.name}
					description={description}
				/>
			</Card>
		);
	}
}

class CalendarComponent extends Component {
	static propTypes = {
		data: PropTypes.object,
		updateCalendarItemInterest: PropTypes.func
	}

	state = {}

	static getDerivedStateFromProps(props) {
		const { data: { calendar } } = props;

		if (!calendar || !calendar.grade) {
			return {};
		}

		const shifts = [{
			shift: '1',
			name: 'Manhã'
		}, {
			shift: '2',
			name: 'Tarde'
		}, {
			shift: '3',
			name: 'Noite'
		}, {
			shift: '5',
			name: 'Vespertino'
		}];


		return {
			hasEAD: calendar.grade.filter(d => d.shift === '0').length > 0,
			shifts: shifts.filter(s => calendar.grade.filter(d => d.shift === s.shift).length)
		};
	}

	updateInterest = (gradeItem, calendarItem, calendar, interested) => {
		this.props.updateCalendarItemInterest({
			variables: {
				calendarId: calendar._id,
				gradeItemId: gradeItem._id,
				shift: calendarItem.shift,
				day: calendarItem.day,
				interested
			}
		}).then(() => {
			this.props.data.refetch();
		});
	}

	renderCalendarItem(shift, day) {
		const { data: { calendar } } = this.props;

		const grade = calendar.grade.filter(d => d.shift === shift && d.day === day);

		return grade.map(item => {
			if (item.grade.code) {
				return (
					<CalendarItemComponent
						key={item._id}
						gradeItem={item.grade}
						calendarItem={item}
						calendar={calendar}
						updateInterest={this.updateInterest}
					/>
				);
			}
		}).filter(i => i);
	}

	renderShifts() {
		return this.state.shifts.map(shit => (
			<React.Fragment key={shit.shift}>
				<tr className='shift-table-title-line'>
					<td colSpan='7'>
						<strong>Turno: {shit.name}</strong>
					</td>
				</tr>
				<tr className='shift-table-line'>
					<td>{this.renderCalendarItem.bind(this)(shit.shift, '2')}</td>
					<td>{this.renderCalendarItem.bind(this)(shit.shift, '3')}</td>
					<td>{this.renderCalendarItem.bind(this)(shit.shift, '4')}</td>
					<td>{this.renderCalendarItem.bind(this)(shit.shift, '5')}</td>
					<td>{this.renderCalendarItem.bind(this)(shit.shift, '6')}</td>
					<td>{this.renderCalendarItem.bind(this)(shit.shift, '7')}</td>
				</tr>
			</React.Fragment>
		));
	}

	renderEAD() {
		if (!this.state.hasEAD) {
			return;
		}

		return (
			<div className='ant-table ant-table-large ant-table-bordered ant-table-scroll-position-left'>
				<div className='ant-table-body'>
					<table>
						<thead className='ant-table-thead'>
							<tr>
								<th>EAD</th>
							</tr>
						</thead>
						<tbody className='ant-table-tbody'>
							<tr className='shift-table-line'>
								<td>
									{this.renderCalendarItem('0', '0')}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	}

	render() {
		const { data: { loading, error, calendar } } = this.props;

		if (loading) {
			return <Spin size='large' />;
		}

		if (error) {
			console.log(error);
			return <p>Error :(</p>;
		}

		if (!calendar) {
			return <Alert
				message='Erro'
				description='Nenhum calendário está ativo'
				type='error'
				showIcon
			/>;
		}

		return (
			<React.Fragment>
				{this.renderEAD()}

				<div className='ant-table ant-table-large ant-table-bordered ant-table-scroll-position-left'>
					<div className='ant-table-body'>
						<table>
							<thead className='ant-table-thead'>
								<tr>
									<th width='16.66%'>Segunda</th>
									<th width='16.66%'>Terça</th>
									<th width='16.66%'>Quarta</th>
									<th width='16.66%'>Quinta</th>
									<th width='16.66%'>Sexta</th>
									<th width='16.66%'>Sábado</th>
								</tr>
							</thead>
							<tbody className='ant-table-tbody'>
								{this.renderShifts()}
							</tbody>
						</table>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default compose(
	graphql(gql`
		query {
			calendar {
				_id
				grade {
					_id
					day
					shift
					interested
					teacher {
						name
					}
					userStatus
					userInterested
					grade {
						_id
						code
						name
					}
				}
			}
		}
	`),
	graphql(gql`
		mutation updateCalendarItemInterest(
			$calendarId: String!
			$gradeItemId: String!
			$shift: String!
			$day: String!
			$interested: Boolean!
		) {
			updateCalendarItemInterest(
				calendarId: $calendarId
				gradeItemId: $gradeItemId
				shift: $shift
				day: $day
				interested: $interested
			)
		}
	`, { name: 'updateCalendarItemInterest' })
)(CalendarComponent);
