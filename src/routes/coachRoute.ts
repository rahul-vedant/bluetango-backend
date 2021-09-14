import express from "express";
import * as coachSchema from '../apiSchema/coachSchema';
import * as joiSchemaValidation from '../middleware/joiSchemaValidation';
import * as tokenValidator from "../middleware/tokenValidator";
import * as validators from "../middleware/validators";
import { upload } from "../middleware/multerParser"

import { AuthController } from "../controllers/coach/authController";
import { ChatController } from "../controllers/coach/chatController";


const coachRoute = express.Router();

const authController = new AuthController();
const chatController = new ChatController();


// auth API
/* login route for employee login */
coachRoute.post("/login", validators.trimmer, joiSchemaValidation.validateBody(coachSchema.login), authController.login);

/* reset pass route for all */
coachRoute.post("/resetPassword", validators.trimmer, joiSchemaValidation.validateBody(coachSchema.resetPassword), tokenValidator.validateCoachToken, authController.resetPassword);

/* forget pass route for employee */
coachRoute.post("/forgotPassword", validators.trimmer, joiSchemaValidation.validateBody(coachSchema.forgotPassword), authController.forgotPassword);

/* forget pass route for employee */
coachRoute.get("/getProfile", tokenValidator.validateCoachToken,  authController.getProfile);

/* forget pass route for employee */
coachRoute.put("/editProfile", validators.trimmer, tokenValidator.validateCoachToken, joiSchemaValidation.validateBody(coachSchema.editProfile), authController.editProfile);

/* update employer device token */
coachRoute.put("/updateEmployerDeviceToken", joiSchemaValidation.validateBody(coachSchema.updateEmployerDeviceToken), tokenValidator.validateCoachToken, authController.updateEmployerDeviceToken);

/* clear employer device token */
coachRoute.put("/clearEmployerDeviceToken", tokenValidator.validateCoachToken, authController.clearEmployerDeviceToken);


// Chat routes

/* get chat list */
coachRoute.get("/getChatList", validators.trimmer, tokenValidator.validateCoachToken, chatController.getChatList);

/* create video chat session*/
coachRoute.post("/createChatSession", validators.trimmer, tokenValidator.validateCoachToken, joiSchemaValidation.validateBody(coachSchema.createChatSession), chatController.createChatSession);

/* get video chat session id and token */
coachRoute.get("/getChatSessionIdandToken/:chat_room_id", validators.trimmer, tokenValidator.validateCoachToken, joiSchemaValidation.validateParams(coachSchema.getChatSessionIdandToken), chatController.getChatSessionIdandToken);

/* create video chat session*/
coachRoute.delete("/dropChatSession", validators.trimmer, tokenValidator.validateCoachToken, joiSchemaValidation.validateBody(coachSchema.dropChatSession), chatController.dropChatSession);

/* create video chat session*/
coachRoute.get("/checkChatSession/:chat_room_id", validators.trimmer, tokenValidator.validateCoachToken, joiSchemaValidation.validateParams(coachSchema.checkChatSession), chatController.checkChatSession);

/* send video/audio chat notification*/
coachRoute.post("/sendChatNotification", validators.trimmer, tokenValidator.validateCoachToken, joiSchemaValidation.validateBody(coachSchema.sendChatNotification), chatController.sendChatNotification);

/* send disconnect video/audio chat notification*/
coachRoute.post("/sendChatDisconnectNotification", validators.trimmer, tokenValidator.validateCoachToken, joiSchemaValidation.validateBody(coachSchema.sendChatDisconnectNotification), chatController.sendChatDisconnectNotification);

/* clear Chat*/
coachRoute.delete("/clearChat", validators.trimmer, tokenValidator.validateCoachToken, joiSchemaValidation.validateBody(coachSchema.clearChat), chatController.clearChat);

/* contact us for employee */
coachRoute.get("/getNotifications", validators.trimmer, tokenValidator.validateCoachToken, chatController.getNotifications);

/* to get unseen notification count */
coachRoute.get("/getUnseenNotificationCount", validators.trimmer, tokenValidator.validateCoachToken, chatController.getUnseenNotificationCount);

/* contact us for employee */
coachRoute.put("/markNotificationsAsViewed", validators.trimmer, tokenValidator.validateCoachToken, joiSchemaValidation.validateBody(coachSchema.markNotificationsAsViewed), chatController.markNotificationsAsViewed);


/* upload media files */
coachRoute.post("/uploadFile", tokenValidator.validateCoachToken, upload.single('file'), authController.uploadFile);

export = coachRoute;