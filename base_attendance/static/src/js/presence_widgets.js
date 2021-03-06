/* Copyright (c) 2004-2018 Odoo S.A.
   Copyright 2018 Kolushov Alexandr <https://it-projects.info/team/KolushovAlexandr>
   License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html). */
odoo.define('base_attendance.presence_widgets', function (require) {
"use strict";

var AbstractAction = require('web.AbstractAction');
var core = require('web.core');

var QWeb = core.qweb;
var _t = core._t;


var MyAttendances = AbstractAction.extend({
    events: {
        "click .o_hr_attendance_sign_in_out_icon": function() {
            this.$('.o_hr_attendance_sign_in_out_icon').attr("disabled", "disabled");
            this.update_attendance();
        },
    },

    start: function () {
        var self = this;

        var def = this._rpc({
                model: 'res.partner',
                method: 'search_read',
                args: [[['user_id', '=', this.getSession().uid]], ['attendance_state', 'name']],
            }).then(function (res) {
                if (_.isEmpty(res) ) {
                    self.$('.o_hr_attendance_employee').append(_t("Error : Could not find employee linked to user"));
                    return;
                }
                self.employee = res[0];
                self.$el.html(QWeb.render("HrAttendanceMyMainMenu", {widget: self}));
            });

        return $.when(def, this._super.apply(this, arguments));
    },

    update_attendance: function () {
        var self = this;
        this._rpc({
                model: 'res.partner',
                method: 'attendance_manual',
                args: [[self.employee.id], 'base_attendance.hr_attendance_action_my_attendances'],
            }).then(function(result) {
                if (result.action) {
                    self.do_action(result.action);
                } else if (result.warning) {
                    self.do_warn(result.warning);
                }
            });
    },
});

core.action_registry.add('base_attendance_my_attendances', MyAttendances);

return MyAttendances;

});
