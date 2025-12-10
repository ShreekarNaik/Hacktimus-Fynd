import { db } from './db';
import { LeaderboardEntry } from '../../models/types';
import { IBolticService } from '../interfaces';

export class MockBolticService implements IBolticService {
  
  // Simulate Boltic Tables.insert
  async insertLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<LeaderboardEntry> {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Math.random().toString(36).substring(7)
    };
    db.leaderboards.push(newEntry);
    this.recalculateRanking(); // Mocking workflow effect? Or just basic sorting
    return newEntry;
  }

  // Generic insert for other tables
  async insertRecord<T>(tableName: string, record: T): Promise<T> {
      console.log(`[MockBoltic] Inserting into ${tableName}:`, record);
      // In a real mock we might store this, but for now just logging
      return record;
  }

  // Simulate Boltic Tables.list (with sorting for leaderboard)
  async getLeaderboard(gameName: string, weekNumber: number, limit: number = 10): Promise<LeaderboardEntry[]> {
    return db.leaderboards
      .filter(e => e.gameName === gameName && e.weekNumber === weekNumber)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Simulate workflow triggers?
  // We can just keep it simple: functions that modify DB directly
  private recalculateRanking() {
    // In a real system, this might be a complex scheduled job or materialized view
    // Here we just let the getLeaderboard sort it on read
  }

  // Mock Notification
  async sendNotification(email: string, template: string, data: any) {
    console.log(`[MockBoltic] Sending Email to ${email} | Template: ${template} | Data:`, data);
    return { status: 'sent', messageId: 'mock-msg-' + Date.now() };
  }
}

export const boltic = new MockBolticService();
