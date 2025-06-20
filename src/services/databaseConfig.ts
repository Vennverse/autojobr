// Database Configuration Service for Flexible Deployment
export interface DatabaseConfig {
  type: 'supabase' | 'postgresql' | 'azure';
  url: string;
  apiKey?: string;
  connectionString?: string;
}

export class DatabaseConfigService {
  private static instance: DatabaseConfigService;
  private config: DatabaseConfig;

  private constructor() {
    this.config = this.initializeConfig();
  }

  static getInstance(): DatabaseConfigService {
    if (!DatabaseConfigService.instance) {
      DatabaseConfigService.instance = new DatabaseConfigService();
    }
    return DatabaseConfigService.instance;
  }

  private initializeConfig(): DatabaseConfig {
    const dbType = import.meta.env.VITE_DB_TYPE || 'supabase';
    
    switch (dbType) {
      case 'supabase':
        return {
          type: 'supabase',
          url: import.meta.env.VITE_SUPABASE_URL,
          apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        };
      
      case 'postgresql':
        return {
          type: 'postgresql',
          url: import.meta.env.VITE_LOCAL_DB_URL,
          connectionString: import.meta.env.VITE_LOCAL_DB_URL,
        };
      
      case 'azure':
        return {
          type: 'azure',
          url: import.meta.env.VITE_AZURE_DB_URL,
          connectionString: import.meta.env.VITE_AZURE_DB_URL,
        };
      
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }

  getConfig(): DatabaseConfig {
    return this.config;
  }

  isSupabase(): boolean {
    return this.config.type === 'supabase';
  }

  isPostgreSQL(): boolean {
    return this.config.type === 'postgresql';
  }

  isAzure(): boolean {
    return this.config.type === 'azure';
  }

  validateConfig(): boolean {
    const { type, url, apiKey, connectionString } = this.config;
    
    if (!url) {
      console.error(`Database URL is missing for type: ${type}`);
      return false;
    }

    if (type === 'supabase' && !apiKey) {
      console.error('Supabase API key is missing');
      return false;
    }

    if ((type === 'postgresql' || type === 'azure') && !connectionString) {
      console.error(`Connection string is missing for type: ${type}`);
      return false;
    }

    return true;
  }
}

export const databaseConfig = DatabaseConfigService.getInstance();