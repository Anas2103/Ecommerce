<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    private array $intents = [
        'greeting'        => ['bonjour', 'salut', 'hello', 'bonsoir', 'hi', 'hey', 'allo'],
        'product_search'  => ['cherche un', 'cherche des', 'je veux acheter', 'je cherche', 'acheter un', 'acheter des', 'buy a', 'buy an', 'buy some', 'find a', 'find an', 'looking for', 'search for', 'produit', 'article', 'voir les produits', 'voir tout'],
        'cancel_order'    => ['annuler', 'annulation', 'cancel', 'annule'],
        'order_tracking'  => ['suivi', 'où est', 'tracking', 'track', 'statut commande', 'mes commandes', 'ma commande', 'my orders', 'my order', 'order status', 'commande'],
        'returns'         => ['retour', 'remboursement', 'retourner', 'return', 'returns', 'refund', 'refunds', 'exchange', 'exchanges', 'échange'],
        'shipping'        => ['livraison', 'frais de port', 'délai', 'expédition', 'shipping', 'delivery'],
        'payment'         => ['paiement', 'payer', 'carte bancaire', 'payment', 'paypal', 'virement'],
        'invoice'         => ['facture', 'invoice', 'reçu', 'receipt', 'ticket'],
        'stock'           => ['stock', 'dispo', 'available', 'rupture', 'en stock'],
        'warranty'        => ['garantie', 'warranty', 'garantit', 'guarantee', 'sav'],
        'discount'        => ['promo', 'promotion', 'réduction', 'coupon', 'code promo', 'discount', 'offre'],
        'account'         => ['compte', 'profil', 'mot de passe', 'account', 'profile', 'password', 'login', 'adresse'],
        'wishlist'        => ['wishlist', 'favoris', 'liste de souhaits', 'sauvegarder', 'saved', 'favorite'],
        'become_seller'   => ['vendeur', 'vendre', 'seller', 'sell', 'boutique', 'shop', 'inscrire'],
        'security'        => ['sécurité', 'sécurisé', 'privacy', 'données', 'data', 'secure', 'confidential'],
        'hours'           => ['heures', 'horaires', 'ouvert', 'hours', 'open'],
        'contact'         => ['contact', 'email', 'téléphone', 'support', 'aide', 'help', 'faq'],
    ];

    public function handle(Request $request)
    {
        $data = $request->validate(['message' => 'required|string|max:500']);
        $acceptLang = $request->header('Accept-Language', 'fr');
        $lang = str_contains($acceptLang, 'en') || str_contains($acceptLang, 'ar') ? 'en' : 'fr';
        $message = mb_strtolower($data['message']);

        $intent = $this->detectIntent($message);
        $products = [];
        $chips = [];

        [$response, $chips] = $this->buildResponse($intent, $message, $lang, $request->user());

        if ($intent === 'product_search') {
            $searchTerm = $this->extractSearchTerm($message);
            $query = Product::with(['images'])->active()->inStock();
            $products = (strlen($searchTerm) > 2 ? $query->search($searchTerm) : $query->inRandomOrder())
                ->limit(3)
                ->get()
                ->map(fn($p) => [
                    'id'               => $p->id,
                    'name'             => $p->name,
                    'slug'             => $p->slug,
                    'final_price'      => $p->final_price,
                    'primary_image_url'=> $p->primary_image_url,
                ])
                ->toArray();
        }

        return response()->json([
            'message'  => $response,
            'intent'   => $intent,
            'products' => $products,
            'chips'    => $chips,
        ]);
    }

    private function detectIntent(string $message): string
    {
        foreach ($this->intents as $intent => $keywords) {
            foreach ($keywords as $keyword) {
                // Use word-boundary matching to avoid false positives (e.g. "hi" inside "shipping")
                if (preg_match('/(?<![a-z])' . preg_quote($keyword, '/') . '(?![a-z])/ui', $message)) {
                    return $intent;
                }
            }
        }
        return 'unknown';
    }

    private function buildResponse(string $intent, string $message, string $lang, $user): array
    {
        $fr = $lang === 'fr';

        return match ($intent) {
            'greeting' => [
                $fr ? "Bonjour ! 👋 Je suis l'assistant de la boutique. Comment puis-je vous aider ?"
                    : "Hello! 👋 I'm the store assistant. How can I help you?",
                $fr ? ['Mes commandes', 'Livraison', 'Retours', 'Promotions']
                    : ['My orders', 'Shipping', 'Returns', 'Discounts'],
            ],
            'order_tracking' => [
                $fr ? "Pour suivre votre commande, rendez-vous dans **Mes Commandes** depuis votre profil. Votre numéro de commande commence par ORD-."
                    : "To track your order, go to **My Orders** from your profile. Your order number starts with ORD-.",
                $fr ? ['Voir mes commandes', 'Annuler une commande', 'Contacter le support'] : ['View my orders', 'Cancel an order', 'Contact support'],
            ],
            'cancel_order' => [
                $fr ? "Vous pouvez annuler une commande tant qu'elle est en statut **En attente**. Allez dans **Mes Commandes** → cliquez sur la commande → **Annuler**.\n\nUne fois expédiée, l'annulation n'est plus possible."
                    : "You can cancel an order while it's still **Pending**. Go to **My Orders** → click the order → **Cancel**.\n\nOnce shipped, cancellation is no longer possible.",
                $fr ? ['Voir mes commandes', 'Politique de retour'] : ['View my orders', 'Return policy'],
            ],
            'returns' => [
                $fr ? "Notre politique de retour est de **14 jours** après réception. L'article doit être dans son état d'origine. Contactez-nous à support@ecommerce.com."
                    : "Our return policy is **14 days** after receipt. Items must be in original condition. Contact us at support@ecommerce.com.",
                $fr ? ['Conditions de retour', 'Contacter le support'] : ['Return policy', 'Contact support'],
            ],
            'shipping' => [
                $fr ? "Nous proposons 3 options de livraison :\n• **Standard**: 29 MAD (3-5 jours)\n• **Express**: 59 MAD (1-2 jours)\n• **Retrait en magasin**: Gratuit"
                    : "We offer 3 shipping options:\n• **Standard**: 29 MAD (3-5 days)\n• **Express**: 59 MAD (1-2 days)\n• **Store Pickup**: Free",
                $fr ? ['Commander maintenant', 'Voir les produits'] : ['Order now', 'Browse products'],
            ],
            'payment' => [
                $fr ? "Nous acceptons :\n• 💳 **Cartes bancaires** (Visa, Mastercard)\n• 🏧 **PayPal**\n• 💵 **Paiement à la livraison**\n\nToutes les transactions sont sécurisées SSL 🔒"
                    : "We accept:\n• 💳 **Credit/debit cards** (Visa, Mastercard)\n• 🏧 **PayPal**\n• 💵 **Cash on delivery**\n\nAll transactions are SSL secured 🔒",
                $fr ? ['Sécurité', 'Commencer mes achats'] : ['Security', 'Start shopping'],
            ],
            'invoice' => [
                $fr ? "📄 Votre facture est disponible directement depuis **Mes Commandes**.\n\nCliquez sur une commande livrée → **Télécharger la facture PDF**. Elle est générée automatiquement."
                    : "📄 Your invoice is available directly from **My Orders**.\n\nClick on a delivered order → **Download PDF Invoice**. It's generated automatically.",
                $fr ? ['Mes commandes', 'Contacter le support'] : ['My orders', 'Contact support'],
            ],
            'stock' => [
                $fr ? "La disponibilité d'un produit est indiquée sur sa fiche. Si la mention **\"En stock\"** apparaît, vous pouvez commander immédiatement.\n\nPour les articles en rupture, vous pouvez les ajouter à votre **liste de souhaits** et être notifié."
                    : "Product availability is shown on each product page. If **\"In stock\"** appears, you can order right away.\n\nFor out-of-stock items, add them to your **wishlist** to be notified.",
                $fr ? ['Voir les produits', 'Ma liste de souhaits'] : ['Browse products', 'My wishlist'],
            ],
            'warranty' => [
                $fr ? "🛡️ Garantie produit :\n• **Électronique** : 12 mois\n• **Vêtements / Accessoires** : 30 jours (défauts de fabrication)\n• **Autres** : 6 mois\n\nEn cas de problème, contactez-nous à support@ecommerce.com."
                    : "🛡️ Product warranty:\n• **Electronics**: 12 months\n• **Clothing / Accessories**: 30 days (manufacturing defects)\n• **Others**: 6 months\n\nFor issues, contact us at support@ecommerce.com.",
                $fr ? ['Politique de retour', 'Contacter le support'] : ['Return policy', 'Contact support'],
            ],
            'contact' => [
                $fr ? "📧 Email: support@ecommerce.com\n📞 Téléphone: +212 5XX-XXXXXX\n💬 Chat disponible 9h-18h du Lundi au Samedi."
                    : "📧 Email: support@ecommerce.com\n📞 Phone: +212 5XX-XXXXXX\n💬 Chat available 9am-6pm Monday to Saturday.",
                $fr ? ['Envoyer un email', 'FAQ'] : ['Send email', 'FAQ'],
            ],
            'hours' => [
                $fr ? "🕘 Nos horaires :\n• **Lundi - Vendredi**: 9h - 18h\n• **Samedi**: 9h - 14h\n• **Dimanche**: Fermé\nLa boutique en ligne est disponible **24h/24**."
                    : "🕘 Our hours:\n• **Monday - Friday**: 9am - 6pm\n• **Saturday**: 9am - 2pm\n• **Sunday**: Closed\nOnline store available **24/7**.",
                $fr ? ['Nous contacter', 'Commander'] : ['Contact us', 'Order'],
            ],
            'discount' => [
                $fr ? "🎉 Codes promo actifs :\n• **WELCOME10** – 10% de réduction\n• **SUMMER20** – 20% de réduction (min. 100 MAD)\n• **SAVE50** – 50 MAD de réduction (min. 200 MAD)"
                    : "🎉 Active promo codes:\n• **WELCOME10** – 10% off\n• **SUMMER20** – 20% off (min. 100 MAD)\n• **SAVE50** – 50 MAD off (min. 200 MAD)",
                $fr ? ['Voir les offres', 'Panier'] : ['View deals', 'Cart'],
            ],
            'account' => [
                $fr ? "Pour gérer votre compte, cliquez sur votre avatar en haut à droite. Vous pouvez modifier vos infos, adresses, et changer votre mot de passe."
                    : "To manage your account, click on your avatar at the top right. You can edit your info, addresses, and change your password.",
                $fr ? ['Mon profil', 'Mes commandes', 'Mes adresses'] : ['My profile', 'My orders', 'My addresses'],
            ],
            'wishlist' => [
                $fr ? "❤️ La liste de souhaits vous permet de sauvegarder vos produits préférés pour plus tard.\n\nCliquez sur l'icône ❤️ sur n'importe quel produit pour l'ajouter. Retrouvez-la dans votre profil → **Liste de souhaits**."
                    : "❤️ The wishlist lets you save your favourite products for later.\n\nClick the ❤️ icon on any product to add it. Find it in your profile → **Wishlist**.",
                $fr ? ['Voir mes favoris', 'Voir les produits'] : ['View my wishlist', 'Browse products'],
            ],
            'become_seller' => [
                $fr ? "🏪 Vous souhaitez vendre sur notre plateforme ?\n\n1. Créez un compte vendeur lors de l'inscription\n2. Téléversez vos documents de vérification\n3. Après validation, gérez vos produits depuis le **tableau de bord vendeur**."
                    : "🏪 Want to sell on our platform?\n\n1. Create a seller account during registration\n2. Upload your verification documents\n3. After approval, manage your products from the **seller dashboard**.",
                $fr ? ["S'inscrire comme vendeur", 'En savoir plus'] : ['Register as seller', 'Learn more'],
            ],
            'security' => [
                $fr ? "🔒 Votre sécurité est notre priorité :\n• Paiements chiffrés **SSL/TLS**\n• Aucune carte bancaire stockée sur nos serveurs\n• Authentification par token sécurisé\n• Données personnelles protégées (RGPD)"
                    : "🔒 Your security is our priority:\n• **SSL/TLS** encrypted payments\n• No card details stored on our servers\n• Secure token-based authentication\n• Personal data protected (GDPR)",
                $fr ? ['Politique de confidentialité', 'Paiement'] : ['Privacy policy', 'Payment'],
            ],
            'product_search' => [
                $fr ? "Voici ce que j'ai trouvé pour vous 👇"
                    : "Here's what I found for you 👇",
                $fr ? ['Voir tout', 'Filtrer'] : ['View all', 'Filter'],
            ],
            default => [
                $fr ? "Désolé, je n'ai pas compris. Pouvez-vous reformuler ? Vous pouvez aussi me demander des infos sur les livraisons, retours, paiements ou rechercher un produit."
                    : "Sorry, I didn't understand. Can you rephrase? You can also ask about shipping, returns, payments or search for a product.",
                $fr ? ['Livraison', 'Retours', 'Promotions', 'Contact'] : ['Shipping', 'Returns', 'Discounts', 'Contact'],
            ],
        };
    }

    private function extractSearchTerm(string $message): string
    {
        $stopWords = [
            'cherche', 'cherche un', 'cherche des', 'je cherche', 'je veux', 'acheter', 'acheter un',
            'find', 'find a', 'find an', 'search', 'search for', 'looking for', 'buy', 'buy a', 'buy an',
            'produit', 'article', 'voir', 'voir les', 'voir tout',
            'je', 'veux', 'want', 'un', 'une', 'des', 'du', 'le', 'la', 'les', 'a', 'an', 'the', 'some',
            'i', 'to', 'for', 'me', 'please',
        ];
        $words = explode(' ', $message);
        $filtered = array_filter($words, fn($w) => !in_array($w, $stopWords) && mb_strlen($w) > 2);
        return implode(' ', array_values($filtered));
    }
}
