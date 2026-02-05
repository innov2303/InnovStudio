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
      } else if (eventPayload.type === 'customer.subscription.created') {
        await WebhookHandlers.handleSubscriptionCreated(eventPayload.data?.object);
      } else if (eventPayload.type === 'customer.subscription.updated') {
        await WebhookHandlers.handleSubscriptionUpdated(eventPayload.data?.object);
      } else if (eventPayload.type === 'customer.subscription.deleted') {
        await WebhookHandlers.handleSubscriptionDeleted(eventPayload.data?.object);
      } else if (eventPayload.type === 'invoice.paid') {
        await WebhookHandlers.handleInvoicePaid(eventPayload.data?.object);
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

  static async handleSubscriptionCreated(stripeSubscription: any): Promise<void> {
    if (!stripeSubscription) return;
    
    const metadata = stripeSubscription.metadata;
    if (!metadata || metadata.type !== 'subscription') {
      console.log('Subscription created event not our subscription type');
      return;
    }
    
    const { projectId, offerType, userId, monthlyPrice } = metadata;
    if (!projectId || !offerType || !userId || !monthlyPrice) {
      console.log('Subscription created missing metadata');
      return;
    }
    
    // Check if subscription already exists
    const existingSubscriptions = await storage.getSubscriptionsByProject(projectId);
    const hasExisting = existingSubscriptions.some(
      sub => sub.offerType === offerType && sub.status === 'active'
    );
    
    if (hasExisting) {
      console.log(`Subscription for ${offerType} already exists for project ${projectId}`);
      return;
    }
    
    // Create the subscription with Stripe ID
    const currentPeriodEnd = stripeSubscription.current_period_end 
      ? new Date(stripeSubscription.current_period_end * 1000) 
      : null;
    
    const subscription = await storage.createSubscriptionWithStripe(
      userId,
      projectId,
      offerType,
      monthlyPrice,
      stripeSubscription.id,
      currentPeriodEnd
    );
    console.log(`Subscription ${subscription.id} created with Stripe ID ${stripeSubscription.id}`);
    
    // Create first subscription invoice
    const offer = await storage.getSubscriptionOffer(offerType);
    if (offer) {
      const subscriptionInvoice = await storage.createSubscriptionInvoice(
        projectId,
        subscription.id,
        offer.name,
        monthlyPrice
      );
      if (subscriptionInvoice) {
        console.log(`Subscription invoice created for project ${projectId}`);
      }
    }
  }

  static async handleSubscriptionUpdated(stripeSubscription: any): Promise<void> {
    if (!stripeSubscription) return;
    
    const stripeSubId = stripeSubscription.id;
    const subscription = await storage.getSubscriptionByStripeId(stripeSubId);
    
    if (!subscription) {
      console.log(`No subscription found for Stripe ID ${stripeSubId}`);
      return;
    }
    
    const currentPeriodEnd = stripeSubscription.current_period_end 
      ? new Date(stripeSubscription.current_period_end * 1000) 
      : null;
    const cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end || false;
    
    await storage.updateSubscriptionStripeData(
      subscription.id,
      currentPeriodEnd,
      cancelAtPeriodEnd
    );
    console.log(`Subscription ${subscription.id} updated: cancelAtPeriodEnd=${cancelAtPeriodEnd}`);
  }

  static async handleSubscriptionDeleted(stripeSubscription: any): Promise<void> {
    if (!stripeSubscription) return;
    
    const stripeSubId = stripeSubscription.id;
    const subscription = await storage.getSubscriptionByStripeId(stripeSubId);
    
    if (!subscription) {
      console.log(`No subscription found for Stripe ID ${stripeSubId}`);
      return;
    }
    
    await storage.updateSubscriptionStatus(subscription.id, 'cancelled');
    console.log(`Subscription ${subscription.id} cancelled`);
  }

  static async handleInvoicePaid(invoice: any): Promise<void> {
    if (!invoice) return;
    
    // Only handle subscription invoices (not first invoice which is handled at checkout)
    const stripeSubId = invoice.subscription;
    if (!stripeSubId) return;
    
    const subscription = await storage.getSubscriptionByStripeId(stripeSubId);
    if (!subscription) {
      console.log(`No subscription found for invoice subscription ${stripeSubId}`);
      return;
    }
    
    // Skip if this is the first invoice (already created at checkout)
    if (invoice.billing_reason === 'subscription_create') {
      console.log('Skipping first invoice - already created at checkout');
      return;
    }
    
    // Create monthly invoice for renewal
    const offer = await storage.getSubscriptionOffer(subscription.offerType);
    if (offer) {
      const subscriptionInvoice = await storage.createSubscriptionInvoice(
        subscription.projectId,
        subscription.id,
        offer.name,
        subscription.monthlyPrice
      );
      if (subscriptionInvoice) {
        console.log(`Renewal invoice created for subscription ${subscription.id}`);
      }
    }
  }
}
