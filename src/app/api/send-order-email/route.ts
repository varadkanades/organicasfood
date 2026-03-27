import { NextResponse } from "next/server";
import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "organikasfoods@gmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

interface OrderItem {
  name: string;
  size: string;
  price: number;
  quantity: number;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: string;
  notes?: string;
}

function buildAdminEmailHtml(order: OrderEmailData): string {
  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name} (${item.size})</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">&#8377;${item.price * item.quantity}</td>
        </tr>`
    )
    .join("");

  const discountRow =
    order.discount > 0
      ? `<tr><td colspan="2" style="padding:4px 12px;text-align:right;color:#059669;">Discount${order.couponCode ? ` (${order.couponCode})` : ""}:</td><td style="padding:4px 12px;text-align:right;color:#059669;">-&#8377;${order.discount}</td></tr>`
      : "";

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
    <div style="background:#1a3a2a;padding:20px 24px;border-radius:8px 8px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:20px;">New Order Received!</h1>
      <p style="color:#a3c4a8;margin:4px 0 0;font-size:14px;">Order #${order.orderNumber}</p>
    </div>
    <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
      <h3 style="margin:0 0 12px;color:#333;">Customer Details</h3>
      <table style="width:100%;font-size:14px;color:#555;margin-bottom:20px;">
        <tr><td style="padding:3px 0;"><strong>Name:</strong> ${order.customerName}</td></tr>
        <tr><td style="padding:3px 0;"><strong>Phone:</strong> ${order.customerPhone}</td></tr>
        <tr><td style="padding:3px 0;"><strong>Email:</strong> ${order.customerEmail}</td></tr>
        <tr><td style="padding:3px 0;"><strong>Address:</strong> ${order.address}, ${order.city}, ${order.state} - ${order.pincode}</td></tr>
        <tr><td style="padding:3px 0;"><strong>Payment:</strong> ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)"}</td></tr>
        ${order.notes ? `<tr><td style="padding:3px 0;"><strong>Notes:</strong> ${order.notes}</td></tr>` : ""}
      </table>

      <h3 style="margin:0 0 12px;color:#333;">Order Items</h3>
      <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#f8f8f8;">
            <th style="padding:8px 12px;text-align:left;font-weight:600;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-weight:600;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table style="width:100%;font-size:14px;margin-top:8px;">
        <tr><td colspan="2" style="padding:4px 12px;text-align:right;">Subtotal:</td><td style="padding:4px 12px;text-align:right;">&#8377;${order.subtotal}</td></tr>
        <tr><td colspan="2" style="padding:4px 12px;text-align:right;">Shipping:</td><td style="padding:4px 12px;text-align:right;">${order.shipping === 0 ? "FREE" : `&#8377;${order.shipping}`}</td></tr>
        ${discountRow}
        <tr style="font-size:16px;font-weight:bold;">
          <td colspan="2" style="padding:8px 12px;text-align:right;border-top:2px solid #1a3a2a;">Total:</td>
          <td style="padding:8px 12px;text-align:right;border-top:2px solid #1a3a2a;color:#1a3a2a;">&#8377;${order.total}</td>
        </tr>
      </table>
    </div>
  </div>`;
}

function buildCustomerEmailHtml(order: OrderEmailData): string {
  const itemList = order.items
    .map(
      (item) =>
        `<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">${item.name} (${item.size}) x ${item.quantity} — &#8377;${item.price * item.quantity}</li>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
    <div style="background:#1a3a2a;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Thank you for your order!</h1>
      <p style="color:#a3c4a8;margin:8px 0 0;font-size:14px;">Organika's Food — 100% Natural</p>
    </div>
    <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
      <p style="font-size:15px;color:#333;">Hi ${order.customerName},</p>
      <p style="font-size:14px;color:#555;">Your order <strong>#${order.orderNumber}</strong> has been placed successfully. We'll start preparing it right away!</p>

      <div style="background:#f9faf8;padding:16px;border-radius:8px;margin:16px 0;">
        <h3 style="margin:0 0 8px;font-size:14px;color:#333;">Order Summary</h3>
        <ul style="list-style:none;padding:0;margin:0;font-size:14px;color:#555;">${itemList}</ul>
        <div style="margin-top:12px;padding-top:12px;border-top:2px solid #1a3a2a;font-size:16px;font-weight:bold;color:#1a3a2a;text-align:right;">
          Total: &#8377;${order.total}
        </div>
      </div>

      <p style="font-size:14px;color:#555;">
        <strong>Delivery to:</strong> ${order.address}, ${order.city}, ${order.state} - ${order.pincode}<br/>
        <strong>Payment:</strong> ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
      </p>

      <p style="font-size:13px;color:#888;margin-top:20px;">
        Questions? WhatsApp us at <a href="https://wa.me/919834845240" style="color:#059669;">+91 98348 45240</a>
      </p>
    </div>
  </div>`;
}

export async function POST(request: Request) {
  console.log("[Order Email] POST request received");
  console.log("[Order Email] RESEND_API_KEY set:", !!process.env.RESEND_API_KEY);
  console.log("[Order Email] FROM_EMAIL:", FROM_EMAIL);
  console.log("[Order Email] ADMIN_EMAIL:", ADMIN_EMAIL);

  try {
    const resend = getResend();
    if (!resend) {
      console.warn("[Order Email] RESEND_API_KEY not set — skipping order emails");
      return NextResponse.json({ success: false, reason: "no_api_key" });
    }

    const order: OrderEmailData = await request.json();
    console.log("[Order Email] Sending for order:", order.orderNumber);

    // Send admin notification
    const adminResult = await resend.emails.send({
      from: `Organika's Food Orders <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New Order #${order.orderNumber} — ₹${order.total} from ${order.customerName}`,
      html: buildAdminEmailHtml(order),
    });

    if (adminResult.error) {
      console.error("[Order Email] Admin email error:", JSON.stringify(adminResult.error));
      return NextResponse.json(
        { success: false, error: adminResult.error.message },
        { status: 400 }
      );
    }

    console.log("[Order Email] Admin email sent:", adminResult.data?.id);

    // Send customer confirmation
    if (order.customerEmail) {
      const customerResult = await resend.emails.send({
        from: `Organika's Food <${FROM_EMAIL}>`,
        to: order.customerEmail,
        subject: `Order Confirmed #${order.orderNumber} — Organika's Food`,
        html: buildCustomerEmailHtml(order),
      });

      if (customerResult.error) {
        console.error("[Order Email] Customer email error:", JSON.stringify(customerResult.error));
      } else {
        console.log("[Order Email] Customer email sent:", customerResult.data?.id);
      }
    }

    return NextResponse.json({ success: true, id: adminResult.data?.id });
  } catch (error) {
    console.error("[Order Email] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
