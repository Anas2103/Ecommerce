<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SellerDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SellerDocumentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $docs = SellerDocument::with('user:id,name,email')->latest()->get();
        } else {
            $docs = SellerDocument::where('user_id', $user->id)->latest()->get();
        }

        return response()->json(['data' => $docs]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:business_registration,national_id,tax_certificate,bank_details',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        // Identity / business documents are private: stored outside the public disk.
        $path = $request->file('file')->store('seller-documents', 'local');

        $doc = SellerDocument::create([
            'user_id'   => $request->user()->id,
            'type'      => $data['type'],
            'file_path' => $path,
            'status'    => 'pending',
        ]);

        return response()->json(['data' => $doc, 'message' => __('Document submitted for review.')], 201);
    }

    public function download(Request $request, SellerDocument $sellerDocument)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $sellerDocument->user_id !== $user->id) {
            return response()->json(['message' => __('Forbidden.')], 403);
        }
        abort_unless(Storage::disk('local')->exists($sellerDocument->file_path), 404);

        return Storage::disk('local')->download($sellerDocument->file_path);
    }

    public function approve(Request $request, SellerDocument $sellerDocument)
    {
        $sellerDocument->update(['status' => 'approved']);
        return response()->json(['data' => $sellerDocument, 'message' => __('Document approved.')]);
    }

    public function reject(Request $request, SellerDocument $sellerDocument)
    {
        $sellerDocument->update(['status' => 'rejected']);
        return response()->json(['data' => $sellerDocument, 'message' => __('Document rejected.')]);
    }
}
