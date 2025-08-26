import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "../constants.js";

const cognito = new CognitoIdentityProviderClient({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: AWS_REGION,
});

export default cognito;
