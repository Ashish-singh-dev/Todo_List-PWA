import bearer from "@elysiajs/bearer";
import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";

import { rateLimiterkeyGenerator } from "@/libs/rate-limiter-key-generator";
import {
  emailVerificationSchema,
  loginUserSchema,
  logoutSchema,
  passwordResetSchema,
  passwordResetTokenSchema,
  registerUserSchema
} from "@/v1/validations/user";

import { emailVerification } from "../controllers/user/email-verification";
import { loginUser } from "../controllers/user/login";
import { logout, logoutAll } from "../controllers/user/logout";
import { passwordReset } from "../controllers/user/password-reset";
import { passwordResetToken } from "../controllers/user/password-reset-token";
import { getProfile } from "../controllers/user/profile";
import { registerUser } from "../controllers/user/register";
import { errorHandlerInstance } from "../utils/error-handler";
import { deriveUser } from "../utils/note/derive-user";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(errorHandlerInstance)
  .use(bearer())
  .use(
    rateLimit({
      max: 5,
      scoping: "scoped",
      generator: rateLimiterkeyGenerator
    })
  )
  .post("/register", registerUser, {
    body: registerUserSchema
  })
  .post("/login", loginUser, {
    body: loginUserSchema
  })
  .post("/logout", logout, { body: logoutSchema })
  .post("/logout-all", logoutAll)
  .get("/profile", getProfile);

export const passwordResetRoute = new Elysia({ prefix: "/auth" })
  .use(bearer())
  .use(errorHandlerInstance)
  .use(
    rateLimit({
      scoping: "scoped",
      max: 3,
      generator: rateLimiterkeyGenerator,
      countFailedRequest: true
    })
  )
  .post("/reset-password", passwordReset, { body: passwordResetSchema })
  .post("/reset-password/:token", passwordResetToken, {
    body: passwordResetTokenSchema
  });

export const emailVerificationRoute = new Elysia({ prefix: "/auth" })
  .use(bearer())
  .use(errorHandlerInstance)
  .derive(deriveUser)
  .use(
    rateLimit({
      scoping: "scoped",
      max: 3,
      generator: rateLimiterkeyGenerator,
      countFailedRequest: true
    })
  )
  .post("/email-verification", emailVerification, {
    body: emailVerificationSchema
  });
