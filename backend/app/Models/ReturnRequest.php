<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnRequest extends Model
{
    protected $fillable = ['order_id', 'order_item_id', 'user_id', 'reason', 'description', 'status', 'admin_notes'];

    public function order()     { return $this->belongsTo(Order::class); }
    public function orderItem() { return $this->belongsTo(OrderItem::class); }
    public function user()      { return $this->belongsTo(User::class); }
}
