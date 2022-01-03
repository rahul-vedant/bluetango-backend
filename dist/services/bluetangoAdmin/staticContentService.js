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
exports.StaticContentService = void 0;
const models_1 = require("../../models");
const Sequelize = require('sequelize');
var Op = Sequelize.Op;
const queryService = __importStar(require("../../queryService/bluetangoAdmin/queryService"));
class StaticContentService {
    constructor() { }
    /*
     * update static content
     * @param : token
     */
    addStaticContent(params, user) {
        return __awaiter(this, void 0, void 0, function* () {
            params.model = models_1.staticContentModel;
            let staticData = yield queryService.updateData(params, { returning: true, where: { id: 1 } });
            return staticData;
        });
    }
    /*
  *get static content
  */
    getStaticContent(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield queryService.selectOne(models_1.staticContentModel, {
                where: { id: 1 },
                attributes: [`${params.contentType}`]
            });
        });
    }
}
exports.StaticContentService = StaticContentService;
//# sourceMappingURL=staticContentService.js.map