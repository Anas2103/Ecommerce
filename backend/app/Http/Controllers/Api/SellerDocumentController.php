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
            'type' => 'required|string|max:100',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $path = $request->file('file')->store('seller-documents', 'public');

        $doc = SellerDocument::create([
            'user_id'   => $request->user()->id,
            'type'      => $data['type'],
            'file_path' => $path,
            'status'    => 'pending',
        ]);

        return response()->json(['data' => $doc, 'message' => 'Document soumis pour vérification.'], 201);
    }

    public function approve(Request $request, SellerDocument $sellerDocument)
    {
        $sellerDocument->update(['status' => 'approved']);
        return response()->json(['data' => $sellerDocument, 'message' => 'Document approuvé.']);
    }

    public function reject(Request $request, SellerDocument $sellerDocument)
    {
        $sellerDocument->update(['status' => 'rejected']);
        return response()->json(['data' => $sellerDocument, 'message' => 'Document rejeté.']);
    }
}
