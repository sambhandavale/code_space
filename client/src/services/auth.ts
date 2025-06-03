import { NextFunction } from "express";
import { removeLocalStorage } from "../utility/helper";

import { getAction } from "./generalServices";

export const logout = (next: NextFunction) => {
    removeLocalStorage("user");
    removeLocalStorage("expirationDate");
    removeLocalStorage('token');
    getAction("/auth/logout", next);
  };