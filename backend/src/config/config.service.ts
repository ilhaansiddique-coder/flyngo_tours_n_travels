import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfig: NestConfigService) {}

  get(key: string, fallback?: string): string {
    const value = this.nestConfig.get<string>(key);
    if (value === undefined || value === null) {
      if (fallback !== undefined) return fallback;
      throw new Error(`Config key "${key}" is not defined`);
    }
    return value;
  }

  getOrNull(key: string): string | null {
    return this.nestConfig.get<string | null>(key) ?? null;
  }

  getNumber(key: string, fallback?: number): number {
    const value = this.nestConfig.get(key);
    if (value === undefined || value === null) {
      if (fallback !== undefined) return fallback;
      throw new Error(`Config key "${key}" is not defined`);
    }
    return Number(value);
  }

  getBoolean(key: string, fallback?: boolean): boolean {
    const value = this.nestConfig.get(key);
    if (value === undefined || value === null) {
      if (fallback !== undefined) return fallback;
      throw new Error(`Config key "${key}" is not defined`);
    }
    return String(value).toLowerCase() === 'true' || value === true || value === '1';
  }

  get isProduction(): boolean {
    return this.nestConfig.get('NODE_ENV', 'development') === 'production';
  }

  get isDevelopment(): boolean {
    return !this.isProduction;
  }

  get isMultiTenant(): boolean {
    return this.getBoolean('MULTI_TENANT', false);
  }
}
