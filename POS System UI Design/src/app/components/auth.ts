export interface Account {
  name: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
}

export interface Session {
  username: string;
  name: string;
}

const ACCOUNTS_KEY = "pos.accounts";
const SESSION_KEY = "pos.session";

function readAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Account[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

export async function register(name: string, username: string, password: string): Promise<Session> {
  const cleanName = name.trim();
  const cleanUser = username.trim().toLowerCase();
  if (cleanName.length < 2) throw new Error("Jina lazima liwe na herufi 2 au zaidi.");
  if (cleanUser.length < 3) throw new Error("Jina la mtumiaji lazima liwe na herufi 3 au zaidi.");
  if (password.length < 6) throw new Error("Nenosiri lazima liwe na herufi 6 au zaidi.");

  const accounts = readAccounts();
  if (accounts.some(a => a.username === cleanUser)) {
    throw new Error("Jina la mtumiaji tayari limetumika.");
  }

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const account: Account = { name: cleanName, username: cleanUser, passwordHash, salt, createdAt: Date.now() };
  writeAccounts([...accounts, account]);

  const session: Session = { username: cleanUser, name: cleanName };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function login(username: string, password: string): Promise<Session> {
  const cleanUser = username.trim().toLowerCase();
  const account = readAccounts().find(a => a.username === cleanUser);
  if (!account) throw new Error("Jina la mtumiaji au nenosiri si sahihi.");

  const passwordHash = await hashPassword(password, account.salt);
  if (passwordHash !== account.passwordHash) {
    throw new Error("Jina la mtumiaji au nenosiri si sahihi.");
  }

  const session: Session = { username: account.username, name: account.name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
