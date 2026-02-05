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

    // Process the webhook using stripe-replit-sync which handles signature verification
    await sync.processWebhook(payload, signature);
    
    // Parse the event payload to handle custom logic
    try {
      const eventPayload = JSON.parse(payload.toString());
      
      if (eventPayload.type === 'checkout.session.completed') {
        await WebhookHandlers.handleCheckoutComplete(eventPayload.data?.object);
      }
    } catch (err: any) {
      console.log('Error parsing webhook event:', err.message);
    }
  }

  static async handleCheckoutComplete(session: any): Promise<void> {
    if (!session) return;
    
    const projectId = session.metadata?.projectId;
    const type = session.metadata?.type;
    
    if (!projectId || (type !== 'deposit' && type !== 'final')) {
      console.log('Checkout session not a deposit or final payment');
      return;
    }

    if (session.payment_status === 'paid') {
      const project = await storage.getProject(projectId);
      
      if (type === 'deposit') {
        // Handle deposit payment
        if (project && project.status === 'awaiting_deposit') {
          await storage.updateProjectStatus(projectId, 'approved');
          console.log(`Project ${projectId} status updated to approved after deposit payment`);
        } else {
          console.log(`Project ${projectId} not in awaiting_deposit status, skipping update`);
        }
      } else if (type === 'final') {
        // Handle final payment
        if (project && project.status === 'awaiting_final_payment') {
          await storage.updateProjectStatus(projectId, 'completed');
          console.log(`Project ${projectId} status updated to completed after final payment`);
        } else {
          console.log(`Project ${projectId} not in awaiting_final_payment status, skipping update`);
        }
      }
    }
  }
}
