import { CognitoJwtVerifier } from "aws-jwt-verify";

import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID } from "../constants.js";

const jwtVerifier = CognitoJwtVerifier.create({
  clientId: COGNITO_CLIENT_ID,
  tokenUse: "access",
  userPoolId: COGNITO_USER_POOL_ID,
});

export default jwtVerifier;
