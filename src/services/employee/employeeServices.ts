import _ from "lodash";
import * as constants from "../../constants";
import * as appUtils from "../../utils/appUtils";
import * as helperFunction from "../../utils/helperFunction";
import * as tokenResponse from "../../utils/tokenResponse";
import { employeeModel } from  "../../models/employee"
import { adminModel } from "../../models/admin";
import { employersModel } from  "../../models/employers"
import { departmentModel } from  "../../models/department"
import { managerTeamMemberModel } from  "../../models/managerTeamMember"
import { teamGoalAssignModel } from  "../../models/teamGoalAssign"
import { qualitativeMeasurementModel } from  "../../models/qualitativeMeasurement"
import { teamGoalModel } from "../../models/teamGoal";
import { emojiModel } from "../../models/emoji";
import { AuthService } from "./authService";
const Sequelize = require('sequelize');
var Op = Sequelize.Op;

const authService = new AuthService();

export class EmployeeServices {
    constructor() { }

    /*
    * function to get list of team members
    */
    public async getListOfTeamMemberByManagerId(params:any, user: any) {
        let [offset, limit] = await helperFunction.pagination(params.offset, params.limit);
        managerTeamMemberModel.hasOne(employeeModel,{ foreignKey: "id", sourceKey: "team_member_id", targetKey: "id" });
        employeeModel.hasOne(emojiModel,{ foreignKey: "id", sourceKey: "energy_id", targetKey: "id" });

        let teamMembersData = await helperFunction.convertPromiseToObject(  await managerTeamMemberModel.findAndCountAll({
                where: { manager_id: user.uid},
                include: [
                    {
                        model: employeeModel, 
                        required: false,
                        attributes: ['id', 'name', 'email', 'phone_number','country_code', 'profile_pic_url'],
                        include: [
                            {
                                model: emojiModel,
                                required: false,
                                attributes:['image_url', 'caption'],
                            }
                        ]
                    }
                ],
                limit: limit,
                offset: offset,
                order: [["createdAt", "DESC"]]

            })
        );

        let date = new Date();
        date.setMonth(date.getMonth()-3);
        //let dateCheck = date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
        let dateCheck = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        for (let i=0; i< teamMembersData.rows.length; i++ ) {
            let rateCheck = await helperFunction.convertPromiseToObject( await qualitativeMeasurementModel.findOne({
                    where: {
                        manager_id: user.uid,
                        employee_id: teamMembersData.rows[i].team_member_id,
                        updatedAt:{[Op.gte]: dateCheck }
                    }
                })
            );
            if (_.isEmpty(rateCheck)) {
                teamMembersData.rows[i].rate_valid = 1;
            } else {
                teamMembersData.rows[i].rate_valid_after_date =  rateCheck.createdAt;
                teamMembersData.rows[i].rate_valid = 0;
            }
        }

        return teamMembersData;
           
    }

    /*
    * function to get details of employee
    */
    public async viewDetailsEmployee(params:any) {
        employeeModel.hasMany(teamGoalAssignModel,{ foreignKey: "employee_id", sourceKey: "id", targetKey: "employee_id" });
        teamGoalAssignModel.hasOne(teamGoalModel,{ foreignKey: "id", sourceKey: "goal_id", targetKey: "id" });
        let employeeDetails = await helperFunction.convertPromiseToObject( await employeeModel.findOne({
                where: { id: params.id},
                include:[
                    {
                        model: teamGoalAssignModel,
                        required: false,
                        include: [
                            {
                                model: teamGoalModel,
                                required: false
                            }
                        ]
                    }
                ],
                attributes: ['id', 'name', 'email', 'phone_number','country_code', 'profile_pic_url']
            }) );

        let qualitativeMeasurementDetails = await qualitativeMeasurementModel.findOne({
            where:{ employee_id: params.id},
            group: 'employee_id',
            attributes:[
                'employee_id',
                [Sequelize.fn('AVG', Sequelize.col('initiative')), 'initiative_count'],
                [Sequelize.fn('AVG', Sequelize.col('ability_to_delegate')), 'ability_to_delegate_count'],
                [Sequelize.fn('AVG', Sequelize.col('clear_Communication')), 'clear_Communication_count'],
                [Sequelize.fn('AVG', Sequelize.col('self_awareness_of_strengths_and_weaknesses')), 'self_awareness_of_strengths_and_weaknesses_count'],
                [Sequelize.fn('AVG', Sequelize.col('agile_thinking')), 'agile_thinking_count'],
                [Sequelize.fn('AVG', Sequelize.col('influence')), 'influence_count'], 
                [Sequelize.fn('AVG', Sequelize.col('empathy')), 'empathy_count'],
                [Sequelize.fn('AVG', Sequelize.col('leadership_courage')), 'leadership_courage_count'], 
                [Sequelize.fn('AVG', Sequelize.col('customer_client_patient_satisfaction')), 'customer_client_patient_satisfaction_count'],
                [Sequelize.fn('AVG', Sequelize.col('team_contributions')), 'team_contributions_count'], 
                [Sequelize.fn('AVG', Sequelize.col('time_management')), 'time_management_count'],
                [Sequelize.fn('AVG', Sequelize.col('work_product')), 'work_product_count']
            ]
        })

        employeeDetails.qualitativeMeasurementDetails = qualitativeMeasurementDetails;
        return employeeDetails;
    }

