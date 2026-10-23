import 'server-only';

/**
 * Couche d'abstraction paiement. Pour brancher Stripe / PayPal / SumUp plus tard :
 *  1) implémenter createCheckout() et handleWebhook() du prestataire ci-dessous ;
 *  2) définir PAYMENT_PROVIDER dans les variables d'environnement ;
 *  3) le webhook (app/api/webhooks/[provider]) mettra à jour orders.payment_status / payment_ref.
 * Le reste de l'application (panier, commande, admin) n'a pas à changer.
 */
const notReady = (name) => async () => { throw new Error(`${name} n'est pas encore configuré`); };

const providers = {
  cash_on_delivery: {
    async createCheckout() { return { redirectUrl: null, paymentStatus: 'pending' }; },
    async handleWebhook() { return { ignored: true }; },
  },
  stripe: { createCheckout: notReady('Stripe'), handleWebhook: notReady('Stripe') },
  paypal: { createCheckout: notReady('PayPal'), handleWebhook: notReady('PayPal') },
  sumup: { createCheckout: notReady('SumUp'), handleWebhook: notReady('SumUp') },
};

export function getPaymentProvider(name = process.env.PAYMENT_PROVIDER || 'cash_on_delivery') {
  const p = providers[name];
  if (!p) throw new Error(`Prestataire de paiement inconnu : ${name}`);
  return p;
}
