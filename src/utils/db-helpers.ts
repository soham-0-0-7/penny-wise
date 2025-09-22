// @/utils/db-helpers.ts
import { ddbDocumentClient } from "./dbconfig";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// ------------ Type Definitions ------------
export type Category =
  | "expense (necessity)"
  | "expense (discretionary)"
  | "savings"
  | "investment";

export interface User {
  name: string;
  email: string;
  password: string;
  income: string;
  lastPayDate: string;
  totalSavings: number;
  totalInvestment: number;
  monthSavings: number;
  monthInvestment: number;
  monthExpensesNecessity: number;
  monthExpensesDiscretionary: number;
}

export interface Expense {
  id: string;
  email: string;
  reason: string;
  category: Category;
  description: string;
  amount: number;
  createdAt: string;
  cycle: boolean;
}

export interface Notification {
  id: string;
  email: string;
  message: string;
  createdAt: string;
}

// ------------ Constants ------------
const USERS_TABLE = "users";
const EXPENSES_TABLE = "expenses";
const NOTIFS_TABLE = "notifications";

// ------------ User Functions ------------

export async function getUserByEmail(email: string): Promise<User | null> {
  const cmd = new GetCommand({
    TableName: USERS_TABLE,
    Key: { email },
  });

  const result = await ddbDocumentClient.send(cmd);
  return result.Item as User | null;
}

export async function putUser(user: User): Promise<void> {
  await ddbDocumentClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
    })
  );
}

// ------------ Expense Functions ------------

export async function getUserExpenses(email: string): Promise<Expense[]> {
  const cmd = new QueryCommand({
    TableName: EXPENSES_TABLE,
    IndexName: "email",
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: {
      ":e": email,
    },
  });

  const result = await ddbDocumentClient.send(cmd);
  return (result.Items || []) as Expense[];
}

export async function addExpense(expense: Expense): Promise<void> {
  await ddbDocumentClient.send(
    new PutCommand({
      TableName: EXPENSES_TABLE,
      Item: expense,
    })
  );
}

export async function deleteExpense(id: string): Promise<void> {
  await ddbDocumentClient.send(
    new DeleteCommand({
      TableName: EXPENSES_TABLE,
      Key: { id },
    })
  );
}

// ------------ Notification Functions ------------

export async function getUserNotifications(
  email: string
): Promise<Notification[]> {
  const cmd = new QueryCommand({
    TableName: NOTIFS_TABLE,
    IndexName: "email",
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: {
      ":e": email,
    },
  });

  const result = await ddbDocumentClient.send(cmd);
  return (result.Items || []) as Notification[];
}

export async function addNotification(n: Notification): Promise<void> {
  await ddbDocumentClient.send(
    new PutCommand({
      TableName: NOTIFS_TABLE,
      Item: n,
    })
  );
}

export async function deleteNotification(id: string): Promise<void> {
  await ddbDocumentClient.send(
    new DeleteCommand({
      TableName: NOTIFS_TABLE,
      Key: { id },
    })
  );
}
