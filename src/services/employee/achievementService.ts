import _ from "lodash";
import * as constants from "../../constants";
import * as appUtils from "../../utils/appUtils";
import * as helperFunction from "../../utils/helperFunction";
import { achievementModel } from "../../models/achievement";
import { achievementLikeModel } from "../../models/achievementLike";
import { achievementCommentModel } from "../../models/achievementComment";
import { achievementHighFiveModel } from "../../models/achievementHighFive";
import { employeeModel } from "../../models/employee";
import { notificationModel } from "../../models/notification";

const Sequelize = require('sequelize');
var Op = Sequelize.Op;

export class AchievementServices {
    constructor() { }

    /*
    * function to get achievemnets
    */
    public async getAchievements(user: any) {

        achievementModel.hasMany(achievementLikeModel, { foreignKey: "achievement_id", sourceKey: "id", targetKey: "achievement_id" })
        achievementModel.hasMany(achievementCommentModel, { foreignKey: "achievement_id", sourceKey: "id", targetKey: "achievement_id" })
        achievementModel.hasMany(achievementHighFiveModel, { foreignKey: "achievement_id", sourceKey: "id", targetKey: "achievement_id" })
        achievementModel.hasOne(employeeModel, { foreignKey: "id", sourceKey: "employee_id", targetKey: "id" })
        achievementLikeModel.hasOne(employeeModel, { foreignKey: "id", sourceKey: "liked_by_employee_id", targetKey: "id" })
        achievementHighFiveModel.hasOne(employeeModel, { foreignKey: "id", sourceKey: "high_fived_by_employee_id", targetKey: "id" })

        let achievements = await helperFunction.convertPromiseToObject(
            await achievementModel.findAll({
                attributes: [
                    'id', 'employee_id', 'description', 'status','last_action_on','createdAt','updatedAt',
                    [Sequelize.fn('COUNT', Sequelize.col('achievement_likes.id')),'likeCount'],
                    [Sequelize.fn('COUNT', Sequelize.col('achievement_high_fives.id')), 'highFiveCount'],
                    [Sequelize.fn('COUNT', Sequelize.col('achievement_comments.id')), 'commentCount']
                ],
                include: [
                    {
                        model: employeeModel,
                        attributes: ['id', 'name', 'profile_pic_url', 'createdAt', 'updatedAt'],
                        required:true
                    },
                    {
                        model: achievementLikeModel,
                        attributes:[],
                        where: { status: 1 },
                        required: false,
                    },
                    {
                        model: achievementHighFiveModel,
                        attributes: [],
                        where: { status: 1 },
                        required: false,
                    },
                    {
                        model: achievementCommentModel,
                        attributes: [],
                        where: { status: 1 },
                        required: false,
                    },
                ],
                group: [
                    '"achievements.id"', '"employee.id"'
                ],                
                order: [["last_action_on", "DESC"]]
            })
        )

        for (let achievement of achievements) {

            achievement.isLiked = false;
            achievement.isHighFived = false;
            achievement.isSelf = false;

            let achievementLike = await achievementLikeModel.findOne({
                where: {
                    liked_by_employee_id: user.uid,
                    achievement_id: achievement.id,
                }
            })

            let achievementHighFive = await achievementHighFiveModel.findOne({
                where: {
                    high_fived_by_employee_id: user.uid,
                    achievement_id: achievement.id,
                }
            })

            if (achievementLike) achievement.isLiked = true;
            if (achievementHighFive) achievement.isHighFived = true;
            if (achievement.employee && achievement.employee.id == parseInt(user.uid)) achievement.isSelf = true;

        }

        
        
        return {achievements}
       
    }

