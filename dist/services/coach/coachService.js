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
exports.CoachService = void 0;
const constants = __importStar(require("../../constants"));
const helperFunction = __importStar(require("../../utils/helperFunction"));
const coachSchedule_1 = require("../../models/coachSchedule");
const Sequelize = require('sequelize');
const moment = require("moment");
var Op = Sequelize.Op;
class CoachService {
    constructor() { }
    addSlot(params, user) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("add slot params", params);
            if (params.type == constants.COACH_SCHEDULE_TYPE.weekly && !params.day)
                throw new Error(constants.MESSAGES.coach_schedule_day_required);
            if (params.type == constants.COACH_SCHEDULE_TYPE.custom && ((_a = params.custom_dates) === null || _a === void 0 ? void 0 : _a.length) == 0)
                throw new Error(constants.MESSAGES.coach_schedule_custom_dates_required);
            let dates = [];
            switch (parseInt(params.type)) {
                case constants.COACH_SCHEDULE_TYPE.does_not_repeat:
                    dates.push(params.date);
                    break;
                case constants.COACH_SCHEDULE_TYPE.daily: {
                    let start = new Date(params.date);
                    let end = new Date(params.date);
                    end.setFullYear(start.getFullYear() + 1);
                    while (start < end) {
                        dates.push(moment(start).format("YYYY-MM-DD"));
                        start.setDate(start.getDate() + 1);
                    }
                    break;
                }
                case constants.COACH_SCHEDULE_TYPE.every_week_day: {
                    let start = new Date(params.date);
                    let end = new Date(params.date);
                    end.setFullYear(start.getFullYear() + 1);
                    while (start < end) {
                        if (![constants.COACH_SCHEDULE_DAY.saturday, constants.COACH_SCHEDULE_DAY.sunday].includes(parseInt(moment(start).format('d')))) {
                            dates.push(moment(start).format("YYYY-MM-DD"));
                        }
                        start.setDate(start.getDate() + 1);
                    }
                    break;
                }
                case constants.COACH_SCHEDULE_TYPE.weekly: {
                    let start = new Date(params.date);
                    let end = new Date(params.date);
                    end.setFullYear(start.getFullYear() + 7);
                    while (start < end) {
                        if (params.day == parseInt(moment(start).format('d'))) {
                            dates.push(moment(start).format("YYYY-MM-DD"));
                        }
                        start.setDate(start.getDate() + 1);
                    }
                    break;
                }
                case constants.COACH_SCHEDULE_TYPE.custom: {
                    for (let date of params.custom_dates) {
                        dates.push(date);
                    }
                    break;
                }
            }
            let schedule = yield coachSchedule_1.coachScheduleModel.findOne({
                where: {
                    coach_id: user.uid,
                    date: {
                        [Op.in]: dates,
                    },
                    [Op.or]: [
                        {
                            start_time: {
                                [Op.between]: [
                                    params.start_time,
                                    params.end_time,
                                ]
                            },
                        },
                        {
                            end_time: {
                                [Op.between]: [
                                    params.start_time,
                                    params.end_time,
                                ]
                            },
                        },
                    ],
                    status: {
                        [Op.notIn]: [constants.COACH_SCHEDULE_STATUS.passed]
                    }
                }
            });
            if (schedule)
                throw new Error(constants.MESSAGES.coach_schedule_already_exist);
            let schedules = [];
            let slot_group_id = yield helperFunction.getUniqueSlotGroupId();
            for (let date of dates) {
                schedules.push({
                    slot_group_id,
                    coach_id: user.uid,
                    date,
                    start_time: params.start_time,
                    end_time: params.end_time,
                    type: params.type,
                    day: params.type == constants.COACH_SCHEDULE_TYPE.weekly ? params.day : null,
                    custom_dates: params.type == constants.COACH_SCHEDULE_TYPE.custom ? params.custom_dates : null,
                });
            }
            return yield helperFunction.convertPromiseToObject(yield coachSchedule_1.coachScheduleModel.bulkCreate(schedules));
        });
    }
    getSlots(params, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let where = {
                coach_id: user.uid,
                status: {
                    [Op.notIn]: [constants.COACH_SCHEDULE_STATUS.passed]
                }
            };
            let start_date = new Date();
            let end_date = new Date();
            if (params.filter_key) {
                if (params.filter_key == "Daily") {
                    where = Object.assign(Object.assign({}, where), { date: moment(new Date()).format("YYYY-MM-DD") });
                }
                else if (params.filter_key == "Weekly") {
                    start_date = helperFunction.getMonday(start_date);
                    end_date = helperFunction.getMonday(start_date);
                    end_date.setDate(start_date.getDate() + 6);
                    where = Object.assign(Object.assign({}, where), { date: {
                            [Op.between]: [
                                moment(start_date).format("YYYY-MM-DD"),
                                moment(end_date).format("YYYY-MM-DD")
                            ]
                        } });
                }
                else if (params.filter_key == "Monthly") {
                    start_date.setDate(1);
                    end_date.setMonth(start_date.getMonth() + 1);
                    end_date.setDate(1);
                    end_date.setDate(end_date.getDate() - 1);
                    where = Object.assign(Object.assign({}, where), { date: {
                            [Op.between]: [
                                moment(start_date).format("YYYY-MM-DD"),
                                moment(end_date).format("YYYY-MM-DD")
                            ]
                        } });
                }
                else if (params.filter_key == "Yearly") {
                    start_date.setDate(1);
                    start_date.setMonth(0);
                    end_date.setDate(1);
                    end_date.setMonth(0);
                    end_date.setFullYear(end_date.getFullYear() + 1);
                    end_date.setDate(end_date.getDate() - 1);
                    where = Object.assign(Object.assign({}, where), { date: {
                            [Op.between]: [
                                moment(start_date).format("YYYY-MM-DD"),
                                moment(end_date).format("YYYY-MM-DD")
                            ]
                        } });
                }
            }
            else if (params.day && params.month && params.year) {
                where = Object.assign(Object.assign({}, where), { date: `${params.year}-${params.month}-${params.day}` });
            }
            else if (params.week && params.year) {
                where = {
                    [Op.and]: [
                        Object.assign({}, where),
                        Sequelize.where(Sequelize.fn("year", Sequelize.col("date")), "=", params.year),
                        Sequelize.where(Sequelize.fn("week", Sequelize.col("date")), "=", params.week),
                    ]
                };
            }
            else if (params.month && params.year) {
                where = {
                    [Op.and]: [
                        Object.assign({}, where),
                        Sequelize.where(Sequelize.fn("year", Sequelize.col("date")), "=", params.year),
                        Sequelize.where(Sequelize.fn("month", Sequelize.col("date")), "=", params.month),
                    ]
                };
            }
            else if (params.year) {
                where = {
                    [Op.and]: [
                        Object.assign({}, where),
                        Sequelize.where(Sequelize.fn("year", Sequelize.col("date")), "=", params.year),
                    ]
                };
            }
            else {
                start_date.setDate(1);
                end_date.setMonth(start_date.getMonth() + 1);
                end_date.setDate(1);
                end_date.setDate(end_date.getDate() - 1);
                where = Object.assign(Object.assign({}, where), { date: {
                        [Op.between]: [
                            moment(start_date).format("YYYY-MM-DD"),
                            moment(end_date).format("YYYY-MM-DD")
                        ]
                    } });
            }
            return yield helperFunction.convertPromiseToObject(yield coachSchedule_1.coachScheduleModel.findAndCountAll({
                where,
                order: [["date", "ASC"], ["start_time", "ASC"]]
            }));
        });
    }
    getSlot(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let schedule = yield helperFunction.convertPromiseToObject(yield coachSchedule_1.coachScheduleModel.findByPk(parseInt(params.slot_id)));
            if (!schedule)
                throw new Error(constants.MESSAGES.no_coach_schedule);
            return schedule;
        });
    }
    deleteSlot(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.type == constants.COACH_SCHEDULE_SLOT_DELETE_TYPE.individual && !params.slot_id)
                throw new Error(constants.MESSAGES.slot_id_required);
            if (params.type == constants.COACH_SCHEDULE_SLOT_DELETE_TYPE.group && !params.slot_group_id)
                throw new Error(constants.MESSAGES.slot_group_id_required);
            if (params.type == constants.COACH_SCHEDULE_SLOT_DELETE_TYPE.individual) {
                let schedules = yield coachSchedule_1.coachScheduleModel.findAll({
                    slot_group_id: params.slot_group_id
                });
                if (schedules.length == 0)
                    throw new Error(constants.MESSAGES.no_coach_schedule);
                schedules.destroy();
            }
            else {
                let schedule = yield coachSchedule_1.coachScheduleModel.findByPk(parseInt(params.slot_id));
                if (!schedule)
                    throw new Error(constants.MESSAGES.no_coach_schedule);
                schedule.destroy();
            }
            return true;
        });
    }
}
exports.CoachService = CoachService;
//# sourceMappingURL=coachService.js.map