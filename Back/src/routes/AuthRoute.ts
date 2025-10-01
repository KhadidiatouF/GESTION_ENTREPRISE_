import { Router } from "express";
import { AuthController } from "../controllers/AuthController";


const route = Router();


route.post('/login', AuthController.login)
route.get('/refresh', AuthController.refreshToken)


export default route