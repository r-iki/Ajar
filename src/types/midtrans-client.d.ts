declare module "midtrans-client" {
  interface SnapInstance {
    createTransaction(payload: {
      transaction_details: {
        order_id: string;
        gross_amount: number;
      };
      customer_details?: {
        first_name?: string;
        email?: string;
      };
      enabled_payments?: string[];
    }): Promise<{ token: string; redirect_url: string }>;
  }

  interface SnapConstructor {
    new (config: {
      isProduction: boolean;
      serverKey: string;
      clientKey?: string;
    }): SnapInstance;
  }

  const value: {
    Snap: SnapConstructor;
  };

  export default value;
}