    /*
    * function to get achievemnet by id
    */
    public async getAchievementById(params:any,user: any) {

        achievementModel.hasMany(achievementLikeModel, { foreignKey: "achievement_id", sourceKey: "id", targetKey: "achievement_id" })
        achievementModel.hasMany(achievementCommentModel, { foreignKey: "achievement_id", sourceKey: "id", targetKey: "achievement_id" })
        achievementModel.hasMany(achievementHighFiveModel, { foreignKey: "achievement_id", sourceKey: "id", targetKey: "achievement_id" })
        achievementModel.hasOne(employeeModel, { foreignKey: "id", sourceKey: "employee_id", targetKey: "id" })
        achievementLikeModel.hasOne(employeeModel, { foreignKey: "id", sourceKey: "liked_by_employee_id", targetKey: "id" })
        achievementHighFiveModel.hasOne(employeeModel, { foreignKey: "id", sourceKey: "high_fived_by_employee_id", targetKey: "id" })

        let achievement = await helperFunction.convertPromiseToObject(
            await achievementModel.findOne({
                attributes: [
                    'id', 'employee_id', 'description', 'status', 'last_action_on', 'createdAt', 'updatedAt',
                    [Sequelize.fn('COUNT', Sequelize.col('achievement_likes.id')), 'likeCount'],
                    [Sequelize.fn('COUNT', Sequelize.col('achievement_high_fives.id')), 'highFiveCount'],
                    [Sequelize.fn('COUNT', Sequelize.col('achievement_comments.id')), 'commentCount']
                ],
                where: {
                    id:parseInt(params.achievement_id),
                },
                include: [
                    {
                        model: employeeModel,
                        attributes: ['id', 'name', 'profile_pic_url', 'createdAt', 'updatedAt'],
                        required: true
                    },
                    {
                        model: achievementLikeModel,
                        attributes: [],
                        where: { status: 1 },
                        required: false,
                    },
                    {
                        model: achievementHighFiveModel,
                        attributes: [],
                        where: { status: 1 },
                        required: false,
                    },
                    {
                        model: achievementCommentModel,
                        attributes: [],
                        where: { status: 1 },
                        required: false,
                    },
                ],
                group: [
                    '"achievements.id"', '"employee.id"'
                ],
                order: [["last_action_on", "DESC"]]
            })
        )

        if (!achievement) throw new Error(constants.MESSAGES.no_achievement);


        achievement.isLiked = false;
        achievement.isHighFived = false;
        achievement.isSelf = false;

        let achievementLike = await achievementLikeModel.findOne({
            where: {
                liked_by_employee_id: user.uid,
                achievement_id: achievement.id,
            }
        })

        let achievementHighFive = await achievementHighFiveModel.findOne({
            where: {
                high_fived_by_employee_id: user.uid,
                achievement_id: achievement.id,
            }
        })

        if (achievementLike) achievement.isLiked = true;
        if (achievementHighFive) achievement.isHighFived = true;
        if (achievement.employee && achievement.employee.id == parseInt(user.uid)) achievement.isSelf = true;



        return { achievement }

    }

    /*
    * function to create achievement
    */
    public async createUpdateAchievement(params:any,user: any) {

        let achievement = <any>{};

        if (params.achievement_id) {
            achievement = await achievementModel.findOne({
                where: {
                    employee_id: user.uid,
                    id: parseInt(params.achievement_id)
                }
            })

            if (achievement) {
                achievement.description = params.description;
                await achievement.save();
            }
            else
                throw new Error(constants.MESSAGES.no_achievement);
        }
        else {
            let achievementObj = <any>{
                employee_id: user.uid,
                description: params.description,
                last_action_on:new Date(),
            }

            achievement = await helperFunction.convertPromiseToObject( await achievementModel.create(achievementObj));

            // let senderData = await employeeModel.findByPk(parseInt(user.uid));
            // let recieversData = await helperFunction.convertPromiseToObject(
            //     await employeeModel.findAll({
            //         where: {
            //             status:constants.STATUS.active
            //         }
            //     })
            // ) 

            // for (let recieverData of recieversData) {
            //     // add notification for employee
            //     let notificationObj = <any>{
            //         type_id: parseInt(achievement.id),
            //         sender_id: senderData.id,
            //         reciever_id: recieverData.id,
            //         type: constants.NOTIFICATION_TYPE.achievement_post,
            //         data: {
            //             type: constants.NOTIFICATION_TYPE.achievement_post,
            //             title: 'New Achievement Post',
            //             message: `${senderData.name} has posted new achievement`,
            //             id: parseInt(achievement.id),
            //             senderEmplyeeData: senderData,
            //         },
            //     }
            //     await notificationModel.create(notificationObj);
            //     // send push notification
            //     let notificationData = <any>{
            //         title: 'New Achievement Post',
            //         body: `${senderData.name} has posted new achievement`,
            //         data: {
            //             type: constants.NOTIFICATION_TYPE.achievement_post,
            //             title: 'New Achievement Post',
            //             message: `${senderData.name} has posted new achievement`,
            //             id: parseInt(achievement.id),
            //             senderEmplyeeData: senderData,
            //         },
            //     }
            //     await helperFunction.sendFcmNotification([recieverData.device_token], notificationData);
            // }
        }


        return achievement;

    }

