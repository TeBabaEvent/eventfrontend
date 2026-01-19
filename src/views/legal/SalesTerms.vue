<template>
  <div class="legal-page">
    <div class="container">
      <h1 class="legal-page__title">Conditions Générales de Vente</h1>
      
      <div class="legal-page__content">
        <section class="legal-page__section">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>BMZ EVENT BV</strong> et toute personne effectuant un achat via le site <strong>https://www.baba.events</strong>.
          </p>
          <p>
            Ces conditions s'appliquent à l'exclusion de toutes autres conditions, notamment celles en vigueur pour les ventes en magasin.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>2. Prix</h2>
          <p>
            Les prix de nos produits/services sont indiqués en euros toutes taxes comprises (TTC), sauf indication contraire et hors frais de traitement et d'expédition.
          </p>
          <p>
            <strong>BMZ EVENT BV</strong> se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande et sous réserve de disponibilité.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>3. Commandes</h2>
          <p>
            Vous pouvez passer commande sur notre site <strong>https://www.baba.events</strong>.
          </p>
          <p>
            Toute commande figure explicitement toutes les informations nécessaires à son traitement : identification du client, références des produits, quantités, prix, mode de paiement, mode et frais de livraison.
          </p>
          <p>
            <strong>BMZ EVENT BV</strong> se réserve le droit de ne pas enregistrer un paiement, et de ne pas confirmer une commande pour quelque raison que ce soit, et plus particulièrement en cas de problème d'approvisionnement, ou en cas de difficulté concernant la commande reçue.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>4. Validation de commande</h2>
          <p>
            Toute commande figurant sur le site Internet <strong>https://www.baba.events</strong> suppose l'adhésion aux présentes Conditions Générales. Toute confirmation de commande entraîne votre adhésion pleine et entière aux présentes conditions générales de vente, sans exception ni réserve.
          </p>
          <p>
            L'ensemble des données fournies et la confirmation enregistrée vaudront preuve de la transaction.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>5. Paiement</h2>
          <p>
            Le fait de valider votre commande implique pour vous l'obligation de payer le prix indiqué.
          </p>
          <p>
            Le règlement de vos achats s'effectue par carte bancaire grâce au système sécurisé PayPal ou tout autre moyen proposé sur le site.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>6. Rétractation</h2>
          <p>
            Conformément au Code de droit économique belge (livre VI), vous disposez en principe d'un délai de rétractation de 14 jours.
          </p>
          <p>
            <strong>EXCEPTION :</strong> Conformément à l'article VI.53, 12° du Code de droit économique, le droit de rétractation <strong>ne s'applique pas</strong> aux contrats de prestations de services d'hébergement (autres que résidentiel), de transport, de location de voitures, de restauration ou de services liés à des <strong>activités de loisirs</strong> si le contrat prévoit une date ou une période d'exécution spécifique (ce qui est le cas pour les billets de concerts, festivals, spectacles).
          </p>
          <p>
            En conséquence, les billets de spectacles et événements vendus sur <strong>https://www.baba.events</strong> ne sont ni repris, ni échangés, sauf en cas d'annulation de l'événement par l'organisateur.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>7. Responsabilité</h2>
          <p>
            Les produits proposés sont conformes à la législation belge en vigueur. La responsabilité de <strong>BMZ EVENT BV</strong> ne saurait être engagée en cas de non-respect de la législation du pays où le produit est livré. Il vous appartient de vérifier auprès des autorités locales les possibilités d'importation ou d'utilisation des produits ou services que vous envisagez de commander.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--color-white);
}

.legal-page__title {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: var(--font-weight-extrabold);
  margin-bottom: var(--spacing-12);
  text-align: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, #ff4d6d 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.legal-page__content {
  max-width: 800px;
  margin: 0 auto;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: var(--spacing-10);
  box-shadow: var(--shadow-lg);
}

.legal-page__section {
  margin-bottom: var(--spacing-8);
}

.legal-page__section:last-child {
  margin-bottom: 0;
}

.legal-page__section h2 {
  font-family: var(--font-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-4);
  color: var(--color-white);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: var(--spacing-2);
}

.legal-page__section p {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-4);
}

.legal-page__section p strong {
  color: var(--color-white);
}

@media (max-width: 768px) {
  .legal-page__content {
    padding: 24px;
  }

  .legal-page__title {
    margin-bottom: 32px;
  }
}
</style>
