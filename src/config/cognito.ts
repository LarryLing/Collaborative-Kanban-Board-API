import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

import { AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_REGION } from "../constants.js";

const cognito = new CognitoIdentityProviderClient({
  credentials: {
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    accessKeyId: AWS_ACCESS_KEY_ID,
  },
  region: AWS_REGION,
});

export default cognito;
