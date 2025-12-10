import { db } from './db';
import { LeaderboardEntry } from '../../models/types';
import { IBolticService } from '../interfaces';

export class MockBolticService implements IBolticService {
  
  constructor() {
      this.seedMockLeaderboard();
  }

  private seedMockLeaderboard() {
      // Seed some fake data
      if (db.leaderboards.length === 0) {
          console.log("[MockBoltic] Seeding leaderboard data...");
          // Test User at Top for 'sandfall'
          db.leaderboards.push({ id: 'top-1', userId: 'test-user', gameName: 'sandfall', score: 9999, weekNumber: 1, timestamp: Date.now() });
          
          // Other randoms
          for(let i=0; i<8; i++) {
              db.leaderboards.push({
                  id: `mock-${i}`,
                  userId: `player_${Math.floor(Math.random()*1000)}`,
                  gameName: 'sandfall',
                  score: Math.floor(Math.random() * 5000) + 1000,
                  weekNumber: 1,
                  timestamp: Date.now() - Math.random() * 10000000
              });
          }
           // Test User at Top for 'spin'
          db.leaderboards.push({ id: 'top-spin-1', userId: 'test-user', gameName: 'spin', score: 5000, weekNumber: 1, timestamp: Date.now() });
      }
  }

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
  
  async removeLeaderboardEntry(userId: string, gameName: string): Promise<boolean> {
      const initialLen = db.leaderboards.length;
      db.leaderboards = db.leaderboards.filter(e => !(e.userId === userId && e.gameName === gameName));
      console.log(`[MockBoltic] Removed leaderboard entry for ${userId} in ${gameName}. Was: ${initialLen}, Now: ${db.leaderboards.length}`);
      return db.leaderboards.length < initialLen;
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
