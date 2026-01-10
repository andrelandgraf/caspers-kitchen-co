import { FatalError } from "workflow";

// Types for order processing
type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  customerEmail: string;
  deliveryAddress: string;
};

type OrderResult = {
  orderId: string;
  status: "confirmed" | "failed";
  total: number;
  estimatedDelivery: string;
};

// Step functions - atomic, retryable operations
async function validateOrder(
  order: Order,
): Promise<{ valid: boolean; errors: string[] }> {
  "use step";

  const errors: string[] = [];

  if (!order.items || order.items.length === 0) {
    errors.push("Order must contain at least one item");
  }

  if (!order.customerEmail || !order.customerEmail.includes("@")) {
    errors.push("Valid email is required");
  }

  if (!order.deliveryAddress) {
    errors.push("Delivery address is required");
  }

  // Simulate validation delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return { valid: errors.length === 0, errors };
}

async function calculateTotal(items: OrderItem[]): Promise<number> {
  "use step";

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.0875; // 8.75% tax
  const deliveryFee = 4.99;

  return Number((subtotal + tax + deliveryFee).toFixed(2));
}

async function processPayment(
  orderId: string,
  amount: number,
): Promise<{ success: boolean; transactionId: string }> {
  "use step";

  // Simulate payment processing with occasional retryable failures
  if (Math.random() < 0.1) {
    throw new Error("Payment gateway timeout - retry");
  }

  // Simulate unrecoverable payment failure (rare)
  if (Math.random() < 0.01) {
    throw new FatalError("Payment declined - card expired");
  }

  // Simulate successful payment
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    transactionId: `txn_${orderId}_${Date.now()}`,
  };
}

async function scheduleDelivery(
  orderId: string,
  address: string,
): Promise<{ estimatedDelivery: string; driverId: string }> {
  "use step";

  // Simulate delivery scheduling
  const now = new Date();
  const deliveryTime = new Date(now.getTime() + 45 * 60 * 1000); // 45 minutes from now

  return {
    estimatedDelivery: deliveryTime.toISOString(),
    driverId: `driver_${Math.floor(Math.random() * 1000)}`,
  };
}

async function sendConfirmationEmail(
  email: string,
  orderId: string,
  estimatedDelivery: string,
): Promise<void> {
  "use step";

  // Simulate sending email
  console.log(`Sending confirmation email to ${email} for order ${orderId}`);
  console.log(
    `Estimated delivery: ${new Date(estimatedDelivery).toLocaleTimeString()}`,
  );

  await new Promise((resolve) => setTimeout(resolve, 100));
}

// Main workflow function - orchestrates the entire order process
export async function processOrderWorkflow(order: Order): Promise<OrderResult> {
  "use workflow";

  console.log(`Starting order processing for ${order.id}`);

  // Step 1: Validate the order
  const validation = await validateOrder(order);
  if (!validation.valid) {
    throw new FatalError(
      `Order validation failed: ${validation.errors.join(", ")}`,
    );
  }

  // Step 2: Calculate total
  const total = await calculateTotal(order.items);
  console.log(`Order total: $${total}`);

  // Step 3: Process payment
  const payment = await processPayment(order.id, total);
  console.log(`Payment successful: ${payment.transactionId}`);

  // Step 4: Schedule delivery
  const delivery = await scheduleDelivery(order.id, order.deliveryAddress);
  console.log(`Delivery scheduled: ${delivery.estimatedDelivery}`);

  // Step 5: Send confirmation email
  await sendConfirmationEmail(
    order.customerEmail,
    order.id,
    delivery.estimatedDelivery,
  );

  return {
    orderId: order.id,
    status: "confirmed",
    total,
    estimatedDelivery: delivery.estimatedDelivery,
  };
}

// Workflow for order cancellation
export async function cancelOrderWorkflow(
  orderId: string,
  reason: string,
): Promise<{ cancelled: boolean; refundAmount: number }> {
  "use workflow";

  console.log(`Cancelling order ${orderId}: ${reason}`);

  // In a real app, these would be database operations
  const refundAmount = 25.99; // Simulated refund amount

  return {
    cancelled: true,
    refundAmount,
  };
}
