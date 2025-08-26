import { CognitoJwtVerifier } from "aws-jwt-verify";

import { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } from "../constants.js";

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
  tokenUse: "access",
});

export default jwtVerifier;
