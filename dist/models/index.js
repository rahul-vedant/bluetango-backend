"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thoughtsModel = exports.bluetangoAdminModel = exports.bluetangoAdminRolesModel = exports.coachScheduleModel = exports.coachSpecializationCategoriesModel = exports.employeeRanksModel = exports.employeeCoachSessionsModel = exports.staticContentModel = exports.coachBiosModel = exports.coachManagementModel = exports.industryTypeModel = exports.departmentModel = exports.employeeModel = exports.employersModel = exports.adminModel = void 0;
const admin_1 = require("./admin");
Object.defineProperty(exports, "adminModel", { enumerable: true, get: function () { return admin_1.adminModel; } });
const employers_1 = require("./employers");
Object.defineProperty(exports, "employersModel", { enumerable: true, get: function () { return employers_1.employersModel; } });
const employee_1 = require("./employee");
Object.defineProperty(exports, "employeeModel", { enumerable: true, get: function () { return employee_1.employeeModel; } });
const department_1 = require("./department");
Object.defineProperty(exports, "departmentModel", { enumerable: true, get: function () { return department_1.departmentModel; } });
const industryType_1 = require("./industryType");
Object.defineProperty(exports, "industryTypeModel", { enumerable: true, get: function () { return industryType_1.industryTypeModel; } });
const emoji_1 = require("./emoji");
const coachManagement_1 = require("./coachManagement");
Object.defineProperty(exports, "coachManagementModel", { enumerable: true, get: function () { return coachManagement_1.coachManagementModel; } });
const coachBios_1 = require("./coachBios");
Object.defineProperty(exports, "coachBiosModel", { enumerable: true, get: function () { return coachBios_1.coachBiosModel; } });
const staticContent_1 = require("./staticContent");
Object.defineProperty(exports, "staticContentModel", { enumerable: true, get: function () { return staticContent_1.staticContentModel; } });
const employeeCoachSession_1 = require("./employeeCoachSession");
Object.defineProperty(exports, "employeeCoachSessionsModel", { enumerable: true, get: function () { return employeeCoachSession_1.employeeCoachSessionsModel; } });
const employeeRanks_1 = require("./employeeRanks");
Object.defineProperty(exports, "employeeRanksModel", { enumerable: true, get: function () { return employeeRanks_1.employeeRanksModel; } });
const coachSpecializationCategories_1 = require("./coachSpecializationCategories");
Object.defineProperty(exports, "coachSpecializationCategoriesModel", { enumerable: true, get: function () { return coachSpecializationCategories_1.coachSpecializationCategoriesModel; } });
const coachSchedule_1 = require("./coachSchedule");
Object.defineProperty(exports, "coachScheduleModel", { enumerable: true, get: function () { return coachSchedule_1.coachScheduleModel; } });
const bluetangoAdminRoles_1 = require("./bluetangoAdminRoles");
Object.defineProperty(exports, "bluetangoAdminRolesModel", { enumerable: true, get: function () { return bluetangoAdminRoles_1.bluetangoAdminRolesModel; } });
const bluetangoAdmin_1 = require("./bluetangoAdmin");
Object.defineProperty(exports, "bluetangoAdminModel", { enumerable: true, get: function () { return bluetangoAdmin_1.bluetangoAdminModel; } });
const thoughts_1 = require("./thoughts");
Object.defineProperty(exports, "thoughtsModel", { enumerable: true, get: function () { return thoughts_1.thoughtsModel; } });
/* all associations put here to avoid duplicate association */
employee_1.employeeModel.hasOne(emoji_1.emojiModel, { as: 'energy_emoji_data', foreignKey: "id", sourceKey: "energy_id", targetKey: "id" });
employee_1.employeeModel.hasOne(emoji_1.emojiModel, { as: 'job_emoji_data', foreignKey: "id", sourceKey: "job_emoji_id", targetKey: "id" });
//# sourceMappingURL=index.js.map