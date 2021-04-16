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
exports.AchievementServices = void 0;
const constants = __importStar(require("../../constants"));
const helperFunction = __importStar(require("../../utils/helperFunction"));
const achievement_1 = require("../../models/achievement");
const achievementLike_1 = require("../../models/achievementLike");
const achievementComment_1 = require("../../models/achievementComment");
const achievementHighFive_1 = require("../../models/achievementHighFive");
const employee_1 = require("../../models/employee");
const Sequelize = require('sequelize');
var Op = Sequelize.Op;
class AchievementServices {
    constructor() { }
    /*
    * function to get achievemnets
    */
    getAchievements(user) {
        return __awaiter(this, void 0, void 0, function* () {
            achievement_1.achievementModel.hasMany(achievementLike_1.achievementLikeModel, { foreignKey: "achievement_id", sourceKey: "id", targetKey: "achievement_id" });
            achievement_1.achievementModel.hasMany(achievementComment_1.achievementCommentModel, { foreignKey: "achievement_id", sourceKey: "id", targetKey: "achievement_id" });
            achievement_1.achievementModel.hasMany(achievementHighFive_1.achievementHighFiveModel, { foreignKey: "achievement_id", sourceKey: "id", targetKey: "achievement_id" });
            achievement_1.achievementModel.hasOne(employee_1.employeeModel, { foreignKey: "id", sourceKey: "employee_id", targetKey: "id" });
            achievementLike_1.achievementLikeModel.hasOne(employee_1.employeeModel, { foreignKey: "id", sourceKey: "liked_by_employee_id", targetKey: "id" });
            achievementHighFive_1.achievementHighFiveModel.hasOne(employee_1.employeeModel, { foreignKey: "id", sourceKey: "high_fived_by_employee_id", targetKey: "id" });
            let achievements = yield helperFunction.convertPromiseToObject(yield achievement_1.achievementModel.findAll({
                attributes: [
                    'id', 'employee_id', 'description', 'status', 'createdAt', 'updatedAt',
                    [Sequelize.fn('COUNT', Sequelize.col('achievement_likes.id')), 'likeCount'],
                    [Sequelize.fn('COUNT', Sequelize.col('achievement_high_fives.id')), 'highFiveCount'],
                    [Sequelize.fn('COUNT', Sequelize.col('achievement_comments.id')), 'commentCount']
                ],
                include: [
                    {
                        model: employee_1.employeeModel,
                        attributes: ['id', 'name', 'profile_pic_url', 'createdAt', 'updatedAt'],
                        required: true
                    },
                    {
                        model: achievementLike_1.achievementLikeModel,
                        attributes: [],
                        where: { status: 1 },
                        required: false,
                    },
                    {
                        model: achievementHighFive_1.achievementHighFiveModel,
                        attributes: [],
                        where: { status: 1 },
                        required: false,
                    },
                    {
                        model: achievementComment_1.achievementCommentModel,
                        attributes: [],
                        where: { status: 1 },
                        required: false,
                    },
                ],
                group: [
                    '"achievements.id"', '"employee.id"'
                ],
                order: [["createdAt", "DESC"]]
            }));
            for (let achievement of achievements) {
                achievement.isLiked = false;
                achievement.isHighFived = false;
                let achievementLike = yield achievementLike_1.achievementLikeModel.findOne({
                    where: {
                        liked_by_employee_id: user.uid,
                        achievement_id: achievement.id,
                    }
                });
                let achievementHighFive = yield achievementHighFive_1.achievementHighFiveModel.findOne({
                    where: {
                        high_fived_by_employee_id: user.uid,
                        achievement_id: achievement.id,
                    }
                });
                if (achievementLike)
                    achievement.isLiked = true;
                if (achievementHighFive)
                    achievement.isHighFived = true;
            }
            return { achievements };
        });
    }
    /*
    * function to create achievement
    */
    createAchievement(params, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let achievementObj = {
                employee_id: user.uid,
                description: params.description,
            };
            return yield helperFunction.convertPromiseToObject(yield achievement_1.achievementModel.create(achievementObj));
        });
    }
    /*
    * function to like dislike an achievement
    */
    likeDislikeAchievement(params, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let achievementLike = yield achievementLike_1.achievementLikeModel.findOne({
                where: {
                    liked_by_employee_id: user.uid,
                    achievement_id: parseInt(params.achievement_id)
                }
            });
            if (achievementLike) {
                yield achievementLike.destroy();
            }
            else {
                let achievementLikeObj = {
                    liked_by_employee_id: user.uid,
                    achievement_id: parseInt(params.achievement_id)
                };
                yield achievementLike_1.achievementLikeModel.create(achievementLikeObj);
            }
            return true;
        });
    }
    /*
    * function to high five an achievement
    */
    highFiveAchievement(params, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let achievementhighFive = yield achievementHighFive_1.achievementHighFiveModel.findOne({
                where: {
                    high_fived_by_employee_id: user.uid,
                    achievement_id: parseInt(params.achievement_id)
                }
            });
            if (achievementhighFive) {
                yield achievementhighFive.destroy();
            }
            else {
                let achievementHighFiveObj = {
                    high_fived_by_employee_id: user.uid,
                    achievement_id: parseInt(params.achievement_id)
                };
                yield achievementHighFive_1.achievementHighFiveModel.create(achievementHighFiveObj);
            }
            return true;
        });
    }
    /*
    * function to add edit comment on achievement
    */
    addEditCommentAchievement(params, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let achievementComment = {};
            if (params.achievement_comment_id) {
                achievementComment = yield achievementComment_1.achievementCommentModel.findOne({
                    where: {
                        commented_by_employee_id: user.uid,
                        id: parseInt(params.achievement_comment_id)
                    }
                });
                if (achievementComment) {
                    achievementComment.comment = params.comment;
                    yield achievementComment.save();
                }
                else
                    throw new Error(constants.MESSAGES.no_achievement_comment);
            }
            else {
                let achievementCommentObj = {
                    commented_by_employee_id: user.uid,
                    achievement_id: parseInt(params.achievement_id),
                    comment: params.comment
                };
                achievementComment = yield achievementComment_1.achievementCommentModel.create(achievementCommentObj);
            }
            return yield helperFunction.convertPromiseToObject(achievementComment);
        });
    }
    /*
    * function to get comments on achievement
    */
    getAchievementComments(params, user) {
        return __awaiter(this, void 0, void 0, function* () {
            achievementComment_1.achievementCommentModel.hasOne(employee_1.employeeModel, { foreignKey: "id", sourceKey: "commented_by_employee_id", targetKey: "id" });
            let achievementComments = yield helperFunction.convertPromiseToObject(yield achievementComment_1.achievementCommentModel.findAll({
                where: {
                    achievement_id: parseInt(params.achievement_id)
                },
                include: [
                    {
                        model: employee_1.employeeModel,
                        attributes: ['id', 'name', 'profile_pic_url'],
                        required: false
                    }
                ],
                order: [["createdAt", "DESC"]]
            }));
            for (let comment of achievementComments) {
                comment.isCommented = false;
                if (comment.employee.id == parseInt(user.uid))
                    comment.isCommented = true;
            }
            return achievementComments;
        });
    }
}
exports.AchievementServices = AchievementServices;
//# sourceMappingURL=achievementService.js.map