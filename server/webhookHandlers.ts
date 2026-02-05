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
    
    if (!projectId) {
      console.log('Checkout session missing projectId');
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
          
          // Generate invoice from signed quote
          const documents = await storage.getDocumentsByProject(projectId);
          const signedQuote = documents.find(d => d.type === 'quote' && d.status === 'signed');
          if (signedQuote) {
            const invoice = await storage.createInvoiceFromQuote(signedQuote.id);
            if (invoice) {
              console.log(`Invoice ${invoice.id} created for project ${projectId}`);
            }
          }
        } else {
          console.log(`Project ${projectId} not in awaiting_final_payment status, skipping update`);
        }
      } else if (type === 'subscription') {
        // Handle subscription payment
        const userId = session.metadata?.userId;
        const offerType = session.metadata?.offerType;
        const monthlyPrice = session.metadata?.monthlyPrice;
        
        if (!userId || !offerType || !monthlyPrice) {
          console.log('Subscription checkout missing required metadata');
          return;
        }
        
        // Create the subscription
        const subscription = await storage.createSubscription(
          userId,
          projectId,
          offerType,
          monthlyPrice
        );
        console.log(`Subscription ${subscription.id} created for project ${projectId}`);
        
        // Create subscription invoice document
        const offer = await storage.getSubscriptionOffer(offerType);
        if (offer && project) {
          const subscriptionInvoice = await storage.createSubscriptionInvoice(
            projectId,
            subscription.id,
            offer.name,
            monthlyPrice
          );
          if (subscriptionInvoice) {
            console.log(`Subscription invoice ${subscriptionInvoice.id} created for project ${projectId}`);
          }
        }
      } else {
        console.log('Checkout session type not recognized:', type);
      }
    }
  }
}
