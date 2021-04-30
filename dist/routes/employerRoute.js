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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const employerSchema = __importStar(require("../apiSchema/employerSchema"));
const joiSchemaValidation = __importStar(require("../middleware/joiSchemaValidation"));
const tokenValidator = __importStar(require("../middleware/tokenValidator"));
const validators = __importStar(require("../middleware/validators"));
const EmployerController = __importStar(require("../controllers/employer"));
const employerRoute = express_1.default.Router();
const authController = new EmployerController.AuthController();
const managementController = new EmployerController.EmployeeController();
const employerController = new EmployerController.EmployerController();
/* login route for employer login */
employerRoute.post("/login", validators.trimmer, joiSchemaValidation.validateBody(employerSchema.login), authController.login);
/* forget pass route for employee */
employerRoute.post("/forgotPassword", validators.trimmer, joiSchemaValidation.validateBody(employerSchema.forgotPassword), authController.forgotPassword);
/* reset pass route for employer */
employerRoute.post("/resetPassword", validators.trimmer, joiSchemaValidation.validateBody(employerSchema.resetPassword), tokenValidator.validateEmployerToken, authController.resetPassword);
/* add or edit employers route for employers */
employerRoute.post("/addEditEmployee", joiSchemaValidation.validateBody(employerSchema.addEditEmployee), tokenValidator.validateEmployerToken, managementController.addEditEmployee);
/* get employers list route for employers */
employerRoute.get("/getEmployeeList", joiSchemaValidation.validateQueryParams(employerSchema.getEmployeeList), tokenValidator.validateEmployerToken, managementController.getEmployeeList);
/* update employer device token */
employerRoute.put("/updateEmployerDeviceToken", joiSchemaValidation.validateBody(employerSchema.updateEmployerDeviceToken), tokenValidator.validateEmployerToken, authController.updateEmployerDeviceToken);
/* clear employer device token */
employerRoute.put("/clearEmployerDeviceToken", tokenValidator.validateEmployerToken, authController.clearEmployerDeviceToken);
/* clear employer device token */
employerRoute.get("/getSubscriptionPlanList", tokenValidator.validateEmployerToken, employerController.getSubscriptionPlanList);
/* view Employee Details */
employerRoute.get("/viewEmployeeDetails/:employee_id", tokenValidator.validateEmployerToken, joiSchemaValidation.validateParams(employerSchema.viewEmployeeDetails), managementController.viewEmployeeDetails);
/* delete Employee */
employerRoute.delete("/deleteEmployee/:employee_id", tokenValidator.validateEmployerToken, joiSchemaValidation.validateParams(employerSchema.deleteEmployee), managementController.deleteEmployee);
module.exports = employerRoute;
//# sourceMappingURL=employerRoute.js.map