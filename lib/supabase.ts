import { createBrowserClient } from '@supabase/ssr';
import { demoSession, demoUser, isDemoMode } from './demo';
import { getLocalData, setLocalData } from './localStore';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!isDemoMode && (!supabaseUrl || !supabaseAnonKey)) {
    console.warn('Supabase credentials are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.');
}

class DemoQueryBuilder {
    private rows: any[];
    private shouldSingle = false;
    private countOnly = false;

    constructor(private table: string) {
        this.rows = [...getLocalData(table)];
    }

    select(_columns = '*', options?: { count?: string; head?: boolean }) {
        this.countOnly = Boolean(options?.count || options?.head);
        return this;
    }

    eq(column: string, value: unknown) {
        this.rows = this.rows.filter((row) => row[column] === value);
        return this;
    }

    neq(column: string, value: unknown) {
        this.rows = this.rows.filter((row) => row[column] !== value);
        return this;
    }

    order(column: string, options?: { ascending?: boolean }) {
        const direction = options?.ascending === false ? -1 : 1;
        this.rows = [...this.rows].sort((a, b) => {
            const aValue = a[column] ?? '';
            const bValue = b[column] ?? '';
            return aValue > bValue ? direction : aValue < bValue ? -direction : 0;
        });
        return this;
    }

    limit(count: number) {
        this.rows = this.rows.slice(0, count);
        return this;
    }

    range(from: number, to: number) {
        this.rows = this.rows.slice(from, to + 1);
        return this;
    }

    single() {
        this.shouldSingle = true;
        return this;
    }

    insert(payload: any) {
        const inserted = Array.isArray(payload) ? payload : [payload];
        const newRows = inserted.map((row, index) => ({
            id: row.id || `demo-${this.table}-${Date.now()}-${index}`,
            created_at: row.created_at || new Date().toISOString(),
            ...row,
        }));
        
        const fullRows = getLocalData(this.table);
        const updatedRows = [...fullRows, ...newRows];
        setLocalData(this.table, updatedRows);
        
        this.rows = newRows;
        this.shouldSingle = inserted.length === 1;
        return this;
    }

    update(payload: any) {
        const fullRows = getLocalData(this.table);
        const matchedIds = new Set(this.rows.map(r => r.id));
        const updatedFullRows = fullRows.map(row => {
            if (matchedIds.has(row.id)) {
                const updatedRow = { ...row, ...payload };
                this.rows = this.rows.map(r => r.id === row.id ? updatedRow : r);
                return updatedRow;
            }
            return row;
        });
        setLocalData(this.table, updatedFullRows);
        return this;
    }

    delete() {
        const fullRows = getLocalData(this.table);
        const matchedIds = new Set(this.rows.map(r => r.id));
        const remainingFullRows = fullRows.filter(row => !matchedIds.has(row.id));
        setLocalData(this.table, remainingFullRows);
        this.rows = [];
        return this;
    }

    upsert(payload: any) {
        return this.insert(payload);
    }

    private resolve() {
        if (this.countOnly) {
            return { data: null, count: this.rows.length, error: null };
        }

        if (this.shouldSingle) {
            return {
                data: this.rows[0] ?? null,
                error: this.rows[0] ? null : { code: 'PGRST116', message: 'Demo row not found' },
            };
        }

        return { data: this.rows, error: null, count: this.rows.length };
    }

    then(resolve: (value: any) => void, reject?: (reason?: any) => void) {
        return Promise.resolve(this.resolve()).then(resolve, reject);
    }
}

const demoSupabase = {
    auth: {
        getSession: async () => ({ data: { session: demoSession }, error: null }),
        getUser: async () => ({ data: { user: demoUser }, error: null }),
        onAuthStateChange: () => ({
            data: {
                subscription: {
                    unsubscribe: () => undefined,
                },
            },
        }),
        signUp: async () => ({ data: { session: demoSession, user: demoUser }, error: null }),
        signInWithPassword: async () => ({ data: { session: demoSession, user: demoUser }, error: null }),
        signInWithOAuth: async () => ({ data: { provider: 'demo', url: '/dashboard' }, error: null }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ data: {}, error: null }),
        updateUser: async () => ({ data: { user: demoUser }, error: null }),
    },
    from: (table: string) => new DemoQueryBuilder(table),
    rpc: async (_name: string) => ({ data: [], error: null }),
    storage: {
        from: () => ({
            upload: async () => ({ data: { path: 'demo/avatar.png' }, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '/Resonate-Logo.png' } }),
            remove: async () => ({ data: [], error: null }),
        }),
    },
};

// Create a single supabase client for interacting with your database
export const supabase = isDemoMode
    ? demoSupabase as any
    : createBrowserClient(supabaseUrl, supabaseAnonKey);
