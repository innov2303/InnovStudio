import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. '
      );
    }

    const sync = await getStripeSync();
    
    try {
      const stripe = await getUncachableStripeClient();
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        await WebhookHandlers.handleCheckoutComplete(session);
      }
    } catch (err: any) {
      console.log('Custom webhook handling not available, using stripe-replit-sync:', err.message);
    }

    await sync.processWebhook(payload, signature);
  }

  static async handleCheckoutComplete(session: any): Promise<void> {
    const projectId = session.metadata?.projectId;
    const type = session.metadata?.type;
    
    if (!projectId || type !== 'deposit') {
      console.log('Checkout session not a deposit payment');
      return;
    }

    if (session.payment_status === 'paid') {
      await storage.updateProjectStatus(projectId, 'approved');
      console.log(`Project ${projectId} status updated to approved after deposit payment`);
    }
  }
}
