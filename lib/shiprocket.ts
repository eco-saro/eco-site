/**
 * Shiprocket API Utility Service
 * Production-ready implementation with:
 * - Automated JWT Authentication & In-memory Caching
 * - Thread-safe Login (Concurrent call prevention)
 * - Automatic 401 Re-authentication & Retry logic
 * - Dynamic Pickup Location Fetching
 * - Strict TypeScript Interfaces
 * - Structured Production-grade Logging
 */

const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external";

// --- Interfaces ---

export interface ShiprocketAuthResponse {
    token: string;
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export interface ShiprocketPickupLocation {
    id: number;
    pickup_location: string;
    address: string;
    address_2?: string;
    city: string;
    state: string;
    country: string;
    pin_code: string;
    email: string;
    phone: string;
    name: string;
    status: number; // 1 for active
}

export interface ShiprocketPickupLocationsResponse {
    data: {
        shipping_address: ShiprocketPickupLocation[];
    };
}

export interface ShiprocketOrderItem {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: string;
    tax?: string;
    hsn?: string;
}

export interface ShiprocketOrderPayload {
    order_id: string; // Internal Order ID
    order_date: string; // Format: YYYY-MM-DD HH:MM
    pickup_location?: string; // Will fetch dynamic default if missing
    channel_id?: string;
    comment?: string;
    billing_customer_name: string;
    billing_last_name: string;
    billing_address: string;
    billing_address_2?: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    shipping_customer_name?: string;
    shipping_last_name?: string;
    shipping_address?: string;
    shipping_address_2?: string;
    shipping_city?: string;
    shipping_pincode?: string;
    shipping_country?: string;
    shipping_state?: string;
    shipping_email?: string;
    shipping_phone?: string;
    order_items: ShiprocketOrderItem[];
    payment_method: "Prepaid" | "COD";
    shipping_charges?: number;
    giftwrap_charges?: number;
    transaction_avail_det?: any;
    total_discount?: number;
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
}

export interface ShiprocketOrderResponse {
    order_id: number;
    shipment_id: number;
    status: string;
    status_code: number;
    onboarding_completed_now: number;
    awb_code?: string;
    courier_name?: string;
    [key: string]: any;
}

// --- Service Implementation ---

class ShiprocketService {
    private static instance: ShiprocketService;
    private token: string | null = null;
    private tokenExpiry: number | null = null;
    private loginPromise: Promise<string> | null = null;

    // Cache for pickup locations
    private pickupLocations: ShiprocketPickupLocation[] | null = null;
    private pickupCacheExpiry: number | null = null;

    private constructor() { }

    public static getInstance(): ShiprocketService {
        if (!ShiprocketService.instance) {
            ShiprocketService.instance = new ShiprocketService();
        }
        return ShiprocketService.instance;
    }

    /**
     * Authenticate with Shiprocket and cache the Bearer token.
     */
    private async authenticate(force = false): Promise<string> {
        const now = Date.now();

        if (!force && this.token && this.tokenExpiry && now < this.tokenExpiry) {
            return this.token;
        }

        if (this.loginPromise) {
            return this.loginPromise;
        }

        this.loginPromise = (async () => {
            console.log("[Shiprocket] 🔐 Authenticating with API...");

            const email = process.env.SHIPROCKET_EMAIL;
            const password = process.env.SHIPROCKET_PASSWORD;
            const backupToken = process.env.SHIPROCKET_BACKUP_TOKEN;

            try {
                if (!email || !password) {
                    throw new Error("Shiprocket credentials (EMAIL/PASSWORD) missing.");
                }

                const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                    cache: 'no-store'
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(`Shiprocket Auth Failed: ${data.message || response.statusText}`);
                }

                this.token = data.token;
                // Tokens are valid for 10 days; expiry set to 9 days for safety
                this.tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;

                console.log("[Shiprocket] ✅ Authentication successful. Token cached.");
                return this.token!;
            } catch (error: any) {
                console.warn("[Shiprocket] ⚠️ Authentication Error:", error.message);

                // Fallback to backup token if available
                if (backupToken) {
                    try {
                        // Minimal JWT decoding to check expiry (middle part of the token)
                        const payload = JSON.parse(Buffer.from(backupToken.split('.')[1], 'base64').toString());
                        const backupExp = payload.exp * 1000;

                        if (Date.now() < backupExp) {
                            console.log("[Shiprocket] 🔄 Using valid backup token from environment.");
                            this.token = backupToken;
                            this.tokenExpiry = backupExp;
                            return this.token;
                        } else {
                            console.error("[Shiprocket] ❌ Backup token is also expired.");
                        }
                    } catch (e) {
                        console.error("[Shiprocket] ❌ Failed to parse backup token.");
                    }
                }

                throw error;
            } finally {
                this.loginPromise = null;
            }
        })();

