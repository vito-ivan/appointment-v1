import { Injectable, OnModuleDestroy } from "@nestjs/common";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import mysql, { Pool, PoolOptions } from "mysql2/promise";

@Injectable()
export class MySqlConnection implements OnModuleDestroy {
  private pool!: Pool;
  private static cachedCreds: { user: string; password: string } | null = null;

  private async resolveDbCreds(): Promise<{ user: string; password: string }> {
    if (MySqlConnection.cachedCreds) return MySqlConnection.cachedCreds;
    const secretId = process.env.MYSQL_SECRET_ARN;
    if (!secretId)
      throw new Error(
        "DB credentials secret not configured. Set MYSQL_SECRET_ARN."
      );

    const region =
      process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "us-east-1";
    const sm = new SecretsManagerClient({ region });
    const { SecretString, SecretBinary } = await sm.send(
      new GetSecretValueCommand({ SecretId: secretId })
    );
    const json =
      SecretString ??
      (SecretBinary
        ? Buffer.from(SecretBinary as any, "base64").toString("utf8")
        : undefined);
    if (!json)
      throw new Error("DB credentials secret has no SecretString/SecretBinary");

    let obj: any;
    try {
      obj = JSON.parse(json);
    } catch {
      throw new Error("DB credentials secret is not valid JSON");
    }
    const user = obj.username ?? obj.user;
    const password = obj.password ?? obj.pwd;
    if (!user || !password)
      throw new Error(
        "DB credentials secret must contain 'username' and 'password' (or 'user'/'pwd')."
      );
    MySqlConnection.cachedCreds = { user, password };
    return MySqlConnection.cachedCreds;
  }

  async getPool(): Promise<Pool> {
    if (!this.pool) {
      const host = process.env.MYSQL_HOST || "localhost";
      const creds = await this.resolveDbCreds();
      const config: PoolOptions = {
        host,
        port: +(process.env.MYSQL_PORT || 3306),
        user: creds.user,
        password: creds.password,
        database: process.env.MYSQL_DATABASE || "appointments",
        connectionLimit: +(process.env.MYSQL_POOL_SIZE || 2),
        waitForConnections: true,
      };

      const sslEnv = process.env.MYSQL_SSL;
      const enableTls = sslEnv ? sslEnv !== "false" : true;
      if (enableTls) {
        const rejectUnauthorized =
          process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false";
        (config as any).ssl = { minVersion: "TLSv1.2", rejectUnauthorized };
      }
      this.pool = mysql.createPool(config);
    }
    return this.pool;
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
