import { Role } from "@prisma/client";
import { HttpCode } from "../enums/codeError";
import { FormaterResponse } from "./FormateReponse";
import { NextFunction, Response, Request } from "express";

export const roleMiddleware = (rolesAutorises: Role[]) => {
  return (req: Request & { user?: { id: number; email: string; role: Role } }, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return FormaterResponse.failed(res, "Role non trouvé", HttpCode.NO_CONTENT)
    }

    if (!rolesAutorises.includes(userRole)) {
      return FormaterResponse.failed(res, "Accès refusé", HttpCode.FORBIDDEN)
    }

    next();
  };
};
