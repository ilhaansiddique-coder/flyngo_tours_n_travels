import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  constructor(private readonly env: Record<string, string | undefined>) {}

  get(key: string): string {
    const value = this.env[key];
    if (value === undefined) {
      throw new Error(`Config key "${key}" is not defined`);
    }
    return value;
  }

  getOrNull(key: string): string | null {
    return this.env[key] ?? null;
  }

  getNumber(key: string): number {
    const value = this.get(key);
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      throw new Error(`Config key "${key}" is not a valid number: ${value}`);
    }
    return num;
  }

  getBoolean(key: string): boolean {
    const value = this.get(key).toLowerCase();
    return value === 'true' || value === '1';
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  get isDevelopment(): boolean {
    return !this.isProduction;
  }

  get isMultiTenant(): boolean {
    return this.getBoolean('MULTI_TENANT');
  }
}
