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
exports.EmployerService = void 0;
const constants = __importStar(require("../../constants"));
const appUtils = __importStar(require("../../utils/appUtils"));
const helperFunction = __importStar(require("../../utils/helperFunction"));
const models_1 = require("../../models");
const subscriptionManagement_1 = require("../../models/subscriptionManagement");
const paymentManagement_1 = require("../../models/paymentManagement");
const Sequelize = require('sequelize');
var Op = Sequelize.Op;
class EmployerService {
    constructor() { }
    /**
    * function to get Subscription Plan List
    @param {} params pass all parameters from request
    */
    getSubscriptionPlanList(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let subscriptionList = yield subscriptionManagement_1.subscriptionManagementModel.findAndCountAll({
                attributes: ['id', 'plan_name', 'description', 'charge', 'duration'],
                where: {
                    status: constants.STATUS.active,
                }
            });
            return yield helperFunction.convertPromiseToObject(subscriptionList);
        });
    }
    /**
    * function to buy Subscription Plan
    @param {} params pass all parameters from request
    */
    buyPlan(params, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let subscriptionPlan = yield helperFunction.convertPromiseToObject(yield subscriptionManagement_1.subscriptionManagementModel.findByPk(parseInt(params.plan_id)));
            let paymentObj = {
                admin_id: constants.USER_ROLE.super_admin,
                employer_id: parseInt(user.uid),
                plan_id: parseInt(params.plan_id),
                purchase_date: params.purchase_date,
                expiry_date: params.expiry_date,
                amount: parseFloat(params.amount),
                transaction_id: params.transaction_id,
                details: subscriptionPlan,
            };
            return yield helperFunction.convertPromiseToObject(yield paymentManagement_1.paymentManagementModel.create(paymentObj));
        });
    }
    /*
* function to get profile
*/
    getProfile(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let profile = yield helperFunction.convertPromiseToObject(yield models_1.employersModel.findOne({
                where: {
                    id: parseInt(user.uid),
                    status: { [Op.ne]: 2 }
                }
            }));
            delete profile.password;
            return profile;
        });
    }
    /*
    * function to get profile
    */
    editProfile(params, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let profile = yield models_1.employersModel.findOne({
                where: {
                    id: parseInt(user.uid),
                    status: { [Op.ne]: 2 }
                }
            });
            let currentProfile = yield helperFunction.convertPromiseToObject(profile);
            profile.name = params.name || currentProfile.name;
            profile.email = params.email || currentProfile.email;
            profile.password = params.password ? yield appUtils.bcryptPassword(params.password) : currentProfile.password;
            profile.country_code = params.country_code || currentProfile.country_code;
            profile.phone_number = params.phone_number || currentProfile.phone_number;
            profile.industry_type = params.industry_type || currentProfile.industry_type;
            profile.address = params.address || currentProfile.address;
            profile.thought_of_the_day = params.thought_of_the_day || currentProfile.thought_of_the_day;
            profile.save();
            return profile;
        });
    }
    /*
    * function to view current plan details
    */
    mySubscription(user) {
        return __awaiter(this, void 0, void 0, function* () {
            paymentManagement_1.paymentManagementModel.hasOne(subscriptionManagement_1.subscriptionManagementModel, { foreignKey: "id", sourceKey: "plan_id", targetKey: "id" });
            return yield helperFunction.convertPromiseToObject(yield paymentManagement_1.paymentManagementModel.findOne({
                where: {
                    employer_id: parseInt(user.uid),
                    status: constants.EMPLOYER_SUBSCRIPTION_PLAN_STATUS.active,
                },
                include: [
                    {
                        model: subscriptionManagement_1.subscriptionManagementModel,
                        required: true
                    }
                ]
            }));
        });
    }
    /*
   * function to view my payments
   */
    myPayments(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield helperFunction.convertPromiseToObject(yield paymentManagement_1.paymentManagementModel.findAndCountAll({
                where: {
                    employer_id: parseInt(user.uid),
                }
            }));
        });
    }
}
exports.EmployerService = EmployerService;
//# sourceMappingURL=employerService.js.map