    /*
    * function to get details of employee
    */
    public async searchTeamMember(params:any, user: any) {
        let [offset, limit] = await helperFunction.pagination(params.offset, params.limit);

        managerTeamMemberModel.hasOne(employeeModel,{ foreignKey: "id", sourceKey: "team_member_id", targetKey: "id" });
        employeeModel.hasOne(emojiModel,{ foreignKey: "id", sourceKey: "energy_id", targetKey: "id" });
        return await managerTeamMemberModel.findAndCountAll({
            where: { manager_id: user.uid},
            include: [
                {
                    model: employeeModel, 
                    required: true,
                    where: {
                        [Op.or]:[
                            {name: { [Op.iLike]: `%${params.search_string}%` }},
                            {phone_number: {[Op.iLike]: `%${params.search_string}%`}},
                            {email: { [Op.iLike]: `%${params.search_string}%`}}
                        ]
                    },
                    attributes: ['id', 'name', 'email', 'phone_number', 'country_code', 'profile_pic_url'],
                    include: [
                        {
                            model: emojiModel,
                            required: false,
                            attributes:['image_url', 'caption'],
                        }
                    ]
                }
            ],
            limit: limit,
            offset: offset,
            order: [["createdAt", "DESC"]]

        })
    }

    /*
    * function to add thought of the day
    */
    public async thoughtOfTheDay(params:any, user: any) {
        await employeeModel.update(
            {
                thought_of_the_day: params.thought_of_the_day
            },
            {
                where: { id: user.uid}
            }
        )

        return employeeModel.findOne({
            where: { id: user.uid}
        })
    }

    /*
    * function to add thought of the day
    */
    public async getEmoji() {
        return await emojiModel.findAll();
    }

     /*
    * function to add thought of the day
    */
    public async updateEnergyCheck(params:any, user: any) {
        await employeeModel.update(
            {
                energy_id: params.energy_id
            },
            {
                where: { id: user.uid }
            }
        )
        return authService.getMyProfile(user);
    }

    /*
    * function to view energy check
    */
    public async viewEnergyCheckTeamMembers(user: any) {

       managerTeamMemberModel.hasOne(employeeModel,{ foreignKey: "id", sourceKey: "team_member_id", targetKey: "id" });
       employeeModel.hasOne(emojiModel,{ foreignKey: "id", sourceKey: "energy_id", targetKey: "id" });
       
        return await managerTeamMemberModel.findAll({
           where: { manager_id: user.uid },
           include:[
               {
                    model: employeeModel,
                    required: false,
                    attributes:['id', 'name', 'energy_id'],
                    include: [
                        {
                            model: emojiModel,
                            required: false,
                            attributes:['image_url', 'caption'],
                        }
                    ]
               }
           ]
       })
    }

     /*
    * feel about job today
    */
    public async feelAboutJobToday(params: any, user: any) {
        
        return await employeeModel.update(params, 
            {
                where: { id: user.uid }
            });
    }

    /*
   * function to update device token
   */
    public async updateEmployeeDeviceToken(params: any, user: any) {
        await employeeModel.update(
            {
                device_token: params.device_token
            },
            {
                where: { id: user.uid }
            }
        )
        return authService.getMyProfile(user);
    }

    /*
 * function to get current manager
 */
    public async getCurrentManager(user: any) {
        let currentManager = await helperFunction.convertPromiseToObject(await managerTeamMemberModel.findOne({
            where: { team_member_id: user.uid },
            })
        );

        return currentManager;
    }

    /*
    * function to get employee details to show employee detail on dashbord as team member view
    */
    public async getEmployeeDetails(user: any) {

        employeeModel.hasOne(departmentModel, { foreignKey: "id", sourceKey: "current_department_id", targetKey: "id" });
        employeeModel.hasOne(managerTeamMemberModel, { foreignKey: "team_member_id", sourceKey: "id", targetKey: "team_member_id" });
        managerTeamMemberModel.hasOne(employeeModel, { foreignKey: "id", sourceKey: "manager_id", targetKey: "id" });
        let employee = await employeeModel.findOne({
            attributes: ['id', 'name','employee_code','profile_pic_url'],
            where: {
                id:user.uid
            },
            include: [
                {
                    model: departmentModel,
                    required: false,
                    attributes:['name']
                },
                {
                    model: managerTeamMemberModel,
                    required: false,
                    attributes: ['manager_id'],
                    include: [
                        {
                            model: employeeModel,
                            required: false,
                            attributes: ['name'],
                        }
                    ]
                }
            ],

        });

        return await helperFunction.convertPromiseToObject(employee);
    }

    /*
    * function to view employee energy of employee on dashbord as team member view
    */
    public async viewEmployeeEnergy(user: any) {

        employeeModel.hasOne(emojiModel, { foreignKey: "id", sourceKey: "energy_id", targetKey: "id" });
        let employeeEnergy = await employeeModel.findOne({
            attributes: ['id', 'name'],
            where: {
                id: user.uid
            },
            include: [
                {
                    model: emojiModel,
                    required: false,
                    attributes: ['id','image_url','caption']
                },
            ],

        });

        return await helperFunction.convertPromiseToObject(employeeEnergy);
    }

}