    /*
    * function to like dislike an achievement
    */
    public async likeDislikeAchievement(params: any, user: any) {

        let achievement = await achievementModel.findByPk(parseInt(params.achievement_id));

        if (achievement) {
            let achievementLike = await achievementLikeModel.findOne({
                where: {
                    liked_by_employee_id: user.uid,
                    achievement_id: parseInt(params.achievement_id)
                }
            })

            if (achievementLike) {
                await achievementLike.destroy()
            }
            else {

                let achievementLikeObj = <any>{
                    liked_by_employee_id: user.uid,
                    achievement_id: parseInt(params.achievement_id)
                }
                await achievementLikeModel.create(achievementLikeObj)
                
                achievement.last_action_on = new Date();
                achievement.save();

                let senderData = await employeeModel.findByPk(parseInt(user.uid));
                let recieverData = await employeeModel.findByPk(parseInt(achievement.employee_id));

                // add notification for employee
                let notificationObj = <any>{
                    type_id: parseInt(params.achievement_id),
                    sender_id: senderData.id,
                    reciever_id: recieverData.id,
                    type: constants.NOTIFICATION_TYPE.achievement_like,
                    data: {
                        type: constants.NOTIFICATION_TYPE.achievement_like,
                        title: 'Achievement Like',
                        message: `${senderData.name} has liked your achievement post`,
                        id: parseInt(params.achievement_id),
                        senderEmplyeeData: senderData,                          
                    },
                }
                await notificationModel.create(notificationObj);
                // send push notification
                let notificationData = <any>{
                    title: 'Achievement Like',
                    body: `${senderData.name} has liked your achievement post`,
                    data: {
                        type: constants.NOTIFICATION_TYPE.achievement_like,
                        title: 'Achievement Like',
                        message: `${senderData.name} has liked your achievement post`,
                        id: parseInt(params.achievement_id),
                        senderEmplyeeData: senderData,
                    },
                }
                await helperFunction.sendFcmNotification([recieverData.device_token], notificationData);
            }

            return true;
        }
        else {
            throw new Error(constants.MESSAGES.no_achievement);
        }               

    }

    /*
    * function to high five an achievement
    */
    public async highFiveAchievement(params: any, user: any) {

        let achievement = await achievementModel.findByPk(parseInt(params.achievement_id));

        if (achievement) {
            let achievementhighFive = await achievementHighFiveModel.findOne({
                where: {
                    high_fived_by_employee_id: user.uid,
                    achievement_id: parseInt(params.achievement_id)
                }
            })

            if (achievementhighFive) {
                await achievementhighFive.destroy()
            }
            else {

                let achievementHighFiveObj = <any>{
                    high_fived_by_employee_id: user.uid,
                    achievement_id: parseInt(params.achievement_id)
                }

                await achievementHighFiveModel.create(achievementHighFiveObj)
                achievement.last_action_on = new Date();
                achievement.save();

                let senderData = await employeeModel.findByPk(parseInt(user.uid));
                let recieverData = await employeeModel.findByPk(parseInt(achievement.employee_id));

                // add notification for employee
                let notificationObj = <any>{
                    type_id: parseInt(params.achievement_id),
                    sender_id: senderData.id,
                    reciever_id: recieverData.id,
                    type: constants.NOTIFICATION_TYPE.achievement_highfive,
                    data: {
                        type: constants.NOTIFICATION_TYPE.achievement_highfive,
                        title: 'Achievement Highfive',
                        message: `${senderData.name} has reacted as highfive on your achievement post`,
                        id: parseInt(params.achievement_id),
                        senderEmplyeeData: senderData,
                    },
                }
                await notificationModel.create(notificationObj);
                // send push notification
                let notificationData = <any>{
                    title: 'Achievement Highfive',
                    body: `${senderData.name} has reacted as highfive on your achievement post`,
                    data: {
                        type: constants.NOTIFICATION_TYPE.achievement_highfive,
                        title: 'Achievement Highfive',
                        message: `${senderData.name} has reacted as highfive on your achievement post`,
                        id: parseInt(params.achievement_id),
                        senderEmplyeeData: senderData,
                    },
                }
                await helperFunction.sendFcmNotification([recieverData.device_token], notificationData);
            }

            return true;
        }
        else {
            throw new Error(constants.MESSAGES.no_achievement);
        }

    }

