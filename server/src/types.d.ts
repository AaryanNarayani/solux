export {};
declare module 'hono' {
    interface HonoRequest {
        rpcUrl?: string;
    }
}