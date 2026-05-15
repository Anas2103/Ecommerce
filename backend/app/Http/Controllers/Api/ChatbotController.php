<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    private array $intents = [
        'greeting'       => ['bonjour', 'salut', 'hello', 'bonsoir', 'hi', 'hey', 'allo'],
        'order_tracking' => ['commande', 'suivi', 'où est', 'livraison', 'tracking', 'order', 'track'],
        'returns'        => ['retour', 'remboursement', 'retourner', 'return', 'refund', 'exchange', 'échange'],
        'shipping'       => ['livraison', 'frais', 'délai', 'expédition', 'shipping', 'delivery', 'when'],
        'payment'        => ['paiement', 'payer', 'carte', 'payment', 'pay', 'credit'],
        'contact'        => ['contact', 'email', 'téléphone', 'phone', 'support', 'aide', 'help'],
        'hours'          => ['heures', 'horaires', 'ouvert', 'hours', 'open', 'disponible'],
        'discount'       => ['promo', 'promotion', 'réduction', 'coupon', 'code', 'discount', 'offre'],
        'account'        => ['compte', 'profil', 'mot de passe', 'account', 'profile', 'password', 'login'],
        'product_search' => ['produit', 'cherche', 'article', 'acheter', 'product', 'buy', 'find', 'search'],
    ];

    public function handle(Request $request)
    {
        $data = $request->validate(['message' => 'required|string|max:500']);
        $lang = str_contains($request->header('Accept-Language', 'fr'), 'en') ? 'en' : 'fr';
        $message = mb_strtolower($data['message']);

        $intent = $this->detectIntent($message);
        $products = [];
        $chips = [];

        [$response, $chips] = $this->buildResponse($intent, $message, $lang, $request->user());

        if ($intent === 'product_search') {
            $searchTerm = $this->extractSearchTerm($message);
            $products = Product::with(['images'])
                ->active()->inStock()
                ->search($searchTerm)
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
                if (str_contains($message, $keyword)) {
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
                $fr ? ['Voir mes commandes', 'Contacter le support'] : ['View my orders', 'Contact support'],
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
                $fr ? "Nous acceptons les **cartes bancaires** (Visa, Mastercard) et le **paiement à la livraison**. Toutes les transactions sont sécurisées SSL."
                    : "We accept **credit/debit cards** (Visa, Mastercard) and **cash on delivery**. All transactions are SSL secured.",
                $fr ? ['Sécurité', 'Commencer mes achats'] : ['Security', 'Start shopping'],
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
        $stopWords = ['cherche', 'find', 'search', 'je', 'veux', 'want', 'buy', 'acheter', 'produit', 'article', 'un', 'une', 'des', 'le', 'la', 'les', 'a', 'the'];
        $words = explode(' ', $message);
        $filtered = array_filter($words, fn($w) => !in_array($w, $stopWords) && strlen($w) > 2);
        return implode(' ', array_values($filtered)) ?: $message;
    }
}