    /*
    * function to add edit comment on achievement
    */
    public async addEditCommentAchievement(params: any, user: any) {

        let achievement = await achievementModel.findByPk(parseInt(params.achievement_id));

        if (achievement) {
            let achievementComment = <any>{};

            if (params.achievement_comment_id) {
                achievementComment = await achievementCommentModel.findOne({
                    where: {
                        commented_by_employee_id: user.uid,
                        id: parseInt(params.achievement_comment_id)
                    }
                })

                if (achievementComment) {
                    achievementComment.comment = params.comment;
                    await achievementComment.save();
                }
                else
                    throw new Error(constants.MESSAGES.no_achievement_comment);
            }
            else {
                let achievementCommentObj = <any>{
                    commented_by_employee_id: user.uid,
                    achievement_id: parseInt(params.achievement_id),
                    comment: params.comment
                }

                achievementComment = await achievementCommentModel.create(achievementCommentObj);
                achievement.last_action_on = new Date();
                achievement.save();

                let senderData = await employeeModel.findByPk(parseInt(user.uid));
                let recieverData = await employeeModel.findByPk(parseInt(achievement.employee_id));

                // add notification for employee
                let notificationObj = <any>{
                    type_id: parseInt(params.achievement_id),
                    sender_id: senderData.id,
                    reciever_id: recieverData.id,
                    type: constants.NOTIFICATION_TYPE.achievement_comment,
                    data: {
                        type: constants.NOTIFICATION_TYPE.achievement_comment,
                        title: 'Achievement Comment',
                        message: `${senderData.name} has commented on your achievement post`,
                        id: parseInt(params.achievement_id),
                        senderEmplyeeData: senderData,
                    },
                }
                await notificationModel.create(notificationObj);
                // send push notification
                let notificationData = <any>{
                    title: 'Achievement Comment',
                    body: `${senderData.name} has commented on your achievement post`,
                    data: {
                        type: constants.NOTIFICATION_TYPE.achievement_comment,
                        title: 'Achievement Comment',
                        message: `${senderData.name} has commented on your achievement post`,
                        id: parseInt(params.achievement_id),
                        senderEmplyeeData: senderData,
                    },
                }
                await helperFunction.sendFcmNotification([recieverData.device_token], notificationData);
            }


            return await helperFunction.convertPromiseToObject(achievementComment);
        }
        else {
            throw new Error(constants.MESSAGES.no_achievement);
        }       

    }


    /*
    * function to get comments on achievement
    */
    public async getAchievementComments(params: any, user: any) {

        achievementCommentModel.hasOne(employeeModel, { foreignKey: "id", sourceKey: "commented_by_employee_id", targetKey: "id" })

        let achievementComments = await helperFunction.convertPromiseToObject(
            await achievementCommentModel.findAll({
                where: {
                    achievement_id:parseInt(params.achievement_id)
                },
                include: [
                    {
                        model: employeeModel,
                        attributes: ['id', 'name', 'profile_pic_url'],
                        required:false
                    }
                ],
                order: [["createdAt", "DESC"]]
            })
        )

        for (let comment of achievementComments) {
            comment.isSelf = false
            if (comment.employee && comment.employee.id == parseInt(user.uid)) comment.isSelf = true;
        }

        return achievementComments;
    }

    /*
    * function to delete an achievement
    */
    public async deleteAchievement(params: any, user: any) {
            let achievement = await achievementModel.findOne({
                where: {
                    employee_id: user.uid,
                    id: parseInt(params.achievement_id)
                }
            })

            if (achievement) {
                await achievement.destroy();
                return true
            }
            else
                throw new Error(constants.MESSAGES.no_achievement);
        
    }

    /*
    * function to delete an achievement comment
    */ 
    public async deleteAchievementComment(params: any, user: any) {
        let achievementComment = await achievementCommentModel.findOne({
            where: {
                commented_by_employee_id: user.uid,
                id: parseInt(params.achievement_comment_id)
            }
        })

        if (achievementComment) {
            await achievementComment.destroy();
            return true
        }
        else
            throw new Error(constants.MESSAGES.no_achievement_comment);

    }


    /*
    * function to get list of likes on achievement
    */
    public async getAchievementLikesList(params: any, user: any) {

        achievementLikeModel.hasOne(employeeModel, { foreignKey: "id", sourceKey: "liked_by_employee_id", targetKey: "id" })

        let achievementLikes = await helperFunction.convertPromiseToObject(
            await achievementLikeModel.findAll({
                where: {
                    achievement_id: parseInt(params.achievement_id)
                },
                include: [
                    {
                        model: employeeModel,
                        attributes: ['id', 'name', 'profile_pic_url'],
                        required: false
                    }
                ],
                order: [["createdAt", "DESC"]]
            })
        )

        for (let like of achievementLikes) {
            like.isSelf = false
            if (like.employee && like.employee.id == parseInt(user.uid)) {
                like.isSelf = true;
                break;
            } 
        }

        return achievementLikes;
    }

    /*
    * function to get list of high fives on achievement
    */
    public async getAchievementHighFivesList(params: any, user: any) {

        achievementHighFiveModel.hasOne(employeeModel, { foreignKey: "id", sourceKey: "high_fived_by_employee_id", targetKey: "id" })

        let achievementHighFives = await helperFunction.convertPromiseToObject(
            await achievementHighFiveModel.findAll({
                where: {
                    achievement_id: parseInt(params.achievement_id)
                },
                include: [
                    {
                        model: employeeModel,
                        attributes: ['id', 'name', 'profile_pic_url'],
                        required: false
                    }
                ],
                order: [["createdAt", "DESC"]]
            })
        )

        for (let highFive of achievementHighFives) {
            highFive.isSelf = false
            if (highFive.employee && highFive.employee.id == parseInt(user.uid)) {
                highFive.isSelf = true;
                break;
            } 
        }

        return achievementHighFives;
    }


}