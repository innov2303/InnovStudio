import { getStripeSync } from './stripeClient';
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
    await sync.processWebhook(payload, signature);
  }

  static async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    const projectId = paymentIntent.metadata?.projectId;
    if (!projectId) {
      console.log('No projectId in payment metadata');
      return;
    }

    await storage.updateProjectStatus(projectId, 'approved');
    console.log(`Project ${projectId} status updated to approved after payment`);
  }
}
