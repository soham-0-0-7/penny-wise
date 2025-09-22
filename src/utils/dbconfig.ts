"server-only";
import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TranslateConfig } from "@aws-sdk/lib-dynamodb";

const REGION = "ap-south-1";

if (!process.env.ACCESS_KEY || !process.env.SECRET_KEY) {
  throw new Error("not defined in environment variables");
}

const dbClientConfig: DynamoDBClientConfig = {
  region: REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
};

const ddbClient = new DynamoDBClient(dbClientConfig);

const marshallOptions: TranslateConfig["marshallOptions"] = {
  convertEmptyValues: false, // false by default
  removeUndefinedValues: true, // false by default
  convertClassInstanceToMap: false, // false by default
};

const unmarshallOptions: TranslateConfig["unmarshallOptions"] = {
  wrapNumbers: false, // true by default
};

const translateConfig: TranslateConfig = {
  marshallOptions,
  unmarshallOptions,
  // service: ddbClient,
};

const ddbDocumentClient = DynamoDBDocumentClient.from(
  ddbClient,
  translateConfig
);

export { ddbDocumentClient };
