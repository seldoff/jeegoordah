﻿define(['$', '_', 'analytics', 'rest', 'helper', 'transactionsList', 'entityControls', 'eventEditor', 'notification', 'consts', 'app-context', 'text!templates/event-details/module.html'],
function ($, _, analytics, rest, helper, transactionsList, entityControls, eventEditor, notification, consts, context, moduleTemplate) {
    var self = {        
        activate: function(id) {
            $.when(rest.get('events/' + id),
                   rest.get('events/' + id + '/transactions'))
            .done(function (event, transactions) {                
                self.event = event[0];
                analytics.page('Event ' + self.event.Name);
                self.transactions = transactions[0];
                self._render();
            });
        },
        
        _editEvent: function() {
            eventEditor.edit(self.event, context.bros, 'Edit Event', function (updatedEvent) {
                updatedEvent = _.extend(self.event, updatedEvent);
                rest.post('events/update', updatedEvent).done(function () {
                    eventEditor.close();
                    notification.success('Event updated');
                    self._render();
                });
            });
        },
        
        _deleteEvent: function () {            
            rest.post('events/delete/' + self.event.Id).done(function () {
                notification.success('Event deleted');
                self.module.fadeOut(consts.fadeDuration, function () {
                    require('nav').go('events');
                });
            });
        },

        _getUiEvent: function(restEvent) {
            var uiEvent = _.clone(restEvent);
            uiEvent.Description = helper.textToHtml(uiEvent.Description || '');
            uiEvent.Bros = _.chain(uiEvent.Bros).map(function (broId) {
                return _.find(context.bros, function (bro) { return bro.Id === broId; });
            }).sortBy('Name').value();            
            return uiEvent;
        },
        
        _render: function () {
            self.module = helper.template(moduleTemplate, self._getUiEvent(self.event));
            $('#modules').empty().append(self.module);
            self.module.find('#createTransactionButton').click(transactionsList.createTransaction);
            entityControls.render(self.module.find('.page-header>h1'), self._editEvent, self._deleteEvent);
            
            transactionsList.init({
                currencies: context.currencies,
                bros: context.bros,
                event: self.event,
                transactions: self.transactions,
                target: self.module.find('#transactions')
            });           
        }
    };

    return self;
})