        return this.loginPromise;
    }

    /**
     * Generic request wrapper with retry logic and error handling.
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        let token = await this.authenticate();

        const makeRequest = async (currentToken: string) => {
            return fetch(`${SHIPROCKET_API_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...options.headers,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
                cache: 'no-store'
            });
        };

        let response = await makeRequest(token);

        // Auto-refresh on 401 Unauthorized
        if (response.status === 401) {
            console.warn("[Shiprocket] 🔄 Token expired (401). refreshing...");
            token = await this.authenticate(true);
            response = await makeRequest(token);
        }

        const data = await response.json();

        if (!response.ok) {
            console.error(`[Shiprocket] ❌ API Error (${endpoint}) [${response.status}]:`, JSON.stringify(data, null, 2));
            throw new Error(data.message || `Shiprocket API failed with status ${response.status}`);
        }

        return data as T;
    }

    /**
     * Fetch all pickup locations configured in Shiprocket.
     */
    public async getPickupLocations(): Promise<ShiprocketPickupLocation[]> {
        const now = Date.now();
        if (this.pickupLocations && this.pickupCacheExpiry && now < this.pickupCacheExpiry) {
            return this.pickupLocations;
        }

        console.log("[Shiprocket] 📍 Fetching pickup locations using company/pickup endpoint...");
        const response = await this.request<ShiprocketPickupLocationsResponse>("/settings/company/pickup");

        this.pickupLocations = response.data.shipping_address;
        this.pickupCacheExpiry = now + 1 * 60 * 60 * 1000; // Cache for 1 hour

        return this.pickupLocations;
    }

    /**
     * Get the default pickup location name.
     */
    public async getDefaultPickupLocation(): Promise<string> {
        // Allow overriding via environment variable
        if (process.env.SHIPROCKET_PICKUP_LOCATION) {
            return process.env.SHIPROCKET_PICKUP_LOCATION;
        }

        const locations = await this.getPickupLocations();
        const activeLocations = locations.filter(l => l.status === 1);

        if (activeLocations.length === 0) {
            throw new Error("No active pickup locations found in Shiprocket account.");
        }

        // Return the first active location name
        return activeLocations[0].pickup_location;
    }

    /**
     * Create an ad-hoc order.
     */
    public async createOrder(payload: ShiprocketOrderPayload): Promise<ShiprocketOrderResponse> {
        // Ensure we have a pickup location
        if (!payload.pickup_location) {
            console.log("[Shiprocket] 🔍 No pickup location provided. Fetching default...");
            payload.pickup_location = await this.getDefaultPickupLocation();
            console.log(`[Shiprocket] 📍 Using pickup location: ${payload.pickup_location}`);
        }

        console.log(`[Shiprocket] 📦 Creating order ${payload.order_id}...`);

        try {
            const response = await this.request<ShiprocketOrderResponse>("/orders/create/adhoc", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            console.log("🚀 [Shiprocket] ✅ Order Creation Success!");
            console.log(`   Internal ID: ${payload.order_id}`);
            console.log(`   SR Order ID: ${response.order_id}`);
            console.log(`   SR Shipment ID: ${response.shipment_id}`);

            return response;
        } catch (error: any) {
            console.error(`[Shiprocket] ❌ Order Creation Failed for ${payload.order_id}:`, error.message || error);
            throw error;
        }
    }

    /**
     * Get tracking details.
     */
    public async getTrackingInfo(shipmentId: string | number) {
        return this.request(`/courier/track/shipment/${shipmentId}`, {
            method: "GET",
        });
    }
}

export const shiprocket = ShiprocketService.getInstance();
