"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleDeleteNotificationJob = exports.scheduleGoalSubmitReminderNotificationJob = exports.scheduleFreeTrialExpirationNotificationJob = void 0;
const constants = __importStar(require("../constants"));
const helperFunction = __importStar(require("../utils/helperFunction"));
const models_1 = require("../models");
const employee_1 = require("../models/employee");
const notification_1 = require("../models/notification");
const teamGoal_1 = require("../models/teamGoal");
const teamGoalAssign_1 = require("../models/teamGoalAssign");
const teamGoalAssignCompletionByEmployee_1 = require("../models/teamGoalAssignCompletionByEmployee");
const schedule = require('node-schedule');
const Sequelize = require('sequelize');
var Op = Sequelize.Op;
/*
* function to schedule job
*/
exports.scheduleFreeTrialExpirationNotificationJob = () => __awaiter(void 0, void 0, void 0, function* () {
    schedule.scheduleJob('0 7 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        let employers = yield helperFunction.convertPromiseToObject(yield models_1.employersModel.findAll({
            where: {
                status: constants.STATUS.active,
                subscription_type: constants.EMPLOYER_SUBSCRIPTION_TYPE.free
            }
        }));
        for (let employer of employers) {
            if (employer.free_trial_status == constants.EMPLOYER_FREE_TRIAL_STATUS.on_going) {
                let trialExpiryDate = new Date(employer.free_trial_start_datetime);
                trialExpiryDate.setDate(trialExpiryDate.getDate() + 14);
                const timeRemaining = Math.floor((trialExpiryDate.getTime() - (new Date()).getTime()) / 1000);
                if (Math.floor(timeRemaining / 3600) <= 72 && Math.floor(timeRemaining / 3600) >= 0) {
                    let notificationObj = {
                        type_id: employer.id,
                        sender_id: employer.id,
                        reciever_id: employer.id,
                        reciever_type: constants.NOTIFICATION_RECIEVER_TYPE.employer,
                        type: constants.NOTIFICATION_TYPE.expiration_of_free_trial,
                        data: {
                            type: constants.NOTIFICATION_TYPE.expiration_of_free_trial,
                            title: 'Reminder',
                            message: `Employer free trial of 14 days is going to expire in ${Math.floor(timeRemaining / 3600)} hour(s)`,
                            senderEmplyeeData: employer
                        },
                    };
                    yield notification_1.notificationModel.create(notificationObj);
                    if (!employer.device_token)
                        continue;
                    //send push notification
                    let notificationData = {
                        title: 'Reminder',
                        body: `Employer free trial of 14 days is going to expire in ${Math.floor(timeRemaining / 3600)} hour(s)`,
                        data: {
                            type: constants.NOTIFICATION_TYPE.expiration_of_free_trial,
                            title: 'Reminder',
                            message: `Employer free trial of 14 days is going to expire in ${Math.floor(timeRemaining / 3600)} hour(s)`,
                            senderEmplyeeData: employer
                        },
                    };
                    yield helperFunction.sendFcmNotification([employer.device_token], notificationData);
                }
                else if (Math.floor(timeRemaining / 3600) < 0) {
                    yield models_1.employersModel.update({
                        subscription_type: constants.EMPLOYER_SUBSCRIPTION_TYPE.no_plan,
                        free_trial_status: constants.EMPLOYER_FREE_TRIAL_STATUS.over,
                    }, {
                        where: {
                            id: parseInt(employer.id),
                        }
                    });
                }
            }
        }
    }));
    console.log("Free trial expiration notification cron job started!");
    return true;
});
/*
* function to schedule job
*/
exports.scheduleGoalSubmitReminderNotificationJob = () => __awaiter(void 0, void 0, void 0, function* () {
    schedule.scheduleJob('0 10 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        teamGoalAssign_1.teamGoalAssignModel.hasOne(teamGoal_1.teamGoalModel, { foreignKey: "id", sourceKey: "goal_id", targetKey: "id" });
        teamGoalAssign_1.teamGoalAssignModel.hasOne(employee_1.employeeModel, { foreignKey: "id", sourceKey: "employee_id", targetKey: "id" });
        teamGoal_1.teamGoalModel.hasOne(employee_1.employeeModel, { foreignKey: "id", sourceKey: "manager_id", targetKey: "id" });
        teamGoalAssign_1.teamGoalAssignModel.hasMany(teamGoalAssignCompletionByEmployee_1.teamGoalAssignCompletionByEmployeeModel, { foreignKey: "team_goal_assign_id", sourceKey: "id", targetKey: "team_goal_assign_id" });
        let employees = yield helperFunction.convertPromiseToObject(yield employee_1.employeeModel.findAll({
            where: {
                status: constants.STATUS.active,
            }
        }));
        for (let employee of employees) {
            let goals = yield helperFunction.convertPromiseToObject(yield teamGoalAssign_1.teamGoalAssignModel.findAll({
                where: { employee_id: employee.id },
                include: [
                    {
                        model: teamGoal_1.teamGoalModel,
                        required: false,
                    },
                    {
                        model: teamGoalAssignCompletionByEmployee_1.teamGoalAssignCompletionByEmployeeModel,
                        separate: true,
                        required: false,
                        order: [["createdAt", "DESC"]]
                    }
                ],
                order: [["createdAt", "DESC"]]
            }));
            let isActiveInPastTenDays = true;
            let employeeLastGoalReminderDate = new Date(employee.last_goal_reminder_datetime);
            for (let goal of goals) {
                let goalEndDate = new Date(goal.team_goal.end_date);
                let employeeLastSubmitReminderDate = new Date(goal.last_submit_reminder_datetime);
                let employeeLastActivityDate = ((_a = goal.team_goal_assign_completion_by_employees[0]) === null || _a === void 0 ? void 0 : _a.updatedAt) && new Date(goal.team_goal_assign_completion_by_employees[0].updatedAt);
                let timeDiff = Math.floor((goalEndDate.getTime() - (new Date()).getTime()) / 1000);
                if (parseInt(goal.team_goal.enter_measure) > parseInt(goal.complete_measure)) {
                    if (timeDiff > 0) {
                        if (employeeLastActivityDate) {
                            timeDiff = Math.floor(((new Date()).getTime() - employeeLastActivityDate.getTime()) / 1000);
                        }
                        if (!employeeLastActivityDate || timeDiff > 864000) {
                            isActiveInPastTenDays = false;
                        }
                        if (!employeeLastActivityDate || timeDiff > 604800) {
                            timeDiff = Math.floor(((new Date()).getTime() - employeeLastSubmitReminderDate.getTime()) / 1000);
                            if (timeDiff > 420) {
                                let notificationObj = {
                                    type_id: employee.id,
                                    sender_id: employee.id,
                                    reciever_id: employee.id,
                                    reciever_type: constants.NOTIFICATION_RECIEVER_TYPE.employee,
                                    type: constants.NOTIFICATION_TYPE.goal_submit_reminder,
                                    data: {
                                        type: constants.NOTIFICATION_TYPE.goal_submit_reminder,
                                        title: 'Reminder',
                                        message: `You have not filled anything in respect of goal ${goal.team_goal.title} in past 7 days.`,
                                        senderEmplyeeData: employee
                                    },
                                };
                                yield notification_1.notificationModel.create(notificationObj);
                                if (!employee.device_token)
                                    continue;
                                //send push notification
                                let notificationData = {
                                    title: 'Reminder',
                                    body: `You have not filled anything in respect of goal ${goal.team_goal.title} in past 7 days.`,
                                    data: {
                                        type: constants.NOTIFICATION_TYPE.goal_submit_reminder,
                                        title: 'Reminder',
                                        message: `You have not filled anything in respect of goal ${goal.team_goal.title} in past 7 days.`,
                                        senderEmplyeeData: employee
                                    },
                                };
                                yield helperFunction.sendFcmNotification([employee.device_token], notificationData);
                                yield teamGoalAssign_1.teamGoalAssignModel.update({
                                    last_submit_reminder_datetime: new Date(),
                                }, {
                                    where: {
                                        id: goal.id
                                    }
                                });
                            }
                        }
                    }
                }
            }
            let timeDiff = Math.floor(((new Date()).getTime() - employeeLastGoalReminderDate.getTime()) / 1000);
            if (timeDiff > 864000) {
                isActiveInPastTenDays = false;
            }
            else {
                isActiveInPastTenDays = true;
            }
            if (!isActiveInPastTenDays && goals && goals.length > 0) {
                let notificationObj = {
                    type_id: employee.id,
                    sender_id: employee.id,
                    reciever_id: employee.id,
                    reciever_type: constants.NOTIFICATION_RECIEVER_TYPE.employee,
                    type: constants.NOTIFICATION_TYPE.goal_submit_reminder,
                    data: {
                        type: constants.NOTIFICATION_TYPE.goal_submit_reminder,
                        title: 'Reminder',
                        message: `You have not filled anything in respect of any goal in past 10 days.`,
                        senderEmplyeeData: employee
                    },
                };
                yield notification_1.notificationModel.create(notificationObj);
                if (!employee.device_token)
                    continue;
                //send push notification
                let notificationData = {
                    title: 'Reminder',
                    body: `You have not filled anything in respect of any goal in past 10 days.`,
                    data: {
                        type: constants.NOTIFICATION_TYPE.goal_submit_reminder,
                        title: 'Reminder',
                        message: `You have not filled anything in respect of any goal in past 10 days.`,
                        senderEmplyeeData: employee
                    },
                };
                yield helperFunction.sendFcmNotification([employee.device_token], notificationData);
                yield employee_1.employeeModel.update({
                    last_goal_reminder_datetime: new Date(),
                }, {
                    where: {
                        id: employee.id
                    }
                });
            }
        }
    }));
    console.log("Goal submit reminder notification cron job has started!");
    return true;
});
exports.scheduleDeleteNotificationJob = () => __awaiter(void 0, void 0, void 0, function* () {
    schedule.scheduleJob('0 */24 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        let dateBeforeTenDays = new Date((new Date()).setDate(new Date().getDate() - 10));
        notification_1.notificationModel.destroy({
            where: {
                createdAt: {
                    [Op.lt]: dateBeforeTenDays,
                },
                status: {
                    [Op.notIn]: [constants.STATUS.active]
                }
            }
        });
        let dateBeforeSixtyDays = new Date((new Date()).setDate(new Date().getDate() - 30));
        notification_1.notificationModel.destroy({
            where: {
                createdAt: {
                    [Op.lt]: dateBeforeSixtyDays,
                },
            }
        });
    }));
    console.log("Delete Notification cron job has started!");
    return true;
});
//# sourceMappingURL=cronJob.js.map