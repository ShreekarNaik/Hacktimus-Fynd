import { LeaderboardEntry } from '../models/types';

export interface IBolticService {
    insertLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<LeaderboardEntry>;
    getLeaderboard(gameName: string, weekNumber: number, limit?: number): Promise<LeaderboardEntry[]>;
    insertRecord<T>(tableName: string, record: T): Promise<T>;
    sendNotification(email: string, template: string, data: any): Promise<{ status: string, messageId: string }>;
}

export interface IFyndService {
    createCoupon(userId: string, discountPercent: number, expiryHours?: number): Promise<{
        code: string;
        discount_value: { unit: string; value: number };
        validity: { end: string };
        _custom_json?: any;
    }>;
    getCart(cartId: string): Promise<any>;
    applyCoupon(cartId: string, couponCode: string): Promise<{ success: boolean; message: string }>;
}

export interface IDatabase {
    users: Record<string, any>;
    sessions: Record<string, any>;
    leaderboards: any[];
    rewards: Record<string, any>;
    carts: Record<string, any>;
}
