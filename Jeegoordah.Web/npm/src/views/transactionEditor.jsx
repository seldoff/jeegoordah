import 'bootstrap-datepicker'
import React from 'react'
import $ from 'jquery'
import {connect} from 'react-redux'
import classNames from 'classnames'
import _ from 'lodash'
import BroSelector from './broSelector'
import {formatDate} from '../utils'
import accounting from 'accounting'
import {get} from '../rest'

class CreateTransactionView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transaction: props.transaction || {}
        };
    }

    componentDidMount() {
        $(this.refs.dateInput)
            .datepicker({
                format: 'dd-mm-yyyy',
                autoclose: true,
                weekStart: 1
            })
            .on('changeDate', e => this.updateTransaction('date', formatDate(e.date)));
    }

    componentWillUnmount() {
        $(this.refs.dateInput).datepicker('destroy');
    }

    render() {
        return (
            <form>
                {this.renderDate()}
                {this.renderAmount()}
                {this.renderRate()}
                {this.renderSource()}
                {this.renderTarget()}
                {this.renderComment()}
            </form>
        );
    }

    renderDate() {
        return (
            <div className="form-group">
                <label>Date</label>
                <input className="form-control" type="text" name="date" ref="dateInput"
                       value={this.state.transaction.date} onChange={this.createChangeHandler('date')}/>
            </div>
        );
    }

    renderAmount() {
        const currencies = this.props.currencies.map(c => {
            const cx = {
                btn: true,
                'btn-default': true,
                active: this.state.transaction.currency === c.id
            };
            return (
                <label key={c.id} className={classNames(cx)} onClick={() => this.updateTransaction('currency', c.id)}>
                    {c.name}
                </label>
            );
        });
        
        return (
            <div className="form-group">
                <label>Amount</label>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="input-group">
                            <input className="form-control" type="text" name="amount"
                                   value={this.state.transaction.amount} onChange={this.createChangeHandler('amount')}/>
                            <span className="input-group-btn">
                                {currencies}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderRate() {
        const baseCurrency = _.find(this.props.currencies, {isBase: true}).name;
        const amountInBase = this.state.transaction.amount / this.state.transaction.rate;
        return (
            <div className="form-group">
                <div className="row">
                    <div className="col-sm-6" style={{paddingRight: '2px'}}>
                        <label>Rate to {baseCurrency}</label>
                        <input type="text" name="rate" className="form-control"
                               value={this.state.transaction.rate}
                               onChange={this.createChangeHandler('rate')}/>
                    </div>
                    <div className="col-sm-6" style={{paddingLeft: '2px'}}>
                        <label>Amount in {baseCurrency}</label>
                        <input type="text" className="form-control" disabled={true}
                               value={accounting.formatNumber(amountInBase, 2, ' ')}/>
                    </div>
                </div>
            </div>
        );
    }

    renderSource() {
        return (
            <div className="form-group">
                <label>Source</label>
                <BroSelector bros={this.props.bros} multiSelect={false}
                             selected={this.state.transaction.source}
                             onSelect={s => this.updateTransaction('source', s)}/>
            </div>
        )
    }

    renderTarget() {
        return (
            <div className="form-group">
                <label>Target</label>
                <BroSelector bros={this.props.bros} multiSelect={true}
                             selected={this.state.transaction.targets}
                             onSelect={ts => this.updateTransaction('targets', ts)}/>
            </div>
        )
    }

    renderComment() {
        return (
            <div className="form-group">
                <label>Comment</label>
                <textarea className="form-control" rows="3"
                          value={this.state.transaction.comment}
                          onChange={this.createChangeHandler('comment')} />
            </div>
        )
    }

    createChangeHandler(field) {
        return e => this.updateTransaction(field, e.target.value);
    }

    updateTransaction(field, val) {
        const transaction = {
            ...this.state.transaction,
            [field]: val
        };
        this.setState({transaction});
        if (['currency', 'date'].includes(field)) {

        }
    }
}

const stateToProps = (state, ownProps) => {
    return {
        currencies: state.data.currencies,
        bros: state.data.bros,
        ...ownProps
    }
};

export default connect(stateToProps)(CreateTransactionView)