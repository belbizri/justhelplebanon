import mongoose from 'mongoose';
import 'dotenv/config';

export const buildMongoOptions = (dbName) => ({
  dbName,
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
});

/**
 * MongoDB Database Connection Manager
 * Handles connection lifecycle, pooling, and error handling
 */

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  /**
   * Initialize MongoDB connection with proper error handling
   */
  async connect() {
    if (this.isConnected) {
      console.log('✓ Already connected to MongoDB');
      return this.connection;
    }

    try {
      const mongoUri = process.env.MONGODB_URI;
      const dbName = process.env.MONGODB_DB_NAME || 'justhelplebanon';

      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }

      console.log('🔄 Connecting to MongoDB...');

      this.connection = await mongoose.connect(mongoUri, buildMongoOptions(dbName));

      this.isConnected = true;

      console.log('✓ MongoDB connected successfully');
      console.log(`  Database: ${dbName}`);
      console.log(`  Connection State: ${this.connection.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✓ MongoDB reconnected');
        this.isConnected = true;
      });

      return this.connection;
    } catch (error) {
      this.isConnected = false;
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Close database connection gracefully
   */
  async disconnect() {
    if (!this.isConnected) {
      console.log('Already disconnected from MongoDB');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✓ MongoDB disconnected gracefully');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      db: mongoose.connection.name,
      host: mongoose.connection.host,
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!mongoose.connection.db) {
        return { healthy: false, message: 'MongoDB is not connected' };
      }

      await mongoose.connection.db.admin().ping();
      return { healthy: true, message: 'MongoDB is responsive' };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }
}

// Singleton instance
const dbConnection = new DatabaseConnection();

export default dbConnection;
