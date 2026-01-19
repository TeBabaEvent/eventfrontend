<template>
  <div class="legal-page">
    <div class="container">
      <h1 class="legal-page__title">Politique de Confidentialité</h1>
      
      <div class="legal-page__content">
        <section class="legal-page__section">
          <p>
            La présente politique de confidentialité définit la manière dont <strong>BMZ EVENT BV</strong> utilise et protège les informations que vous nous transmettez, le cas échéant, lorsque vous utilisez ce site accessible à partir de l'URL suivante : <strong>https://www.baba.events</strong>.
          </p>
          <p>
            Veuillez noter que cette politique de confidentialité est susceptible d’être modifiée ou complétée à tout moment par <strong>BMZ EVENT BV</strong>, notamment en vue de se conformer à toute évolution législative, réglementaire, jurisprudentielle ou technologique. Dans un tel cas, la date de sa mise à jour sera clairement identifiée en tête de la présente politique. Ces modifications engagent l’utilisateur dès leur mise en ligne.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>1. Données personnelles</h2>
          <p>
            D’une manière générale, il vous est possible de visiter le site de <strong>BMZ EVENT BV</strong> sans communiquer aucune information personnelle vous concernant. En toute hypothèse, vous êtes en aucune manière obligé de transmettre ces informations à <strong>BMZ EVENT BV</strong>.
          </p>
          <p>
            Néanmoins, en cas de refus, il se peut que vous ne puissiez pas bénéficier de certaines informations ou services que vous avez demandé. À ce titre en effet, <strong>BMZ EVENT BV</strong> peut être amené dans certains cas à vous demander de renseigner vos nom, prénom, adresse mail, numéro de téléphone, entreprise et fonction (ci-après vos « Informations Personnelles »). En fournissant ces informations, vous acceptez expressément qu’elles soient traitées par <strong>BMZ EVENT BV</strong>, aux fins indiquées au point 2 ci-dessous ainsi qu’aux fins rappelées à la fin de chaque formulaire.
          </p>
          <p>
            Conformément au Règlement Général sur la Protection des Données (General Data Protection Regulation) adopté par le Parlement européen le 14 avril 2016, et à la Loi belge du 30 juillet 2018 relative à la protection des personnes physiques à l'égard des traitements de données à caractère personnel, <strong>BMZ EVENT BV</strong> vous informe des points suivants :
          </p>
          
          <h3>Identité du responsable du traitement</h3>
          <p>
            Le responsable du traitement est la société <strong>BMZ EVENT BV</strong>, ayant son siège social à <strong>Zemst, Belgique</strong>.
          </p>

          <h3>Finalités du traitement</h3>
          <p>
            <strong>BMZ EVENT BV</strong> est susceptible de traiter vos Informations Personnelles :
          </p>
          <ul>
            <li>(a) aux fins de vous fournir les informations ou les services que vous avez demandé (notamment : l’envoi de la Newsletter, offre commerciale, brochures) ; et/ou</li>
            <li>(b) aux fins de recueillir des informations nous permettant d’améliorer notre site, nos produits et services (notamment par le biais de cookies) ; et/ou</li>
            <li>(c) aux fins de pouvoir vous contacter à propos de différents événements relatifs à <strong>BMZ EVENT BV</strong>.</li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>2. Destinataires</h2>
          <p>
            Seul <strong>BMZ EVENT BV</strong> est destinataire de vos Informations Personnelles. Celles-ci, que ce soit sous forme individuelle ou agrégée, ne sont jamais transmises à un tiers, nonobstant les sous-traitants auxquels <strong>BMZ EVENT BV</strong> fait appel (vous trouverez de plus amples informations à leur sujet au point 7 ci-dessous). Ni <strong>BMZ EVENT BV</strong>, ni un quelconque de ses sous-traitants, ne procèdent à la commercialisation des données personnelles des visiteurs et Utilisateurs de son Site.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>3. Durée de conservation</h2>
          <p>
            Vos Informations Personnelles sont conservées par <strong>BMZ EVENT BV</strong> uniquement pour le temps correspondant à la finalité de la collecte tel qu’indiqué en 2 ci-dessus qui ne saurait en tout état de cause excéder 24 mois.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>4. Droits Informatique et Libertés</h2>
          <p>
            Vous disposez des droits suivants concernant vos Informations Personnelles, que vous pouvez exercer en nous écrivant à l’adresse postale mentionnée au point 1.
          </p>
          <p>
            <strong>Droit d’accès et de communication des données</strong><br>
            Vous avez la faculté d’accéder aux Informations Personnelles qui vous concernent.
            Cependant, en raison de l’obligation de sécurité et de confidentialité dans le traitement des données à caractère personnel qui incombe à <strong>BMZ EVENT BV</strong>, vous êtes informé que votre demande sera traitée sous réserve que vous rapportiez la preuve de votre identité, notamment par la production d’un scan de votre titre d’identité valide.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>5. Cookies</h2>
          <p>
            Lors de votre première connexion sur le site web de <strong>BMZ EVENT BV</strong>, vous êtes avertis par un bandeau en bas de votre écran que des informations relatives à votre navigation sont susceptibles d’être enregistrées dans des fichiers dénommés « cookies ».
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

.legal-page__section h3 {
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-6);
  margin-bottom: var(--spacing-3);
  color: rgba(255, 255, 255, 0.9);
}

.legal-page__section p, .legal-page__section li {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-4);
}

.legal-page__section ul {
  padding-left: var(--spacing-5);
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
