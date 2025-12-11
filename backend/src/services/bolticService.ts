import { createClient } from "@boltic/sdk";
import {
  LeaderboardEntry,
  User,
  GameSession,
  Reward,
  CartAbandonment,
} from "../models/types";
import { IBolticService } from "./interfaces";

// Note: Tables use snake_case column names (user_id, game_name, etc.)
// Auto-generated columns: id, created_at, updated_at

export class BolticService implements IBolticService {
  private client: any;

  constructor() {
    // Lazy initialization - create client when service is instantiated
    const apiKey = process.env.BOLTIC_API_KEY;
    if (!apiKey) {
      throw new Error("BOLTIC_API_KEY environment variable is not set");
    }

    this.client = createClient(apiKey, {
      region: (process.env.BOLTIC_REGION as any) || "asia-south1",
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      debug: process.env.NODE_ENV !== "production",
    });

    console.log(
      "[BolticService] Initialized with region:",
      process.env.BOLTIC_REGION || "asia-south1"
    );
  }

  /**
   * Insert a new leaderboard entry
   */
  async insertLeaderboardEntry(
    entry: Omit<LeaderboardEntry, "id">
  ): Promise<LeaderboardEntry> {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: this.generateId(),
    };

    try {
      // Using SQL INSERT for Boltic Tables (with snake_case column names)
      const sql = `
        INSERT INTO leaderboard ("user_id", "game_name", "score", "week_number", "timestamp")
        VALUES ('${newEntry.userId}', '${newEntry.gameName}', ${newEntry.score}, ${newEntry.weekNumber}, ${newEntry.timestamp});
      `;

      await this.executeSql(sql);
      console.log("[BolticService] Inserted leaderboard entry:", newEntry.id);
      return newEntry;
    } catch (error) {
      console.error(
        "[BolticService] Error inserting leaderboard entry:",
        error
      );
      throw error;
    }
  }

  /**
   * Get leaderboard for a specific game and week
   */
  async getLeaderboard(
    gameName: string,
    weekNumber: number,
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    try {
      const sql = `
        SELECT * FROM leaderboard 
        WHERE "game_name" = '${this.escapeSql(
          gameName
        )}' AND "week_number" = ${weekNumber}
        ORDER BY "score" DESC
        LIMIT ${limit};
      `;

      const result = await this.executeSql(sql);
      console.log(
        "[BolticService] Retrieved leaderboard for",
        gameName,
        "week",
        weekNumber
      );
      return result || [];
    } catch (error) {
      console.error("[BolticService] Error getting leaderboard:", error);
      return [];
    }
  }

  /**
   * Remove a leaderboard entry for a user and game
   */
  async removeLeaderboardEntry(
    userId: string,
    gameName: string
  ): Promise<boolean> {
    try {
      const sql = `
        DELETE FROM leaderboard 
        WHERE "user_id" = '${this.escapeSql(
          userId
        )}' AND "game_name" = '${this.escapeSql(gameName)}';
      `;

      await this.executeSql(sql);
      console.log(
        "[BolticService] Removed leaderboard entry for",
        userId,
        "in",
        gameName
      );
      return true;
    } catch (error) {
      console.error("[BolticService] Error removing leaderboard entry:", error);
      return false;
    }
  }

  /**
   * Generic insert method for any table
   */
  async insertRecord<T>(tableName: string, record: T): Promise<T> {
    try {
      // Convert camelCase keys to snake_case for database columns
      const camelToSnake = (str: string) =>
        str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

      // Auto-generated columns - exclude from INSERT
      const autoColumns = ["id", "created_at", "updated_at"];

      const entries = Object.entries(record as any).filter(
        ([key]) => !autoColumns.includes(camelToSnake(key))
      );

      const columns = entries
        .map(([col]) => `"${camelToSnake(col)}"`)
        .join(", ");
      const values = entries.map(([, v]) => this.formatValue(v)).join(", ");

      const sql = `
        INSERT INTO ${tableName} (${columns})
        VALUES (${values});
      `;

      await this.executeSql(sql);
      console.log("[BolticService] Inserted record into", tableName);
      return record;
    } catch (error) {
      console.error(
        "[BolticService] Error inserting record into",
        tableName,
        error
      );
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const sql = `SELECT * FROM users WHERE "user_id" = '${this.escapeSql(
        userId
      )}' LIMIT 1;`;
      const result = await this.executeSql(sql);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("[BolticService] Error getting user:", error);
      return null;
    }
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<User | null> {
    try {
      const camelToSnake = (str: string) =>
        str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

      const setClause = Object.entries(updates)
        .map(
          ([key, value]) =>
            `"${camelToSnake(key)}" = ${this.formatValue(value)}`
        )
        .join(", ");

      const sql = `UPDATE users SET ${setClause} WHERE "user_id" = '${this.escapeSql(
        userId
      )}';`;
      await this.executeSql(sql);

      return await this.getUser(userId);
    } catch (error) {
      console.error("[BolticService] Error updating user:", error);
      return null;
    }
  }

  /**
   * Get game sessions for a user
   */
  async getUserGameSessions(
    userId: string,
    limit: number = 10
  ): Promise<GameSession[]> {
    try {
      const sql = `
        SELECT * FROM game_sessions 
        WHERE "user_id" = '${this.escapeSql(userId)}' 
        ORDER BY "completed_at" DESC 
        LIMIT ${limit};
      `;
      const result = await this.executeSql(sql);
      return result || [];
    } catch (error) {
      console.error("[BolticService] Error getting game sessions:", error);
      return [];
    }
  }

  /**
   * Get rewards for a user
   */
  async getUserRewards(
    userId: string,
    redeemedFilter?: boolean
  ): Promise<Reward[]> {
    try {
      let sql = `SELECT * FROM rewards WHERE "user_id" = '${this.escapeSql(
        userId
      )}'`;

      if (redeemedFilter !== undefined) {
        sql += ` AND "redeemed" = ${redeemedFilter}`;
      }

      sql += ` ORDER BY "distributed_at" DESC NOLIMIT;`;

      const result = await this.executeSql(sql);
      return result || [];
    } catch (error) {
      console.error("[BolticService] Error getting user rewards:", error);
      return [];
    }
  }

  /**
   * Get cart abandonment by cart ID
   */
  async getCartAbandonment(cartId: string): Promise<CartAbandonment | null> {
    try {
      const sql = `SELECT * FROM cart_abandonments WHERE "id" = '${this.escapeSql(
        cartId
      )}' LIMIT 1;`;
      const result = await this.executeSql(sql);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("[BolticService] Error getting cart abandonment:", error);
      return null;
    }
  }

  /**
   * Update cart abandonment
   */
  async updateCartAbandonment(
    cartId: string,
    updates: Partial<CartAbandonment>
  ): Promise<boolean> {
    try {
      const camelToSnake = (str: string) =>
        str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

      const setClause = Object.entries(updates)
        .map(
          ([key, value]) =>
            `"${camelToSnake(key)}" = ${this.formatValue(value)}`
        )
        .join(", ");

      const sql = `UPDATE cart_abandonments SET ${setClause} WHERE "id" = '${this.escapeSql(
        cartId
      )}';`;
      await this.executeSql(sql);
      return true;
    } catch (error) {
      console.error("[BolticService] Error updating cart abandonment:", error);
      return false;
    }
  }

  /**
   * Send notification - Using Boltic Workflows/Streams if available
   * For now, this is a stub that would integrate with email service
   */
  async sendNotification(
    email: string,
    template: string,
    data: any
  ): Promise<{ status: string; messageId: string }> {
    console.log("[BolticService] Notification triggered:", {
      email,
      template,
      data,
    });

    // TODO: Integrate with Boltic Workflows for email sending
    // For hackathon, just log it
    return {
      status: "queued",
      messageId: `notification-${Date.now()}`,
    };
  }

  // ===== Helper Methods =====

  /**
   * Execute SQL query on Boltic Tables using the SDK
   */
  private async executeSql(sql: string): Promise<any> {
    try {
      console.log("[BolticService] Executing SQL:", sql);

      // Use the official SDK method: client.sql.executeSQL()
      const result = await this.client.sql.executeSQL(sql);

      // Check if there's an error in the response
      if (result.error) {
        const errorMsg = Array.isArray(result.error.meta)
          ? result.error.meta.join(", ")
          : result.error.meta || "Unknown error";

        // Provide helpful message for common errors
        if (errorMsg.includes("does not exist")) {
          throw new Error(
            `Table/Column not found: ${errorMsg}. Please create the required tables in Boltic Console.`
          );
        }
        throw new Error(`Boltic API Error: ${errorMsg}`);
      }

      // Response format for successful queries: { data: [], count: 0 }
      const rows = result.data || [];
      console.log(
        `[BolticService] Query executed successfully, returned ${
          Array.isArray(rows) ? rows.length : 0
        } rows`
      );
      return rows;
    } catch (error: any) {
      console.error(
        "[BolticService] SQL execution error:",
        error.message || error
      );
      throw error;
    }
  }

  /**
   * Format value for SQL based on type
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return "NULL";
    }
    if (typeof value === "string") {
      return `'${this.escapeSql(value)}'`;
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (typeof value === "object") {
      // JSON fields
      return `'"${JSON.stringify(value).replace(/"/g, '\\"')}"'`;
    }
    return String(value);
  }

  /**
   * Escape SQL string to prevent injection
   */
  private escapeSql(str: string): string {
    if (!str) return "";
    return str.replace(/'/g, "''");
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Lazy initialization - instance created on first access
let bolticInstance: BolticService | null = null;

export const boltic = new Proxy({} as BolticService, {
  get(target, prop) {
    if (!bolticInstance) {
      bolticInstance = new BolticService();
    }
    const value = (bolticInstance as any)[prop];
    return typeof value === "function" ? value.bind(bolticInstance) : value;
  },
});
