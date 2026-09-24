import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let cachedVersionInfo: {
  version: string;
  shortVersion: string;
  message: string;
  builtAt: string;
} | null = null;

function readVersionInfo() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'version.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // fallback below
  }

  // Fallback to BUILD_ID
  try {
    const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
    if (fs.existsSync(buildIdPath)) {
      const id = fs.readFileSync(buildIdPath, 'utf-8').trim();
      return {
        version: id,
        shortVersion: id.substring(0, 7),
        message: 'New release deployed',
        builtAt: new Date().toISOString(),
      };
    }
  } catch {
    // fallback below
  }

  if (!cachedVersionInfo) {
    const v = process.env.NEXT_PUBLIC_BUILD_SHA || process.env.GIT_SHA || Date.now().toString(36);
    cachedVersionInfo = {
      version: v,
      shortVersion: v.substring(0, 7),
      message: process.env.GIT_COMMIT_MESSAGE || 'New release deployed',
      builtAt: new Date().toISOString(),
    };
  }

  return cachedVersionInfo;
}

export async function GET() {
  const info = readVersionInfo();

  return NextResponse.json(info, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
