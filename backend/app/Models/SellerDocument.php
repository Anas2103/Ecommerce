<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerDocument extends Model
{
    protected $fillable = ['user_id', 'type', 'file_path', 'status'];

    public function user() { return $this->belongsTo(User::class); }
}
